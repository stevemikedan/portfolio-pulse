import { describe, it, expect } from "vitest";
import { detectGaps } from "./gap-detection";
import type { Task, ActivityEvent } from "./types";

const NOW = new Date("2026-06-12T12:00:00Z");

const makeTask = (overrides: Partial<Task>): Task => ({
  id: "t1",
  title: "Test Task",
  source: "notion",
  status: "todo",
  priority: "medium",
  ...overrides,
});

const makeActivity = (overrides: Partial<ActivityEvent>): ActivityEvent => ({
  id: "a1",
  type: "commit",
  title: "Some commit",
  repo: "test-repo",
  timestamp: "2026-06-12T10:00:00Z",
  ...overrides,
});

describe("detectGaps", () => {
  describe("neglected tasks", () => {
    it("flags a task with no lastActivity and no matching events", () => {
      const task = makeTask({ id: "t1", status: "todo", priority: "high", project: "MyProject" });
      const gaps = detectGaps([task], [], NOW);
      expect(gaps).toHaveLength(1);
      expect(gaps[0].type).toBe("neglected");
      expect(gaps[0].relatedTaskId).toBe("t1");
    });

    it("flags a task whose lastActivity is 3+ days ago", () => {
      const task = makeTask({
        id: "t1",
        status: "in_progress",
        priority: "high",
        lastActivity: "2026-06-08T00:00:00Z",
      });
      const gaps = detectGaps([task], [], NOW);
      expect(gaps).toHaveLength(1);
      expect(gaps[0].type).toBe("neglected");
      expect(gaps[0].label).toContain("4 days");
    });

    it("flags a task at exactly the 3-day threshold", () => {
      const task = makeTask({
        id: "t1",
        status: "todo",
        lastActivity: "2026-06-09T12:00:00Z",
      });
      const gaps = detectGaps([task], [], NOW);
      expect(gaps).toHaveLength(1);
      expect(gaps[0].type).toBe("neglected");
    });

    it("does not flag a task active within the last 3 days", () => {
      const task = makeTask({
        id: "t1",
        status: "in_progress",
        lastActivity: "2026-06-11T00:00:00Z",
      });
      const gaps = detectGaps([task], [], NOW);
      expect(gaps).toHaveLength(0);
    });

    it("uses matched activity event when more recent than lastActivity", () => {
      const task = makeTask({
        id: "t1",
        status: "in_progress",
        lastActivity: "2026-06-08T00:00:00Z",
      });
      const activity = makeActivity({
        timestamp: "2026-06-11T00:00:00Z",
        matchedTaskId: "t1",
      });
      const gaps = detectGaps([task], [activity], NOW);
      expect(gaps).toHaveLength(0);
    });

    it("uses the most recent of multiple matching events", () => {
      const task = makeTask({ id: "t1", status: "in_progress" });
      const activities = [
        makeActivity({ id: "a1", timestamp: "2026-06-01T00:00:00Z", matchedTaskId: "t1" }),
        makeActivity({ id: "a2", timestamp: "2026-06-11T00:00:00Z", matchedTaskId: "t1" }),
      ];
      const gaps = detectGaps([task], activities, NOW);
      expect(gaps).toHaveLength(0);
    });

    it("maps high priority to danger severity", () => {
      const task = makeTask({ priority: "high", status: "todo" });
      const gaps = detectGaps([task], [], NOW);
      expect(gaps[0].severity).toBe("danger");
    });

    it("maps medium priority to warning severity", () => {
      const task = makeTask({ priority: "medium", status: "todo" });
      const gaps = detectGaps([task], [], NOW);
      expect(gaps[0].severity).toBe("warning");
    });

    it("maps low priority to info severity", () => {
      const task = makeTask({ priority: "low", status: "todo" });
      const gaps = detectGaps([task], [], NOW);
      expect(gaps[0].severity).toBe("info");
    });

    it("maps none priority to info severity", () => {
      const task = makeTask({ priority: "none", status: "todo" });
      const gaps = detectGaps([task], [], NOW);
      expect(gaps[0].severity).toBe("info");
    });

    it("skips done tasks", () => {
      const task = makeTask({ status: "done" });
      const gaps = detectGaps([task], [], NOW);
      expect(gaps).toHaveLength(0);
    });

    it("skips blocked tasks", () => {
      const task = makeTask({ status: "blocked" });
      const gaps = detectGaps([task], [], NOW);
      expect(gaps).toHaveLength(0);
    });

    it("includes relatedTaskId on neglected gap", () => {
      const task = makeTask({ id: "task-abc", status: "todo" });
      const gaps = detectGaps([task], [], NOW);
      expect(gaps[0].relatedTaskId).toBe("task-abc");
    });

    it("uses project name in the label when available", () => {
      const task = makeTask({ status: "todo", project: "MyProject" });
      const gaps = detectGaps([task], [], NOW);
      expect(gaps[0].label).toContain("MyProject");
    });

    it("falls back to task title in the label when project is absent", () => {
      const task = makeTask({ status: "todo", title: "My Task Title", project: undefined });
      const gaps = detectGaps([task], [], NOW);
      expect(gaps[0].label).toContain("My Task Title");
    });
  });

  describe("unplanned work", () => {
    it("flags activity with no matched task", () => {
      const activity = makeActivity({ repo: "some-repo" });
      const gaps = detectGaps([], [activity], NOW);
      expect(gaps).toHaveLength(1);
      expect(gaps[0].type).toBe("unplanned");
      expect(gaps[0].label).toContain("some-repo");
    });

    it("groups unplanned events by repo", () => {
      const activities = [
        makeActivity({ id: "a1", repo: "repo-a" }),
        makeActivity({ id: "a2", repo: "repo-a" }),
        makeActivity({ id: "a3", repo: "repo-b" }),
      ];
      const gaps = detectGaps([], activities, NOW);
      const unplanned = gaps.filter((g) => g.type === "unplanned");
      expect(unplanned).toHaveLength(2);
      const repoA = unplanned.find((g) => g.label.includes("repo-a"));
      expect(repoA?.label).toContain("2 untracked events");
    });

    it("uses singular 'event' for a single unmatched activity", () => {
      const activity = makeActivity({ repo: "solo-repo" });
      const gaps = detectGaps([], [activity], NOW);
      expect(gaps[0].label).toContain("1 untracked event");
    });

    it("does not flag activity that is matched to a task", () => {
      const activity = makeActivity({ matchedTaskId: "t1" });
      const gaps = detectGaps([], [activity], NOW);
      expect(gaps.filter((g) => g.type === "unplanned")).toHaveLength(0);
    });

    it("assigns info severity to unplanned gaps", () => {
      const activity = makeActivity({ repo: "some-repo" });
      const gaps = detectGaps([], [activity], NOW);
      expect(gaps[0].severity).toBe("info");
    });

    it("does not include relatedTaskId on unplanned gaps", () => {
      const activity = makeActivity({ repo: "some-repo" });
      const gaps = detectGaps([], [activity], NOW);
      expect(gaps[0].relatedTaskId).toBeUndefined();
    });
  });

  describe("return type and shape", () => {
    it("returns empty array when no tasks or activity", () => {
      expect(detectGaps([], [], NOW)).toEqual([]);
    });

    it("returns empty array when all tasks are done with no unplanned activity", () => {
      const task = makeTask({ status: "done" });
      const activity = makeActivity({ matchedTaskId: "t1" });
      expect(detectGaps([task], [activity], NOW)).toEqual([]);
    });

    it("each gap item has required fields", () => {
      const task = makeTask({ status: "todo" });
      const gaps = detectGaps([task], [], NOW);
      expect(gaps[0]).toMatchObject({
        type: expect.any(String),
        label: expect.any(String),
        detail: expect.any(String),
        severity: expect.any(String),
      });
    });

    it("returns both neglected and unplanned gaps together", () => {
      const task = makeTask({ id: "t1", status: "todo" });
      const activity = makeActivity({ repo: "other-repo" });
      const gaps = detectGaps([task], [activity], NOW);
      expect(gaps.some((g) => g.type === "neglected")).toBe(true);
      expect(gaps.some((g) => g.type === "unplanned")).toBe(true);
    });
  });
});
