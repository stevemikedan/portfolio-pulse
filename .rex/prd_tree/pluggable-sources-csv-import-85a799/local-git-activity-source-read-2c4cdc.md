---
id: "2c4cdc0d-faff-4c62-b306-6055d4e58880"
level: "task"
title: "Local git activity source — read git log from repo paths, map to ActivityEvent"
status: "completed"
priority: "high"
tags:
  - "backend"
  - "data"
startedAt: "2026-06-12T20:52:28.895Z"
completedAt: "2026-06-12T20:59:07.654Z"
endedAt: "2026-06-12T20:59:07.654Z"
acceptanceCriteria:
  - "Configurable list of local repo paths (env var or config file)"
  - "GET /api/local/activity reads recent git log from each path and maps commits to ActivityEvent (type: commit, repo = folder name, branch, author, timestamp, message as title)"
  - "Handles non-repo / missing paths gracefully (skip with a warning, don't fail the whole response)"
  - "Results merge into the activity feed alongside GitHub activity (same ActivityEvent[] shape)"
  - "Respects a time window (e.g. last 14 days) consistent with the GitHub activity route"
---
