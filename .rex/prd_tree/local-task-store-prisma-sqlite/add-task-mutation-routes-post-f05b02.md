---
id: "f05b02c9-babd-421e-94e9-a570b1dff4f6"
level: "task"
title: "Add task mutation routes — POST/PATCH/DELETE /api/tasks"
status: "completed"
priority: "high"
tags:
  - "backend"
  - "api"
  - "data"
  - "interactive"
startedAt: "2026-06-12T20:31:29.012Z"
completedAt: "2026-06-12T20:33:50.571Z"
endedAt: "2026-06-12T20:33:50.571Z"
acceptanceCriteria:
  - "POST /api/tasks creates a Task (validates required fields), persists via Prisma, returns the created Task"
  - "PATCH /api/tasks/[id] updates allowed fields (status, priority, title, project, dueDate, tags); 404 if missing; returns updated Task"
  - "DELETE /api/tasks/[id] removes the task; 404 if missing; returns success"
  - "Input validation and typed error responses; tags (de)serialized consistently with the GET /api/tasks route"
commits:
  - {"hash":"0222e2b3691f4015f58debac71799596b39f4b64","author":"Steve Daniel","authorEmail":"steve@endotech.us","timestamp":"2026-06-12T16:33:50-04:00"}
---
