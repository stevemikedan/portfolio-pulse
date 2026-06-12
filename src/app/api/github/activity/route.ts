import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import type { ActivityEvent } from "@/lib/types";

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

export async function GET() {
  const username = process.env.GITHUB_USERNAME;
  if (!username) {
    return NextResponse.json(
      { error: "GITHUB_USERNAME not configured" },
      { status: 500 }
    );
  }

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined,
  });

  try {
    const { data: events } = await octokit.activity.listPublicEventsForUser({
      username,
      per_page: 100,
    });

    const activities: ActivityEvent[] = events.flatMap(
      (event): ActivityEvent[] => {
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
                type: "pr_opened",
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
                type: "pr_merged",
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
                type: "issue_opened",
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
                type: "issue_closed",
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
    );

    return NextResponse.json(activities);
  } catch (error) {
    if (error !== null && typeof error === "object" && "status" in error) {
      const status = (error as { status: number }).status;
      if (status === 401 || status === 403) {
        return NextResponse.json(
          { error: "GitHub authentication failed. Check your GITHUB_TOKEN." },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch GitHub activity" },
      { status: 500 }
    );
  }
}
