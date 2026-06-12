---
id: "bd852929-d43f-4b9e-9585-b468896b93b0"
level: "task"
title: "Build gap detection logic — compare assignments vs activity"
status: "completed"
priority: "critical"
tags:
  - "core"
  - "critical-path"
blockedBy:
  - "de2a4f0e-6e7b-468a-8e03-6857f078c8bb"
  - "a973d286-fb57-44e9-9cf5-27858fd7a49b"
startedAt: "2026-06-12T17:38:53.250Z"
completedAt: "2026-06-12T17:41:51.121Z"
endedAt: "2026-06-12T17:41:51.121Z"
acceptanceCriteria:
  - "Function accepts Task[] and Activity[]"
  - "Identifies neglected tasks (no activity in 3+ days)"
  - "Identifies unplanned work (activity not matching any task)"
  - "Returns typed GapItem[] with category, severity, description"
---
