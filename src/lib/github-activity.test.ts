import { describe, it, expect } from "vitest";
import {
  isWithinWindow,
  mapEventToActivities,
  filterAndMapEvents,
  ACTIVITY_WINDOW_DAYS,
  type GitHubEvent,
} from "./github-activity";

const NOW = new Date("2026-06-12T12:00:00Z");

const makeEvent = (overrides: Partial<GitHubEvent>): GitHubEvent => ({
  id: "evt1",
  type: "PushEvent",
  repo: { name: "owner/my-repo" },
  created_at: "2026-06-12T10:00:00Z",
  payload: { commits: [{ message: "fix: bug", sha: "abc123" }], ref: "refs/heads/main" },
  ...overrides,
});

describe("isWithinWindow", () => {
  it("returns true for a timestamp within the window", () => {
    const ts = "2026-06-10T00:00:00Z"; // 2 days ago
    expect(isWithinWindow(ts, 7, NOW)).toBe(true);
  });

  it("returns true for a timestamp exactly at the boundary", () => {
    const ts = "2026-06-05T12:00:00Z"; // exactly 7 days ago
    expect(isWithinWindow(ts, 7, NOW)).toBe(true);
  });

  it("returns false for a timestamp before the window", () => {
    const ts = "2026-06-04T00:00:00Z"; // 8+ days ago
    expect(isWithinWindow(ts, 7, NOW)).toBe(false);
  });

  it("uses ACTIVITY_WINDOW_DAYS as the default window", () => {
    expect(ACTIVITY_WINDOW_DAYS).toBe(7);
  });
});

describe("mapEventToActivities", () => {
  describe("PushEvent", () => {
    it("maps each commit to a separate ActivityEvent", () => {
      const event = makeEvent({
        payload: {
          commits: [
            { message: "feat: add x", sha: "aaa" },
            { message: "fix: bug\n\ndetails", sha: "bbb" },
          ],
          ref: "refs/heads/feature",
        },
      });
      const result = mapEventToActivities(event);
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe("commit");
      expect(result[0].title).toBe("feat: add x");
      expect(result[0].repo).toBe("my-repo");
      expect(result[0].branch).toBe("feature");
      expect(result[0].url).toContain("aaa");
    });

    it("truncates commit message at first newline", () => {
      const event = makeEvent({
        payload: {
          commits: [{ message: "fix: thing\n\nbody text", sha: "ccc" }],
          ref: "refs/heads/main",
        },
      });
      const result = mapEventToActivities(event);
      expect(result[0].title).toBe("fix: thing");
    });

    it("caps at 3 commits per push", () => {
      const event = makeEvent({
        payload: {
          commits: [
            { message: "a", sha: "1" },
            { message: "b", sha: "2" },
            { message: "c", sha: "3" },
            { message: "d", sha: "4" },
          ],
          ref: "refs/heads/main",
        },
      });
      const result = mapEventToActivities(event);
      expect(result).toHaveLength(3);
    });

    it("uses repo short name (after slash)", () => {
      const event = makeEvent({ repo: { name: "org/long-repo-name" } });
      const result = mapEventToActivities(event);
      expect(result[0].repo).toBe("long-repo-name");
    });

    it("returns empty array when commits is missing", () => {
      const event = makeEvent({ payload: { ref: "refs/heads/main" } });
      const result = mapEventToActivities(event);
      expect(result).toHaveLength(0);
    });
  });

  describe("PullRequestEvent", () => {
    it("maps opened PR to pr_opened", () => {
      const event = makeEvent({
        type: "PullRequestEvent",
        payload: {
          action: "opened",
          pull_request: { title: "New feature", html_url: "https://github.com/pr/1", merged: false },
        },
      });
      const result = mapEventToActivities(event);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("pr_opened");
      expect(result[0].title).toBe("New feature");
      expect(result[0].url).toBe("https://github.com/pr/1");
    });

    it("maps closed+merged PR to pr_merged", () => {
      const event = makeEvent({
        type: "PullRequestEvent",
        payload: {
          action: "closed",
          pull_request: { title: "Merged PR", html_url: "https://github.com/pr/2", merged: true },
        },
      });
      const result = mapEventToActivities(event);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("pr_merged");
    });

    it("ignores closed PR that is not merged", () => {
      const event = makeEvent({
        type: "PullRequestEvent",
        payload: {
          action: "closed",
          pull_request: { title: "Closed PR", html_url: "https://github.com/pr/3", merged: false },
        },
      });
      const result = mapEventToActivities(event);
      expect(result).toHaveLength(0);
    });

    it("ignores PR events with unrecognized action", () => {
      const event = makeEvent({
        type: "PullRequestEvent",
        payload: {
          action: "labeled",
          pull_request: { title: "Some PR", html_url: "https://github.com/pr/4" },
        },
      });
      const result = mapEventToActivities(event);
      expect(result).toHaveLength(0);
    });

    it("returns empty array when pull_request payload is absent", () => {
      const event = makeEvent({
        type: "PullRequestEvent",
        payload: { action: "opened" },
      });
      const result = mapEventToActivities(event);
      expect(result).toHaveLength(0);
    });
  });

  describe("IssuesEvent", () => {
    it("maps opened issue to issue_opened", () => {
      const event = makeEvent({
        type: "IssuesEvent",
        payload: {
          action: "opened",
          issue: { title: "Bug report", html_url: "https://github.com/issues/1" },
        },
      });
      const result = mapEventToActivities(event);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("issue_opened");
      expect(result[0].title).toBe("Bug report");
    });

    it("maps closed issue to issue_closed", () => {
      const event = makeEvent({
        type: "IssuesEvent",
        payload: {
          action: "closed",
          issue: { title: "Fixed bug", html_url: "https://github.com/issues/2" },
        },
      });
      const result = mapEventToActivities(event);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("issue_closed");
    });

    it("ignores issue events with unrecognized action", () => {
      const event = makeEvent({
        type: "IssuesEvent",
        payload: {
          action: "labeled",
          issue: { title: "Some issue", html_url: "https://github.com/issues/3" },
        },
      });
      const result = mapEventToActivities(event);
      expect(result).toHaveLength(0);
    });
  });

  describe("unrecognized event types", () => {
    it("returns empty array for unknown event type", () => {
      const event = makeEvent({ type: "WatchEvent", payload: { action: "started" } });
      const result = mapEventToActivities(event);
      expect(result).toHaveLength(0);
    });

    it("returns empty array for null event type", () => {
      const event = makeEvent({ type: null });
      const result = mapEventToActivities(event);
      expect(result).toHaveLength(0);
    });
  });
});

