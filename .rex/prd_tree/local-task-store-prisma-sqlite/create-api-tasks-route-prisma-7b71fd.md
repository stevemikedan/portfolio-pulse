---
id: "7b71fda1-32bc-4613-a9fd-a92dabf89caa"
level: "task"
title: "Create /api/tasks route — Prisma default, merge Notion when token present"
status: "completed"
priority: "critical"
tags:
  - "backend"
  - "api"
  - "data"
blockedBy:
  - "4dcfe521-97ae-41ae-bbb7-4d539f698282"
startedAt: "2026-06-12T20:18:57.470Z"
completedAt: "2026-06-12T20:21:49.840Z"
endedAt: "2026-06-12T20:21:49.840Z"
acceptanceCriteria:
  - "GET /api/tasks returns Task[] read from Prisma (the default source)"
  - "When NOTION_TOKEN is set, also pull tasks via the existing Notion route logic and merge into the result; when absent, return Prisma tasks only (no error)"
  - "Merge de-dupes (e.g. by source+sourceUrl or id) and returns the unified Task[] shape"
  - "Graceful error handling: a Notion failure does not break the local-task response"
commits:
  - {"hash":"1b646d4499a13c87905ab2816c106324e3c563e6","author":"Steve Daniel","authorEmail":"steve@endotech.us","timestamp":"2026-06-12T16:21:50-04:00"}
---
