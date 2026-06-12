---
id: "36195537-b474-4959-a6fb-df19851ac713"
level: "epic"
title: "Local Task Store (Prisma + SQLite)"
status: "pending"
priority: "critical"
source: "User decision 2026-06-12: Prisma+SQLite default, Notion optional via token"
description: "Self-contained local database as the default source of truth for tasks/assignments. Prisma + SQLite produces Task[] (matching src/lib/types.ts). Notion becomes an optional source that merges in only when NOTION_TOKEN is present. Everything downstream (gap-detection, UI) is unchanged since it consumes Task[]."
---

## Children

| Title | Status |
|-------|--------|
| [Create /api/tasks route — Prisma default, merge Notion when token present](./create-api-tasks-route-prisma-7b71fd.md) | pending |
| [Seed the database with sample tasks from mock-data](./seed-the-database-with-sample-dac331.md) | pending |
| [Set up Prisma with SQLite — schema, client singleton, initial migration](./set-up-prisma-with-sqlite-4dcfe5.md) | completed |
