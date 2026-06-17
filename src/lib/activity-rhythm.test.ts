import { describe, it, expect } from "vitest";
import { aggregateRhythm } from "./activity-rhythm";
import type { ActivityEvent } from "./types";

const NOW = new Date("2026-06-12T12:00:00");

function ev(type: ActivityEvent["type"], timestamp: string): ActivityEvent {
  return { id: `${type}-${timestamp}`, type, title: type, repo: "r", timestamp };
}

describe("aggregateRhythm", () => {
  it("returns one bucket per day in the window, oldest first", () => {
    const out = aggregateRhythm([], 14, NOW);
    expect(out).toHaveLength(14);
    expect(out[0].date).toBe("2026-05-30");
    expect(out[13].date).toBe("2026-06-12");
  });

  it("zero-fills empty days", () => {
    const out = aggregateRhythm([], 7, NOW);
    expect(out.every((d) => d.commits === 0 && d.prsOpened === 0 && d.prsMerged === 0 && d.issuesClosed === 0)).toBe(true);
  });

  it("counts each event type into the correct field", () => {
    const events = [
      ev("commit", "2026-06-12T09:00:00"),
      ev("commit", "2026-06-12T10:00:00"),
      ev("pr_opened", "2026-06-12T11:00:00"),
      ev("pr_merged", "2026-06-12T11:30:00"),
      ev("issue_closed", "2026-06-12T11:45:00"),
    ];
    const today = aggregateRhythm(events, 14, NOW).at(-1)!;
    expect(today).toMatchObject({ commits: 2, prsOpened: 1, prsMerged: 1, issuesClosed: 1 });
  });

  it("ignores issue_opened (not charted)", () => {
    const out = aggregateRhythm([ev("issue_opened", "2026-06-12T09:00:00")], 14, NOW).at(-1)!;
    expect(out).toMatchObject({ commits: 0, prsOpened: 0, prsMerged: 0, issuesClosed: 0 });
  });

  it("drops events outside the window", () => {
    const out = aggregateRhythm([ev("commit", "2026-01-01T09:00:00")], 14, NOW);
    expect(out.reduce((s, d) => s + d.commits, 0)).toBe(0);
  });

  it("places events on the correct day", () => {
    const out = aggregateRhythm([ev("commit", "2026-06-10T08:00:00")], 14, NOW);
    const day = out.find((d) => d.date === "2026-06-10")!;
    expect(day.commits).toBe(1);
  });
});