describe("filterAndMapEvents", () => {
  it("includes events within the 7-day window", () => {
    const event = makeEvent({ created_at: "2026-06-10T00:00:00Z" });
    const result = filterAndMapEvents([event], NOW);
    expect(result.length).toBeGreaterThan(0);
  });

  it("excludes events older than 7 days", () => {
    const event = makeEvent({ created_at: "2026-06-01T00:00:00Z" });
    const result = filterAndMapEvents([event], NOW);
    expect(result).toHaveLength(0);
  });

  it("excludes events with null created_at", () => {
    const event = makeEvent({ created_at: null });
    const result = filterAndMapEvents([event], NOW);
    expect(result).toHaveLength(0);
  });

  it("includes repo context in each ActivityEvent", () => {
    const event = makeEvent({
      repo: { name: "owner/cool-project" },
      created_at: "2026-06-11T00:00:00Z",
    });
    const result = filterAndMapEvents([event], NOW);
    expect(result[0].repo).toBe("cool-project");
  });

  it("returns multiple activity events from multiple qualifying events", () => {
    const events = [
      makeEvent({
        id: "e1",
        created_at: "2026-06-11T00:00:00Z",
        payload: { commits: [{ message: "commit a", sha: "sha1" }], ref: "refs/heads/main" },
      }),
      makeEvent({
        id: "e2",
        type: "PullRequestEvent",
        created_at: "2026-06-10T00:00:00Z",
        payload: {
          action: "opened",
          pull_request: { title: "New PR", html_url: "https://github.com/pr/5" },
        },
      }),
    ];
    const result = filterAndMapEvents(events, NOW);
    expect(result).toHaveLength(2);
    const types = result.map((r) => r.type);
    expect(types).toContain("commit");
    expect(types).toContain("pr_opened");
  });
});
