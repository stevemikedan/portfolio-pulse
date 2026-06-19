import { execFile } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import path from "path";
import type { ActivityEvent } from "./types";

const execFileAsync = promisify(execFile);

export const LOCAL_ACTIVITY_WINDOW_DAYS = 14;

export function getRepoPaths(): string[] {
  const raw = process.env.LOCAL_REPO_PATHS ?? "";
  return raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

// Pure parsing function — takes raw git log output (format: %H%x00%aI%x00%s per line)
// and converts to ActivityEvent[]. Exported for testability.
export function parseGitLogOutput(
  output: string,
  repoName: string,
  branch?: string,
): ActivityEvent[] {
  return output
    .split("\n")
    .filter(Boolean)
    .map((line, i) => {
      const parts = line.split("\0");
      const hash = parts[0] ?? "";
      const timestamp = parts[1] ?? new Date().toISOString();
      const subject = parts.slice(2).join("\0") || "(no message)";

      return {
        id: `local-${repoName}-${hash || String(i)}`,
        type: "commit" as const,
        title: subject,
        repo: repoName,
        branch: branch || undefined,
        timestamp,
      };
    });
}

export async function readLocalGitActivity(
  repoPath: string,
  windowDays: number = LOCAL_ACTIVITY_WINDOW_DAYS,
  now: Date = new Date(),
): Promise<ActivityEvent[]> {
  if (!existsSync(repoPath)) {
    console.warn(`[local-git] Path does not exist: ${repoPath}`);
    return [];
  }

  const repoName = path.basename(repoPath);
  const since = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

  let branch: string | undefined;
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["-C", repoPath, "branch", "--show-current"],
      { encoding: "utf8" },
    );
    branch = stdout.trim() || undefined;
  } catch {
    console.warn(`[local-git] Not a git repo or git unavailable: ${repoPath}`);
    return [];
  }

  let logOutput: string;
  try {
    const { stdout } = await execFileAsync(
      "git",
      [
        "-C",
        repoPath,
        "log",
        `--since=${since.toISOString()}`,
        "--no-merges",
        "--pretty=format:%H%x00%aI%x00%s",
      ],
      { encoding: "utf8" },
    );
    logOutput = stdout.trim();
  } catch {
    console.warn(`[local-git] Failed to read git log: ${repoPath}`);
    return [];
  }

  if (!logOutput) return [];

  return parseGitLogOutput(logOutput, repoName, branch);
}
