"use client";

import type { ActivityEvent } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, { icon: string; color: string }> = {
  commit: { icon: "C", color: "bg-blue-500/20 text-blue-400" },
  pr_opened: { icon: "PR", color: "bg-purple-500/20 text-purple-400" },
  pr_merged: { icon: "M", color: "bg-emerald-500/20 text-emerald-400" },
  issue_closed: { icon: "✓", color: "bg-emerald-500/20 text-emerald-400" },
  issue_opened: { icon: "+", color: "bg-amber-500/20 text-amber-400" },
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold">Recent Activity</h2>
        <p className="text-xs text-[var(--text-3)]">Commits, PRs, and issues across your repos</p>
      </div>
      <div className="divide-y divide-[var(--border)] max-h-[400px] overflow-y-auto">
        {sorted.map((event) => {
          const typeInfo = typeIcons[event.type] ?? { icon: "?", color: "bg-gray-500/20 text-gray-400" };
          return (
            <div
              key={event.id}
              className="px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors flex items-start gap-3"
            >
              <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${typeInfo.color}`}>
                {typeInfo.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{event.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[0.65rem] text-[var(--text-3)]">{event.repo}</span>
                  {event.branch && (
                    <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-3)] font-mono">
                      {event.branch}
                    </span>
                  )}
                  <span className="text-[0.6rem] text-[var(--text-3)]">
                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                  </span>
                  {event.matchedTaskId && (
                    <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      linked
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
