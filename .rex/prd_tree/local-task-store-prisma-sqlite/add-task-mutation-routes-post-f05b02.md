---
id: "f05b02c9-babd-421e-94e9-a570b1dff4f6"
level: "task"
title: "Add task mutation routes — POST/PATCH/DELETE /api/tasks"
status: "pending"
priority: "high"
tags:
  - "backend"
  - "api"
  - "data"
  - "interactive"
acceptanceCriteria:
  - "POST /api/tasks creates a Task (validates required fields), persists via Prisma, returns the created Task"
  - "PATCH /api/tasks/[id] updates allowed fields (status, priority, title, project, dueDate, tags); 404 if missing; returns updated Task"
  - "DELETE /api/tasks/[id] removes the task; 404 if missing; returns success"
  - "Input validation and typed error responses; tags (de)serialized consistently with the GET /api/tasks route"
---
