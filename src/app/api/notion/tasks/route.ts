import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import type { Task, Priority, TaskStatus } from "@/lib/types";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints/common";

type PageProperty = PageObjectResponse["properties"][string];

function isFullPage(result: unknown): result is PageObjectResponse {
  return (
    result !== null &&
    typeof result === "object" &&
    "object" in result &&
    (result as Record<string, unknown>).object === "page" &&
    "properties" in result &&
    "url" in result &&
    "last_edited_time" in result
  );
}

function getProp(
  props: PageObjectResponse["properties"],
  ...names: string[]
): PageProperty | undefined {
  for (const name of names) {
    if (name in props) return props[name];
  }
  return undefined;
}

function extractTitle(prop: PageProperty): string {
  if (prop.type === "title") return prop.title.map((t) => t.plain_text).join("");
  if (prop.type === "rich_text") return prop.rich_text.map((t) => t.plain_text).join("");
  return "";
}

function extractSelect(prop: PageProperty | undefined): string | undefined {
  if (!prop) return undefined;
  if (prop.type === "select") return prop.select?.name;
  if (prop.type === "status") return prop.status?.name;
  return undefined;
}

function extractMultiSelect(prop: PageProperty | undefined): string[] {
  if (!prop || prop.type !== "multi_select") return [];
  return prop.multi_select.map((s) => s.name);
}

function extractDate(prop: PageProperty | undefined): string | undefined {
  if (!prop || prop.type !== "date") return undefined;
  return prop.date?.start ?? undefined;
}

function extractPeople(prop: PageProperty | undefined): string | undefined {
  if (!prop || prop.type !== "people") return undefined;
  const first = prop.people[0];
  if (!first) return undefined;
  return "name" in first ? (first.name ?? undefined) : undefined;
}

function mapStatus(raw: string | undefined): TaskStatus {
  if (!raw) return "todo";
  const lower = raw.toLowerCase();
  if (lower.includes("progress") || lower.includes("doing") || lower.includes("active"))
    return "in_progress";
  if (lower.includes("done") || lower.includes("complete") || lower.includes("finish"))
    return "done";
  if (lower.includes("block") || lower.includes("hold") || lower.includes("wait"))
    return "blocked";
  return "todo";
}

function mapPriority(raw: string | undefined): Priority {
  if (!raw) return "none";
  const lower = raw.toLowerCase();
  if (lower.includes("urgent") || lower.includes("high") || lower.includes("critical"))
    return "high";
  if (lower.includes("medium") || lower.includes("normal") || lower.includes("mid"))
    return "medium";
  if (lower.includes("low")) return "low";
  return "none";
}

function pageToTask(page: PageObjectResponse): Task | null {
  const props = page.properties;

  const titleProp =
    getProp(props, "Name", "Title", "Task") ??
    Object.values(props).find((p) => p.type === "title");

  const title = titleProp ? extractTitle(titleProp) : "";
  if (!title.trim()) return null;

  const statusRaw = extractSelect(getProp(props, "Status", "State"));
  const priorityRaw = extractSelect(getProp(props, "Priority"));
  const projectRaw = extractSelect(getProp(props, "Project", "Epic", "Category"));
  const dueDate = extractDate(getProp(props, "Due Date", "Due", "Deadline"));
  const tags = extractMultiSelect(getProp(props, "Tags", "Labels"));
  const assignee = extractPeople(getProp(props, "Assignee", "Assigned To", "Owner"));

  return {
    id: page.id,
    title,
    source: "notion",
    sourceUrl: page.url,
    project: projectRaw,
    status: mapStatus(statusRaw),
    priority: mapPriority(priorityRaw),
    dueDate,
    tags: tags.length > 0 ? tags : undefined,
    lastActivity: page.last_edited_time,
    assignee,
  };
}

export async function GET() {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_TASKS_DATABASE_ID;

  if (!token) {
    return NextResponse.json(
      { error: "NOTION_TOKEN not configured" },
      { status: 500 }
    );
  }
  if (!databaseId) {
    return NextResponse.json(
      { error: "NOTION_TASKS_DATABASE_ID not configured" },
      { status: 500 }
    );
  }

  const notion = new Client({ auth: token });

  try {
    const response = await notion.dataSources.query({ data_source_id: databaseId });

    const tasks: Task[] = response.results
      .filter(isFullPage)
      .map(pageToTask)
      .filter((t): t is Task => t !== null);

    return NextResponse.json(tasks);
  } catch (error) {
    if (error !== null && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "unauthorized" || code === "restricted_resource") {
        return NextResponse.json(
          { error: "Notion authentication failed. Check your NOTION_TOKEN." },
          { status: 401 }
        );
      }
      if (code === "object_not_found") {
        return NextResponse.json(
          { error: "Notion database not found. Check your NOTION_TASKS_DATABASE_ID." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch Notion tasks" },
      { status: 500 }
    );
  }
}
