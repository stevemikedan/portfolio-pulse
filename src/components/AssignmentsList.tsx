"use client";

import type { Task } from "@/lib/types";

const statusColors: Record<string, string> = {
  todo: "bg-purple-500/10 text-purple-400",
  in_progress: "bg-amber-500/10 text-amber-400",
  done: "bg-emerald-500/10 text-emerald-400",
  blocked: "bg-red-500/10 text-red-400",
};

const priorityDot: Record<string, string> = {
  high: "bg-red-400",
  medium: "bg-amber-400",
  low: "bg-blue-400",
  none: "bg-gray-500",
};

const sourceIcon: Record<string, string> = {
  notion: "N",
  github: "GH",
};

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function AssignmentsList({ tasks }: { tasks: Task[] }) {
  const sorted = [...tasks].sort((a, b) => {
    const prio = { high: 0, medium: 1, low: 2, none: 3 };
    const statusOrder = { in_progress: 0, todo: 1, blocked: 2, done: 3 };
    const diff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
    if (diff !== 0) return diff;
    return (prio[a.priority] ?? 3) - (prio[b.priority] ?? 3);
  });

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold">My Assignments</h2>
        <p className="text-xs text-[var(--text-3)]">From Notion + GitHub — sorted by status & priority</p>
      </div>
      <div className="divide-y divide-[var(--border)] max-h-[400px] overflow-y-auto">
        {sorted.map((task) => {
          const days = daysUntil(task.dueDate);
          const isOverdue = days !== null && days < 0;
          const isDueSoon = days !== null && days >= 0 && days <= 3;

          return (
            <div
              key={task.id}
              className="px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors flex items-start gap-3"
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityDot[task.priority]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium truncate">{task.title}</span>
                  {task.sourceUrl ? (
                    <a
                      href={task.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.6rem] px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-3)] hover:text-[var(--text-2)] flex-shrink-0"
                    >
                      {sourceIcon[task.source]}
                    </a>
                  ) : (
                    <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-3)] flex-shrink-0">
                      {sourceIcon[task.source]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {task.project && (
                    <span className="text-[0.65rem] text-[var(--text-3)]">{task.project}</span>
                  )}
                  <span className={`text-[0.6rem] px-1.5 py-0.5 rounded font-medium ${statusColors[task.status]}`}>
                    {task.status.replace("_", " ")}
                  </span>
                  {task.tags?.map((tag) => (
                    <span key={tag} className="text-[0.6rem] px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-3)]">
                      {tag}
                    </span>
                  ))}
                  {isOverdue && (
                    <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">
                      {Math.abs(days!)}d overdue
                    </span>
                  )}
                  {isDueSoon && (
                    <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">
                      due in {days}d
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
