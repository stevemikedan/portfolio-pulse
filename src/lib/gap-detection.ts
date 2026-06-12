import type { Task, ActivityEvent, GapItem, GapSeverity } from "./types";

const NEGLECT_THRESHOLD_DAYS = 3;

function daysSince(isoDate: string, now: Date): number {
  return (now.getTime() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24);
}

function priorityToSeverity(priority: Task["priority"]): GapSeverity {
  if (priority === "high") return "danger";
  if (priority === "medium") return "warning";
  return "info";
}

export function detectGaps(
  tasks: Task[],
  activity: ActivityEvent[],
  now: Date = new Date()
): GapItem[] {
  const gaps: GapItem[] = [];

  // Build taskId → most recent matched activity timestamp
  const latestActivityByTask = new Map<string, string>();
  for (const event of activity) {
    if (event.matchedTaskId) {
      const existing = latestActivityByTask.get(event.matchedTaskId);
      if (!existing || event.timestamp > existing) {
        latestActivityByTask.set(event.matchedTaskId, event.timestamp);
      }
    }
  }

  // Neglected: active tasks with no recent activity
  for (const task of tasks) {
    if (task.status === "done" || task.status === "blocked") continue;

    const latestActivity = latestActivityByTask.get(task.id) ?? task.lastActivity;
    const projectName = task.project ?? task.title;

    if (!latestActivity) {
      gaps.push({
        type: "neglected",
        label: `${projectName} has no activity yet`,
        detail: `No activity found for "${task.title}". This is a ${task.priority}-priority task with no recorded progress.`,
        severity: priorityToSeverity(task.priority),
        relatedTaskId: task.id,
      });
    } else if (daysSince(latestActivity, now) >= NEGLECT_THRESHOLD_DAYS) {
      const days = Math.floor(daysSince(latestActivity, now));
      gaps.push({
        type: "neglected",
        label: `${projectName} has no activity in ${days} days`,
        detail: `Last activity was ${days} days ago. "${task.title}" is a ${task.priority}-priority task with no recent progress.`,
        severity: priorityToSeverity(task.priority),
        relatedTaskId: task.id,
      });
    }
  }

  // Unplanned: activity with no matched task, grouped by repo
  const unplannedByRepo = new Map<string, ActivityEvent[]>();
  for (const event of activity) {
    if (!event.matchedTaskId) {
      const list = unplannedByRepo.get(event.repo) ?? [];
      list.push(event);
      unplannedByRepo.set(event.repo, list);
    }
  }

  for (const [repo, events] of unplannedByRepo) {
    const count = events.length;
    gaps.push({
      type: "unplanned",
      label: `${count} untracked ${count === 1 ? "event" : "events"} on ${repo}`,
      detail: `Recent activity on "${repo}" doesn't match any tracked task. Consider adding a task or linking this work.`,
      severity: "info",
    });
  }

  return gaps;
}
