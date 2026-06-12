import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchNotionTasks } from "@/lib/notion-tasks";
import {
  prismaTaskToTask,
  VALID_SOURCES,
  VALID_STATUSES,
  VALID_PRIORITIES,
} from "@/lib/task-helpers";
import type { Task } from "@/lib/types";

// Merge remote tasks over local ones, de-duping by id.
// Live remote data wins when IDs collide.
function mergeTasks(local: Task[], remote: Task[]): Task[] {
  const byId = new Map<string, Task>();
  for (const task of local) byId.set(task.id, task);
  for (const task of remote) byId.set(task.id, task);
  return Array.from(byId.values());
}

export async function GET() {
  const dbRows = await prisma.task.findMany();
  const localTasks = dbRows.map(prismaTaskToTask);

  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_TASKS_DATABASE_ID;

  if (!token || !databaseId) {
    return NextResponse.json(localTasks);
  }

  let notionTasks: Task[] = [];
  try {
    notionTasks = await fetchNotionTasks(token, databaseId);
  } catch {
    // Notion failure is non-fatal — return local tasks only
  }

  return NextResponse.json(mergeTasks(localTasks, notionTasks));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be an object" }, { status: 400 });
  }

  const input = body as Record<string, unknown>;

  // Validate required fields
  if (typeof input.title !== "string" || input.title.trim() === "") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!VALID_SOURCES.includes(input.source as Task["source"])) {
    return NextResponse.json(
      { error: `source must be one of: ${VALID_SOURCES.join(", ")}` },
      { status: 400 },
    );
  }
  if (!VALID_STATUSES.includes(input.status as Task["status"])) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }
  if (!VALID_PRIORITIES.includes(input.priority as Task["priority"])) {
    return NextResponse.json(
      { error: `priority must be one of: ${VALID_PRIORITIES.join(", ")}` },
      { status: 400 },
    );
  }
  if (input.tags !== undefined && !Array.isArray(input.tags)) {
    return NextResponse.json({ error: "tags must be an array of strings" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const tags = Array.isArray(input.tags) ? (input.tags as string[]) : undefined;

  const created = await prisma.task.create({
    data: {
      id,
      title: (input.title as string).trim(),
      source: input.source as string,
      status: input.status as string,
      priority: input.priority as string,
      sourceUrl: typeof input.sourceUrl === "string" ? input.sourceUrl : null,
      project: typeof input.project === "string" ? input.project : null,
      dueDate: typeof input.dueDate === "string" ? input.dueDate : null,
      tags: tags ? JSON.stringify(tags) : null,
      lastActivity: typeof input.lastActivity === "string" ? input.lastActivity : null,
      assignee: typeof input.assignee === "string" ? input.assignee : null,
    },
  });

  return NextResponse.json(prismaTaskToTask(created), { status: 201 });
}
