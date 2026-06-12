---
id: "4dcfe521-97ae-41ae-bbb7-4d539f698282"
level: "task"
title: "Set up Prisma with SQLite — schema, client singleton, initial migration"
status: "completed"
priority: "critical"
tags:
  - "backend"
  - "data"
  - "infra"
startedAt: "2026-06-12T20:08:12.882Z"
completedAt: "2026-06-12T20:12:30.278Z"
endedAt: "2026-06-12T20:12:30.278Z"
acceptanceCriteria:
  - "prisma and @prisma/client installed; prisma/schema.prisma uses the sqlite datasource (file:./dev.db)"
  - "Task model mirrors the Task interface in src/lib/types.ts (id, title, source, sourceUrl, project, status, priority, dueDate, tags, lastActivity, assignee); tags persisted as a JSON string is acceptable for SQLite"
  - "Prisma client singleton in src/lib/prisma.ts that survives Next dev hot-reload without leaking connections"
  - "Initial migration created (prisma migrate dev --name init) and npx prisma generate runs clean; dev.db gitignored"
  - "npx tsc --noEmit passes and existing tests still green"
---
