---
id: "f93dc3fa-33c6-4973-893e-1fda07e2b869"
level: "task"
title: "CSV plan import — upload CSV, parse to tasks, insert into Prisma"
status: "pending"
priority: "high"
tags:
  - "backend"
  - "frontend"
  - "data"
  - "interactive"
acceptanceCriteria:
  - "POST /api/import/csv accepts an uploaded CSV and parses rows into the Task shape (title, status, priority, project, dueDate, tags; sensible header mapping + defaults)"
  - "Rows upsert into Prisma; returns a summary (imported / skipped / errors) without throwing on a single bad row"
  - "In-app upload control (file input) on the dashboard triggers the import and refetches so new tasks appear"
  - "Malformed CSV / missing required columns produce a clear error message, not a crash"
  - "A sample CSV format is documented (header row) for the demo"
---
