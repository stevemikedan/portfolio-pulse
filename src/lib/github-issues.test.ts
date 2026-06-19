import { describe, it, expect } from "vitest";
import {
  mapLabelsToPriority,
  mapStateToStatus,
  mapIssueToTask,
  type GitHubIssue,
} from "./github-issues";

const makeIssue = (overrides: Partial<GitHubIssue> = {}): GitHubIssue => ({
  id: 123456,
  number: 42,
  title: "Fix the bug",
  html_url: "https://github.com/owner/repo/issues/42",
  state: "open",
  labels: [],
  updated_at: "2026-06-10T08:00:00Z",
  repository_url: "https://api.github.com/repos/owner/repo",
  repository: { name: "repo" },
  ...overrides,
});

describe("mapLabelsToPriority", () => {
  it("returns none when there are no labels", () => {
    expect(mapLabelsToPriority([])).toBe("none");
  });

  it("maps 'high' label to high priority", () => {
    expect(mapLabelsToPriority([{ name: "high" }])).toBe("high");
  });

  it("maps 'critical' label to high priority", () => {
    expect(mapLabelsToPriority([{ name: "critical" }])).toBe("high");
  });

  it("maps 'urgent' label to high priority", () => {
    expect(mapLabelsToPriority([{ name: "urgent" }])).toBe("high");
  });

  it("maps 'p0' label to high priority", () => {
    expect(mapLabelsToPriority([{ name: "P0" }])).toBe("high");
  });

  it("maps 'priority: high' label to high priority", () => {
    expect(mapLabelsToPriority([{ name: "priority: high" }])).toBe("high");
  });

  it("maps 'medium' label to medium priority", () => {
    expect(mapLabelsToPriority([{ name: "medium" }])).toBe("medium");
  });

  it("maps 'normal' label to medium priority", () => {
    expect(mapLabelsToPriority([{ name: "normal" }])).toBe("medium");
  });

  it("maps 'p1' label to medium priority", () => {
    expect(mapLabelsToPriority([{ name: "p1" }])).toBe("medium");
  });

  it("maps 'low' label to low priority", () => {
    expect(mapLabelsToPriority([{ name: "low" }])).toBe("low");
  });

  it("maps 'p2' label to low priority", () => {
    expect(mapLabelsToPriority([{ name: "p2" }])).toBe("low");
  });

  it("accepts string labels", () => {
    expect(mapLabelsToPriority(["high"])).toBe("high");
    expect(mapLabelsToPriority(["medium"])).toBe("medium");
    expect(mapLabelsToPriority(["low"])).toBe("low");
  });

  it("uses the first matching priority label", () => {
    expect(mapLabelsToPriority([{ name: "high" }, { name: "low" }])).toBe("high");
    expect(mapLabelsToPriority([{ name: "low" }, { name: "high" }])).toBe("low");
  });

  it("returns none for unrelated labels", () => {
    expect(mapLabelsToPriority([{ name: "bug" }, { name: "enhancement" }])).toBe("none");
  });

  it("handles labels with null or undefined name", () => {
    expect(mapLabelsToPriority([{ name: null }, { name: undefined }])).toBe("none");
  });

  it("is case-insensitive", () => {
    expect(mapLabelsToPriority([{ name: "HIGH" }])).toBe("high");
    expect(mapLabelsToPriority([{ name: "Medium" }])).toBe("medium");
  });
});

