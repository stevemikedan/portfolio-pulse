"use client";

import type { Task, TaskStatus, Priority } from "@/lib/types";

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
  csv: "CSV",
};

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

interface AssignmentsListProps {
  tasks: Task[];
  onNew?: () => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onPriorityChange: (id: string, priority: Priority) => void;
  onDelete: (id: string) => void;
  headerActions?: React.ReactNode;
}

export function AssignmentsList({
  tasks,
  onNew,
  onStatusChange,
  onPriorityChange,
  onDelete,
  headerActions,
}: AssignmentsListProps) {
  const sorted = [...tasks].sort((a, b) => {
    const prio = { high: 0, medium: 1, low: 2, none: 3 };
    const statusOrder = { in_progress: 0, todo: 1, blocked: 2, done: 3 };
    const diff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
    if (diff !== 0) return diff;
    return (prio[a.priority] ?? 3) - (prio[b.priority] ?? 3);
  });

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">My Assignments</h2>
          <p className="text-xs text-[var(--text-3)]">
            From Notion + GitHub — sorted by status &amp; priority
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {headerActions}
          {onNew && (
            <button
              type="button"
              onClick={onNew}
              className="text-xs px-2.5 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              + New
            </button>
          )}
        </div>
      </div>
      <div className="divide-y divide-[var(--border)] max-h-[400px] overflow-y-auto">
        {sorted.map((task) => {
          const days = daysUntil(task.dueDate);
          const isOverdue = days !== null && days < 0;
          const isDueSoon = days !== null && days >= 0 && days <= 3;

          return (
            <div
              key={task.id}
              className="px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors flex items-start gap-3 group"
            >
              <div
                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityDot[task.priority]}`}
              />
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
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                    aria-label="Status"
                    className={`text-[0.6rem] px-1.5 py-0.5 rounded font-medium border-0 cursor-pointer appearance-none ${statusColors[task.status]}`}
                  >
                    <option value="todo">to do</option>
                    <option value="in_progress">in progress</option>
                    <option value="done">done</option>
                    <option value="blocked">blocked</option>
                  </select>
                  <select
                    value={task.priority}
                    onChange={(e) => onPriorityChange(task.id, e.target.value as Priority)}
                    aria-label="Priority"
                    className="text-[0.6rem] px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-3)] border-0 cursor-pointer appearance-none"
                  >
                    <option value="high">↑ high</option>
                    <option value="medium">→ medium</option>
                    <option value="low">↓ low</option>
                    <option value="none">– none</option>
                  </select>
                  {task.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[0.6rem] px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-3)]"
                    >
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
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                aria-label="Delete task"
                className="flex-shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center text-[0.65rem] text-[var(--text-3)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
