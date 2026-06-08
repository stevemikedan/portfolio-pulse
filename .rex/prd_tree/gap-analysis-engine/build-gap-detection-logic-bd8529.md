---
id: "bd852929-d43f-4b9e-9585-b468896b93b0"
level: "task"
title: "Build gap detection logic — compare assignments vs activity"
status: "pending"
priority: "critical"
tags:
  - "core"
  - "critical-path"
acceptanceCriteria:
  - "Function accepts Task[] and Activity[]"
  - "Identifies neglected tasks (no activity in 3+ days)"
  - "Identifies unplanned work (activity not matching any task)"
  - "Returns typed GapItem[] with category, severity, description"
---
