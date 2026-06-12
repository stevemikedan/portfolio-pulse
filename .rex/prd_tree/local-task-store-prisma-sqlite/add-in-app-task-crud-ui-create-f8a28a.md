---
id: "f8a28ac9-9e5b-4f8a-a9f5-a36d1fe2ff7c"
level: "task"
title: "Add in-app task CRUD UI — create form, inline status/priority edit, delete"
status: "completed"
priority: "high"
tags:
  - "frontend"
  - "interactive"
blockedBy:
  - "7b71fda1-32bc-4613-a9fd-a92dabf89caa"
startedAt: "2026-06-12T20:40:22.786Z"
completedAt: "2026-06-12T20:45:55.706Z"
endedAt: "2026-06-12T20:45:55.706Z"
acceptanceCriteria:
  - "A \"New task\" form/modal creates a task (title, status, priority, project, dueDate)"
  - "Inline edit on AssignmentsList: change status and priority without a page reload"
  - "Per-task delete control"
  - "After any mutation, task data refetches (or optimistic update) so StatCards and GapAnalysis recompute live"
  - "Uses the client task hook; loading and error states handled"
---
