"use client";

import type { RhythmDataPoint } from "@/lib/types";
import { useMemo } from "react";

export function RhythmChart({ data }: { data: RhythmDataPoint[] }) {
  const maxCommits = useMemo(
    () => Math.max(...data.map((d) => d.commits), 1),
    [data]
  );

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold">Work Rhythm</h2>
        <p className="text-xs text-[var(--text-3)]">Daily activity over the past week</p>
      </div>
      <div className="p-4">
        <div className="flex items-end gap-2 h-32">
          {data.map((day) => {
            const height = (day.commits / maxCommits) * 100;
            const dayLabel = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
            const total = day.commits + day.prsOpened + day.prsMerged + day.issuesClosed;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[0.6rem] text-[var(--text-3)]">{total}</div>
                <div className="w-full relative" style={{ height: "100px" }}>
                  <div
                    className="absolute bottom-0 w-full rounded-t-sm bg-blue-500/60 hover:bg-blue-500/80 transition-colors"
                    style={{ height: `${height}%`, minHeight: day.commits > 0 ? "4px" : "0" }}
                    title={`${day.commits} commits, ${day.prsOpened} PRs opened, ${day.prsMerged} merged, ${day.issuesClosed} issues closed`}
                  />
                  {day.prsMerged > 0 && (
                    <div
                      className="absolute bottom-0 w-full rounded-t-sm bg-emerald-500/60"
                      style={{ height: `${(day.prsMerged / maxCommits) * 100}%`, minHeight: "4px" }}
                    />
                  )}
                </div>
                <div className="text-[0.65rem] text-[var(--text-3)]">{dayLabel}</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500/60" />
            <span className="text-[0.65rem] text-[var(--text-3)]">Commits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" />
            <span className="text-[0.65rem] text-[var(--text-3)]">PRs Merged</span>
          </div>
        </div>
      </div>
    </div>
  );
}
