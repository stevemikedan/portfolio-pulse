---
id: "977ccffc-b2d8-4ce2-be6b-673ec309b07b"
level: "task"
title: "Add useTasks hook and wire dashboard to live /api/tasks data"
status: "completed"
priority: "medium"
tags:
  - "frontend"
  - "interactive"
blockedBy:
  - "7b71fda1-32bc-4613-a9fd-a92dabf89caa"
startedAt: "2026-06-12T20:24:15.271Z"
completedAt: "2026-06-12T20:26:46.477Z"
endedAt: "2026-06-12T20:26:46.477Z"
acceptanceCriteria:
  - "useTasks hook fetches /api/tasks on mount and returns { tasks, loading, error, refresh }"
  - "page.tsx renders a client dashboard container that sources tasks from useTasks instead of importing mockData directly"
  - "StatCards values (totalTasks, inProgress, overdue, etc.) are derived from the live tasks"
  - "Gaps recompute from live tasks via detectGaps(); GapAnalysis reflects real DB data"
  - "Loading and error states handled (skeleton/spinner + error message)"
---
