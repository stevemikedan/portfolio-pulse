import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  prismaTaskToTask,
  VALID_STATUSES,
  VALID_PRIORITIES,
} from "@/lib/task-helpers";
import type { Task } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

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

  // Validate allowed fields
  if ("status" in input && !VALID_STATUSES.includes(input.status as Task["status"])) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }
  if ("priority" in input && !VALID_PRIORITIES.includes(input.priority as Task["priority"])) {
    return NextResponse.json(
      { error: `priority must be one of: ${VALID_PRIORITIES.join(", ")}` },
      { status: 400 },
    );
  }
  if ("title" in input && (typeof input.title !== "string" || input.title.trim() === "")) {
    return NextResponse.json({ error: "title must be a non-empty string" }, { status: 400 });
  }
  if ("tags" in input && !Array.isArray(input.tags)) {
    return NextResponse.json({ error: "tags must be an array of strings" }, { status: 400 });
  }

  const data: Record<string, string | null> = {};
  if ("title" in input) data.title = (input.title as string).trim();
  if ("status" in input) data.status = input.status as string;
  if ("priority" in input) data.priority = input.priority as string;
  if ("project" in input) data.project = typeof input.project === "string" ? input.project : null;
  if ("dueDate" in input) data.dueDate = typeof input.dueDate === "string" ? input.dueDate : null;
  if ("tags" in input)
    data.tags = Array.isArray(input.tags) ? JSON.stringify(input.tags) : null;

  const updated = await prisma.task.update({ where: { id }, data });
  return NextResponse.json(prismaTaskToTask(updated));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
