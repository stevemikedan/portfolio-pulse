import type { ActivityEvent, RhythmDataPoint } from "./types";

/** Maps an ActivityEvent.type to the RhythmDataPoint field it increments. */
const TYPE_FIELD: Partial<Record<ActivityEvent["type"], keyof Omit<RhythmDataPoint, "date">>> = {
  commit: "commits",
  pr_opened: "prsOpened",
  pr_merged: "prsMerged",
  issue_closed: "issuesClosed",
  // issue_opened is intentionally not charted
};

/** Local-time YYYY-MM-DD key for a date. */
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Buckets activity events into per-day counts over a trailing window.
 * Returns one RhythmDataPoint per day, oldest first, including empty days.
 */
export function aggregateRhythm(
  activity: ActivityEvent[],
  days = 14,
  now: Date = new Date(),
): RhythmDataPoint[] {
  const buckets = new Map<string, RhythmDataPoint>();
  const order: string[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    buckets.set(key, { date: key, commits: 0, prsOpened: 0, prsMerged: 0, issuesClosed: 0 });
    order.push(key);
  }

  for (const ev of activity) {
    const bucket = buckets.get(dayKey(new Date(ev.timestamp)));
    if (!bucket) continue; // outside the window
    const field = TYPE_FIELD[ev.type];
    if (field) bucket[field] += 1;
  }

  return order.map((k) => buckets.get(k)!);
}
