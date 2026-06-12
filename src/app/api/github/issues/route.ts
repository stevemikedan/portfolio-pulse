import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { mapIssueToTask } from "@/lib/github-issues";

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured" },
      { status: 500 }
    );
  }

  const octokit = new Octokit({ auth: token });

  try {
    const { data: issues } = await octokit.issues.listForAuthenticatedUser({
      filter: "assigned",
      state: "open",
      per_page: 100,
    });

    // The issues endpoint includes PRs — exclude them
    const tasks = issues
      .filter((issue) => !issue.pull_request)
      .map(mapIssueToTask);

    return NextResponse.json(tasks);
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
      { error: "Failed to fetch GitHub issues" },
      { status: 500 }
    );
  }
}
