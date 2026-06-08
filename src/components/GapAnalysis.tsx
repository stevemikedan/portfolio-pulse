"use client";

import type { GapItem } from "@/lib/types";

const severityStyles: Record<string, { border: string; bg: string; icon: string }> = {
  danger: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    icon: "text-red-400",
  },
  warning: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    icon: "text-amber-400",
  },
  info: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    icon: "text-blue-400",
  },
};

const typeLabels: Record<string, string> = {
  neglected: "Neglected",
  unplanned: "Unplanned Work",
  overloaded: "Overloaded",
};

export function GapAnalysis({ gaps }: { gaps: GapItem[] }) {
  const sorted = [...gaps].sort((a, b) => {
    const order = { danger: 0, warning: 1, info: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold">The Gap</h2>
        <p className="text-xs text-[var(--text-3)]">Where assignments and activity don&apos;t align</p>
      </div>
      <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-3)] text-sm">
            No gaps detected — you&apos;re aligned!
          </div>
        ) : (
          sorted.map((gap, i) => {
            const style = severityStyles[gap.severity] ?? severityStyles.info;
            return (
              <div
                key={i}
                className={`rounded-lg border p-3 ${style.border} ${style.bg}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[0.6rem] font-bold uppercase tracking-wider ${style.icon}`}>
                    {typeLabels[gap.type] ?? gap.type}
                  </span>
                </div>
                <div className="text-sm font-medium mb-1">{gap.label}</div>
                <div className="text-xs text-[var(--text-2)] leading-relaxed">{gap.detail}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
