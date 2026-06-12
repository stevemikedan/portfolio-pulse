import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchNotionTasks } from "@/lib/notion-tasks";
import type { Task } from "@/lib/types";

function prismaTaskToTask(t: {
  id: string;
  title: string;
  source: string;
  sourceUrl: string | null;
  project: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  tags: string | null;
  lastActivity: string | null;
  assignee: string | null;
}): Task {
  return {
    id: t.id,
    title: t.title,
    source: t.source as Task["source"],
    sourceUrl: t.sourceUrl ?? undefined,
    project: t.project ?? undefined,
    status: t.status as Task["status"],
    priority: t.priority as Task["priority"],
    dueDate: t.dueDate ?? undefined,
    tags: t.tags ? (JSON.parse(t.tags) as string[]) : undefined,
    lastActivity: t.lastActivity ?? undefined,
    assignee: t.assignee ?? undefined,
  };
}

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
