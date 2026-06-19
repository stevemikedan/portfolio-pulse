import { PrismaClient } from "@prisma/client";
import { mockData } from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  for (const task of mockData.tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {
        title: task.title,
        source: task.source,
        sourceUrl: task.sourceUrl ?? null,
        project: task.project ?? null,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ?? null,
        tags: task.tags ? JSON.stringify(task.tags) : null,
        lastActivity: task.lastActivity ?? null,
        assignee: task.assignee ?? null,
      },
      create: {
        id: task.id,
        title: task.title,
        source: task.source,
        sourceUrl: task.sourceUrl ?? null,
        project: task.project ?? null,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ?? null,
        tags: task.tags ? JSON.stringify(task.tags) : null,
        lastActivity: task.lastActivity ?? null,
        assignee: task.assignee ?? null,
      },
    });
  }
  console.log(`Seeded ${mockData.tasks.length} tasks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
