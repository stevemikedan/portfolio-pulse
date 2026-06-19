export type Priority = "high" | "medium" | "low" | "none";
export type TaskSource = "notion" | "github" | "csv";
export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";

export interface Task {
  id: string;
  title: string;
  source: TaskSource;
  sourceUrl?: string;
  project?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  tags?: string[];
  lastActivity?: string; // ISO date
  assignee?: string;
}

export interface ActivityEvent {
  id: string;
  type: "commit" | "pr_opened" | "pr_merged" | "issue_closed" | "issue_opened";
  title: string;
  repo: string;
  branch?: string;
  timestamp: string; // ISO date
  url?: string;
  matchedTaskId?: string; // links activity to a task
}

export type GapCategory = "neglected" | "unplanned" | "overloaded";
export type GapSeverity = "warning" | "info" | "danger";

export interface GapItem {
  type: GapCategory;
  label: string;
  detail: string;
  severity: GapSeverity;
  relatedTaskId?: string;
}

export interface RhythmDataPoint {
  date: string; // YYYY-MM-DD
  commits: number;
  prsOpened: number;
  prsMerged: number;
  issuesClosed: number;
}

export interface DashboardData {
  tasks: Task[];
  activity: ActivityEvent[];
  gaps: GapItem[];
  rhythm: RhythmDataPoint[];
  stats: {
    totalTasks: number;
    inProgress: number;
    overdue: number;
    finishRate: number; // merged branches / total branches
    activeRepos: number;
  };
}
