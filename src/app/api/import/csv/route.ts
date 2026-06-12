import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCSV } from "@/lib/csv-parser";
import { VALID_STATUSES, VALID_PRIORITIES } from "@/lib/task-helpers";

// Column name aliases — all lowercased, mapped to canonical column names.
const COLUMN_ALIASES: Record<string, string> = {
  name: "title",
  task: "title",
  "task name": "title",
  "due date": "duedate",
  "due_date": "duedate",
  due: "duedate",
  tag: "tags",
  label: "tags",
  labels: "tags",
  prio: "priority",
  proj: "project",
};

function normalizeHeader(h: string): string {
  const lower = h.toLowerCase().trim();
  return COLUMN_ALIASES[lower] ?? lower.replace(/[\s_-]+/g, "");
}

// Deterministic ID derived from the CSV title so re-importing updates rather than duplicates.
function makeDeterministicId(title: string): string {
  return "csv-" + Buffer.from(title.toLowerCase().trim()).toString("base64url");
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file uploaded (field name: file)" }, { status: 400 });
  }

  const text = await file.text();

  let rows: Record<string, string>[];
  try {
    rows = parseCSV(text);
  } catch {
    return NextResponse.json({ error: "Failed to parse CSV" }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "CSV has no data rows. Expected a header row followed by at least one data row." },
      { status: 400 },
    );
  }

  // Check that the 'title' column exists (after alias normalization).
  const normalizedKeys = Object.keys(rows[0]).map(normalizeHeader);
  if (!normalizedKeys.includes("title")) {
    return NextResponse.json(
      {
        error:
          'Missing required column "title". ' +
          "Accepted header names: title, name, task. " +
          "Sample header: title,status,priority,project,dueDate,tags",
      },
      { status: 400 },
    );
  }

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    // Normalize raw keys to canonical names.
    const raw = rows[i];
    const row: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      row[normalizeHeader(k)] = v;
    }

    const title = row.title?.trim();
    if (!title) {
      skipped++;
      continue;
    }

    const rawStatus = row.status?.toLowerCase().trim() ?? "";
    const status = (VALID_STATUSES as readonly string[]).includes(rawStatus) ? rawStatus : "todo";

    const rawPriority = row.priority?.toLowerCase().trim() ?? "";
    const priority = (VALID_PRIORITIES as readonly string[]).includes(rawPriority)
      ? rawPriority
      : "medium";

    // Tags: semicolon-separated list.
    const tags =
      row.tags?.trim()
        ? row.tags.split(";").map((t) => t.trim()).filter(Boolean)
        : undefined;

    // dueDate: accept YYYY-MM-DD or any Date-parseable string.
    let dueDate: string | null = null;
    if (row.duedate?.trim()) {
      const d = new Date(row.duedate.trim());
      if (!isNaN(d.getTime())) {
        dueDate = row.duedate.trim();
      }
    }

    const id = makeDeterministicId(title);

    try {
      await prisma.task.upsert({
        where: { id },
        create: {
          id,
          title,
          source: "csv",
          status,
          priority,
          project: row.project?.trim() || null,
          dueDate,
          tags: tags ? JSON.stringify(tags) : null,
          sourceUrl: null,
          lastActivity: null,
          assignee: null,
        },
        update: {
          title,
          status,
          priority,
          project: row.project?.trim() || null,
          dueDate,
          tags: tags ? JSON.stringify(tags) : null,
        },
      });
      imported++;
    } catch (err) {
      errors.push(
        `Row ${i + 2}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return NextResponse.json({ imported, skipped, errors });
}
