---
id: "dac331d6-59da-4e1c-87a0-f667c63c150a"
level: "task"
title: "Seed the database with sample tasks from mock-data"
status: "pending"
priority: "high"
tags:
  - "backend"
  - "data"
blockedBy:
  - "4dcfe521-97ae-41ae-bbb7-4d539f698282"
acceptanceCriteria:
  - "prisma/seed.ts inserts the sample tasks currently in src/lib/mock-data.ts into the Task table"
  - "Wired as prisma db seed (package.json prisma.seed) and/or an npm run seed script"
  - "Idempotent — safe to run repeatedly without duplicating rows (upsert by id)"
---
