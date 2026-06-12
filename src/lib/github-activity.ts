import type { ActivityEvent } from "./types";

export const ACTIVITY_WINDOW_DAYS = 7;

export interface GitHubEvent {
  id: string;
  type: string | null;
  repo: { name: string };
  created_at: string | null;
  payload: unknown;
}

type PushPayload = {
  commits?: Array<{ message: string; sha: string }>;
  ref?: string;
};

type PullRequestPayload = {
  action?: string;
  pull_request?: {
    title: string;
    html_url: string;
    merged?: boolean;
  };
};

type IssuesPayload = {
  action?: string;
  issue?: {
    title: string;
    html_url: string;
  };
};

export function isWithinWindow(
  timestamp: string,
  days: number = ACTIVITY_WINDOW_DAYS,
  now: Date = new Date()
): boolean {
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return new Date(timestamp) >= cutoff;
}

export function mapEventToActivities(event: GitHubEvent): ActivityEvent[] {
  const repo = event.repo.name.split("/")[1] ?? event.repo.name;
  const timestamp = event.created_at ?? new Date().toISOString();

  if (event.type === "PushEvent") {
    const payload = event.payload as PushPayload;
    const commits = payload.commits ?? [];
    const branch = payload.ref?.replace("refs/heads/", "");
    return commits.slice(0, 3).map((commit, ci) => ({
      id: `${event.id}-${ci}`,
      type: "commit" as const,
      title: commit.message.split("\n")[0],
      repo,
      branch,
      timestamp,
      url: `https://github.com/${event.repo.name}/commit/${commit.sha}`,
    }));
  }

  if (event.type === "PullRequestEvent") {
    const payload = event.payload as PullRequestPayload;
    const pr = payload.pull_request;
    if (!pr) return [];

    if (payload.action === "opened") {
      return [
        {
          id: event.id,
          type: "pr_opened" as const,
          title: pr.title,
          repo,
          timestamp,
          url: pr.html_url,
        },
      ];
    }
    if (payload.action === "closed" && pr.merged) {
      return [
        {
          id: event.id,
          type: "pr_merged" as const,
          title: pr.title,
          repo,
          timestamp,
          url: pr.html_url,
        },
      ];
    }
  }

  if (event.type === "IssuesEvent") {
    const payload = event.payload as IssuesPayload;
    const issue = payload.issue;
    if (!issue) return [];

    if (payload.action === "opened") {
      return [
        {
          id: event.id,
          type: "issue_opened" as const,
          title: issue.title,
          repo,
          timestamp,
          url: issue.html_url,
        },
      ];
    }
    if (payload.action === "closed") {
      return [
        {
          id: event.id,
          type: "issue_closed" as const,
          title: issue.title,
          repo,
          timestamp,
          url: issue.html_url,
        },
      ];
    }
  }

  return [];
}

export function filterAndMapEvents(
  events: GitHubEvent[],
  now: Date = new Date()
): ActivityEvent[] {
  return events
    .filter((e) => {
      if (!e.created_at) return false;
      return isWithinWindow(e.created_at, ACTIVITY_WINDOW_DAYS, now);
    })
    .flatMap(mapEventToActivities);
}
