import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { filterAndMapEvents } from "@/lib/github-activity";

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

    const activities = filterAndMapEvents(events);

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
