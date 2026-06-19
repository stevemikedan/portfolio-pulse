import { NextResponse } from "next/server";
import { readLocalGitActivity } from "@/lib/local-git-activity";
import { getRepoPaths } from "@/lib/repo-store";
import type { ActivityEvent } from "@/lib/types";

export async function GET() {
  const paths = getRepoPaths();

  if (paths.length === 0) {
    return NextResponse.json([] as ActivityEvent[]);
  }

  const results = await Promise.all(paths.map((p) => readLocalGitActivity(p)));

  const activities = results
    .flat()
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  return NextResponse.json(activities);
}
