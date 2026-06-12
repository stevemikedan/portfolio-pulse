import { NextResponse } from "next/server";
import { fetchNotionTasks } from "@/lib/notion-tasks";

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

  try {
    const tasks = await fetchNotionTasks(token, databaseId);
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
