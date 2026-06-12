import type { Task } from "@/lib/types";

export type PrismaTaskRow = {
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
};

export function prismaTaskToTask(t: PrismaTaskRow): Task {
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

export const VALID_SOURCES = ["notion", "github"] as const;
export const VALID_STATUSES = ["todo", "in_progress", "done", "blocked"] as const;
export const VALID_PRIORITIES = ["high", "medium", "low", "none"] as const;
