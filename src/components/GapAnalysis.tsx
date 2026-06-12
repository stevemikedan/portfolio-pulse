"use client";

import type { GapItem, GapCategory, GapSeverity } from "@/lib/types";

const severityOrder: Record<GapSeverity, number> = { danger: 0, warning: 1, info: 2 };
const severityWeights: Record<GapSeverity, number> = { danger: 3, warning: 2, info: 1 };

const severityStyles: Record<GapSeverity, { border: string; bg: string }> = {
  danger: { border: "border-red-500/30", bg: "bg-red-500/5" },
  warning: { border: "border-amber-500/30", bg: "bg-amber-500/5" },
  info: { border: "border-blue-500/30", bg: "bg-blue-500/5" },
};

const typeLabels: Record<GapCategory, string> = {
  neglected: "Neglected",
  unplanned: "Unplanned Work",
  overloaded: "Overloaded",
};

export function GapAnalysis({ gaps }: { gaps: GapItem[] }) {
  const gapScore = gaps.reduce((sum, g) => sum + (severityWeights[g.severity] ?? 0), 0);

  const grouped = new Map<GapCategory, GapItem[]>();
  for (const gap of gaps) {
    const list = grouped.get(gap.type) ?? [];
    list.push(gap);
    grouped.set(gap.type, list);
  }

  const sortedCategories = [...grouped.entries()].sort(([, aItems], [, bItems]) => {
    const aWorst = Math.min(...aItems.map((g) => severityOrder[g.severity] ?? 3));
    const bWorst = Math.min(...bItems.map((g) => severityOrder[g.severity] ?? 3));
    return aWorst - bWorst;
  });

  for (const [, items] of sortedCategories) {
    items.sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3));
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold">The Gap</h2>
          <p className="text-xs text-[var(--text-3)]">Where assignments and activity don&apos;t align</p>
        </div>
        {gaps.length > 0 && (
          <div className="text-right">
            <div className="text-[0.6rem] text-[var(--text-3)] uppercase tracking-wider">Gap Score</div>
            <div className="text-lg font-bold text-red-400">{gapScore}</div>
          </div>
        )}
      </div>
      <div className="p-3 space-y-4 max-h-[400px] overflow-y-auto">
        {sortedCategories.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-3)] text-sm">
            No gaps detected — you&apos;re aligned!
          </div>
        ) : (
          sortedCategories.map(([category, items]) => (
            <div key={category}>
              <div className="text-[0.6rem] font-bold uppercase tracking-wider text-[var(--text-3)] mb-2">
                {typeLabels[category] ?? category}
              </div>
              <div className="space-y-2">
                {items.map((gap, i) => {
                  const style = severityStyles[gap.severity] ?? severityStyles.info;
                  return (
                    <div
                      key={i}
                      className={`rounded-lg border p-3 ${style.border} ${style.bg}`}
                    >
                      <div className="text-sm font-medium mb-1">{gap.label}</div>
                      <div className="text-xs text-[var(--text-2)] leading-relaxed">{gap.detail}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
