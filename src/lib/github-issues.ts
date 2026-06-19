import type { Task, Priority, TaskStatus } from "./types";

export type GitHubLabel = string | { name?: string | null | undefined };

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  labels: GitHubLabel[];
  updated_at: string;
  repository_url: string;
  repository?: { name: string } | null;
}

function getLabelName(label: GitHubLabel): string {
  if (typeof label === "string") return label;
  return label.name ?? "";
}

function repoFromUrl(repositoryUrl: string): string {
  const parts = repositoryUrl.split("/");
  return parts[parts.length - 1] ?? "";
}

export function mapLabelsToPriority(labels: GitHubLabel[]): Priority {
  for (const label of labels) {
    const name = getLabelName(label).toLowerCase();
    if (/\b(critical|urgent|p0|high)\b/.test(name)) return "high";
    if (/\b(medium|normal|p1)\b/.test(name)) return "medium";
    if (/\b(low|p2)\b/.test(name)) return "low";
  }
  return "none";
}

export function mapStateToStatus(state: string, labels: GitHubLabel[]): TaskStatus {
  if (state === "closed") return "done";
  for (const label of labels) {
    const name = getLabelName(label).toLowerCase();
    if (/\b(blocked|on.hold|waiting)\b/.test(name)) return "blocked";
    if (/\b(in.progress|wip|doing)\b/.test(name)) return "in_progress";
  }
  return "todo";
}

export function mapIssueToTask(issue: GitHubIssue): Task {
  const labelNames = issue.labels
    .map(getLabelName)
    .filter((n) => n.length > 0);

  return {
    id: `github-issue-${issue.id}`,
    title: issue.title,
    source: "github",
    sourceUrl: issue.html_url,
    project: issue.repository?.name ?? repoFromUrl(issue.repository_url),
    status: mapStateToStatus(issue.state, issue.labels),
    priority: mapLabelsToPriority(issue.labels),
    tags: labelNames.length > 0 ? labelNames : undefined,
    lastActivity: issue.updated_at,
  };
}
