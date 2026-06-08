"use client";

interface StatCardsProps {
  totalTasks: number;
  inProgress: number;
  overdue: number;
  finishRate: number;
  activeRepos: number;
}

export function StatCards({ totalTasks, inProgress, overdue, finishRate, activeRepos }: StatCardsProps) {
  const cards = [
    { label: "Total Tasks", value: totalTasks, color: "text-blue-400" },
    { label: "In Progress", value: inProgress, color: "text-amber-400" },
    { label: "Overdue", value: overdue, color: overdue > 0 ? "text-red-400" : "text-emerald-400" },
    { label: "Finish Rate", value: `${Math.round(finishRate * 100)}%`, color: finishRate > 0.5 ? "text-emerald-400" : "text-amber-400" },
    { label: "Active Repos", value: activeRepos, color: "text-purple-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 hover:bg-[var(--bg-hover)] transition-colors"
        >
          <div className="text-[0.7rem] uppercase tracking-wider text-[var(--text-3)] mb-2">
            {card.label}
          </div>
          <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}