describe("mapStateToStatus", () => {
  it("maps closed state to done", () => {
    expect(mapStateToStatus("closed", [])).toBe("done");
  });

  it("maps closed state to done regardless of labels", () => {
    expect(mapStateToStatus("closed", [{ name: "in progress" }])).toBe("done");
  });

  it("maps open state to todo by default", () => {
    expect(mapStateToStatus("open", [])).toBe("todo");
  });

  it("maps 'blocked' label to blocked status", () => {
    expect(mapStateToStatus("open", [{ name: "blocked" }])).toBe("blocked");
  });

  it("maps 'on hold' label to blocked status", () => {
    expect(mapStateToStatus("open", [{ name: "on hold" }])).toBe("blocked");
  });

  it("maps 'waiting' label to blocked status", () => {
    expect(mapStateToStatus("open", [{ name: "waiting" }])).toBe("blocked");
  });

  it("maps 'in progress' label to in_progress status", () => {
    expect(mapStateToStatus("open", [{ name: "in progress" }])).toBe("in_progress");
  });

  it("maps 'wip' label to in_progress status", () => {
    expect(mapStateToStatus("open", [{ name: "wip" }])).toBe("in_progress");
  });

  it("maps 'doing' label to in_progress status", () => {
    expect(mapStateToStatus("open", [{ name: "doing" }])).toBe("in_progress");
  });

  it("maps 'in-progress' label to in_progress status", () => {
    expect(mapStateToStatus("open", [{ name: "in-progress" }])).toBe("in_progress");
  });

  it("blocked takes precedence when listed first", () => {
    expect(mapStateToStatus("open", [{ name: "blocked" }, { name: "wip" }])).toBe("blocked");
  });

  it("accepts string labels", () => {
    expect(mapStateToStatus("open", ["blocked"])).toBe("blocked");
    expect(mapStateToStatus("open", ["wip"])).toBe("in_progress");
  });
});

describe("mapIssueToTask", () => {
  it("maps basic fields correctly", () => {
    const issue = makeIssue();
    const task = mapIssueToTask(issue);

    expect(task.id).toBe("github-issue-123456");
    expect(task.title).toBe("Fix the bug");
    expect(task.source).toBe("github");
    expect(task.sourceUrl).toBe("https://github.com/owner/repo/issues/42");
    expect(task.lastActivity).toBe("2026-06-10T08:00:00Z");
  });

  it("sets source to github", () => {
    const task = mapIssueToTask(makeIssue());
    expect(task.source).toBe("github");
  });

  it("extracts project from repository.name when available", () => {
    const task = mapIssueToTask(makeIssue({ repository: { name: "my-project" } }));
    expect(task.project).toBe("my-project");
  });

  it("extracts project from repository_url when repository is absent", () => {
    const task = mapIssueToTask(
      makeIssue({
        repository: undefined,
        repository_url: "https://api.github.com/repos/owner/fallback-repo",
      })
    );
    expect(task.project).toBe("fallback-repo");
  });

  it("extracts project from repository_url when repository is null", () => {
    const task = mapIssueToTask(
      makeIssue({
        repository: null,
        repository_url: "https://api.github.com/repos/owner/null-repo",
      })
    );
    expect(task.project).toBe("null-repo");
  });

  it("maps labels to tags", () => {
    const task = mapIssueToTask(
      makeIssue({ labels: [{ name: "bug" }, { name: "help wanted" }] })
    );
    expect(task.tags).toEqual(["bug", "help wanted"]);
  });

  it("maps string labels to tags", () => {
    const task = mapIssueToTask(makeIssue({ labels: ["bug", "enhancement"] }));
    expect(task.tags).toEqual(["bug", "enhancement"]);
  });

  it("omits tags when there are no labels", () => {
    const task = mapIssueToTask(makeIssue({ labels: [] }));
    expect(task.tags).toBeUndefined();
  });

  it("maps open state with no labels to todo status", () => {
    const task = mapIssueToTask(makeIssue({ state: "open", labels: [] }));
    expect(task.status).toBe("todo");
  });

  it("maps closed state to done status", () => {
    const task = mapIssueToTask(makeIssue({ state: "closed", labels: [] }));
    expect(task.status).toBe("done");
  });

  it("maps priority from labels", () => {
    const task = mapIssueToTask(makeIssue({ labels: [{ name: "high" }] }));
    expect(task.priority).toBe("high");
  });

  it("returns none priority when no priority label", () => {
    const task = mapIssueToTask(makeIssue({ labels: [{ name: "bug" }] }));
    expect(task.priority).toBe("none");
  });

  it("does not set assignee (not in GitHubIssue interface)", () => {
    const task = mapIssueToTask(makeIssue());
    expect(task.assignee).toBeUndefined();
  });

  it("does not set dueDate", () => {
    const task = mapIssueToTask(makeIssue());
    expect(task.dueDate).toBeUndefined();
  });

  it("skips labels with empty names in tags", () => {
    const task = mapIssueToTask(
      makeIssue({ labels: [{ name: "" }, { name: "bug" }, { name: null }] })
    );
    expect(task.tags).toEqual(["bug"]);
  });
});
