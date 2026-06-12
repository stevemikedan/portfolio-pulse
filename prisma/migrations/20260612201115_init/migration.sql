-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "project" TEXT,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "dueDate" TEXT,
    "tags" TEXT,
    "lastActivity" TEXT,
    "assignee" TEXT
);
