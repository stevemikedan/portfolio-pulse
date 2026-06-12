---
id: "85a79971-2c28-45f6-acaf-82d7b8ba4d72"
level: "epic"
title: "Pluggable Sources — CSV import & Local Git"
status: "completed"
priority: "high"
source: "User brainstorm 2026-06-12: plug in local repos + CSV plans"
startedAt: "2026-06-12T20:59:07.820Z"
completedAt: "2026-06-12T20:59:07.820Z"
endedAt: "2026-06-12T20:59:07.820Z"
description: "Self-contained data sources that need no OAuth/tokens. CSV upload parses plan files into Prisma tasks; local-git reads git log from configured repo paths and maps commits to ActivityEvent. Both slot into the existing Task[]/ActivityEvent[] merge pattern without touching gap-detection or the UI. Chosen for the hackathon demo (no external setup)."
---

## Children

| Title | Status |
|-------|--------|
| [CSV plan import — upload CSV, parse to tasks, insert into Prisma](./csv-plan-import-upload-csv-f93dc3.md) | completed |
| [Local git activity source — read git log from repo paths, map to ActivityEvent](./local-git-activity-source-read-2c4cdc.md) | completed |
