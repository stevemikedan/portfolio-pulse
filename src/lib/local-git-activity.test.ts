import { describe, it, expect, afterEach } from "vitest";
import {
  parseGitLogOutput,
  getRepoPaths,
  LOCAL_ACTIVITY_WINDOW_DAYS,
} from "./local-git-activity";

const REPO = "my-repo";
const BRANCH = "main";

function makeLine(hash: string, ts: string, subject: string): string {
  return `${hash}\0${ts}\0${subject}`;
}

describe("LOCAL_ACTIVITY_WINDOW_DAYS", () => {
  it("is 14", () => {
    expect(LOCAL_ACTIVITY_WINDOW_DAYS).toBe(14);
  });
});

describe("getRepoPaths", () => {
  const orig = process.env.LOCAL_REPO_PATHS;

  afterEach(() => {
    if (orig === undefined) {
      delete process.env.LOCAL_REPO_PATHS;
    } else {
      process.env.LOCAL_REPO_PATHS = orig;
    }
  });

  it("returns empty array when env var is not set", () => {
    delete process.env.LOCAL_REPO_PATHS;
    expect(getRepoPaths()).toEqual([]);
  });

  it("returns empty array when env var is empty string", () => {
    process.env.LOCAL_REPO_PATHS = "";
    expect(getRepoPaths()).toEqual([]);
  });

  it("returns a single path", () => {
    process.env.LOCAL_REPO_PATHS = "/home/user/project";
    expect(getRepoPaths()).toEqual(["/home/user/project"]);
  });

  it("splits comma-separated paths", () => {
    process.env.LOCAL_REPO_PATHS = "/path/a,/path/b,/path/c";
    expect(getRepoPaths()).toEqual(["/path/a", "/path/b", "/path/c"]);
  });

  it("trims whitespace around each path", () => {
    process.env.LOCAL_REPO_PATHS = " /path/a , /path/b ";
    expect(getRepoPaths()).toEqual(["/path/a", "/path/b"]);
  });

  it("filters empty segments from consecutive commas", () => {
    process.env.LOCAL_REPO_PATHS = "/path/a,,/path/b";
    expect(getRepoPaths()).toEqual(["/path/a", "/path/b"]);
  });
});

describe("parseGitLogOutput", () => {
  it("returns empty array for empty output", () => {
    expect(parseGitLogOutput("", REPO, BRANCH)).toEqual([]);
  });

  it("parses a single commit line into an ActivityEvent", () => {
    const line = makeLine("abc123def456", "2026-06-10T10:00:00Z", "feat: add feature");
    const [event] = parseGitLogOutput(line, REPO, BRANCH);
    expect(event).toMatchObject({
      id: `local-${REPO}-abc123def456`,
      type: "commit",
      title: "feat: add feature",
      repo: REPO,
      branch: BRANCH,
      timestamp: "2026-06-10T10:00:00Z",
    });
  });

  it("parses multiple commit lines", () => {
    const output = [
      makeLine("aaa111", "2026-06-12T10:00:00Z", "fix: first"),
      makeLine("bbb222", "2026-06-11T10:00:00Z", "fix: second"),
    ].join("\n");
    const result = parseGitLogOutput(output, REPO, BRANCH);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("fix: first");
    expect(result[1].title).toBe("fix: second");
  });

  it("includes repo name in the event id", () => {
    const line = makeLine("abc123", "2026-06-12T10:00:00Z", "msg");
    const [event] = parseGitLogOutput(line, "my-project", BRANCH);
    expect(event.id).toBe("local-my-project-abc123");
  });

  it("sets branch from the parameter", () => {
    const line = makeLine("abc123", "2026-06-12T10:00:00Z", "msg");
    const [event] = parseGitLogOutput(line, REPO, "feat/my-branch");
    expect(event.branch).toBe("feat/my-branch");
  });

  it("omits branch when parameter is undefined", () => {
    const line = makeLine("abc123", "2026-06-12T10:00:00Z", "msg");
    const [event] = parseGitLogOutput(line, REPO, undefined);
    expect(event.branch).toBeUndefined();
  });

  it("omits branch when parameter is empty string", () => {
    const line = makeLine("abc123", "2026-06-12T10:00:00Z", "msg");
    const [event] = parseGitLogOutput(line, REPO, "");
    expect(event.branch).toBeUndefined();
  });

  it("handles subjects with colons, brackets, and hashes", () => {
    const subject = "feat(scope): add [feature] #123";
    const line = makeLine("abc123", "2026-06-12T10:00:00Z", subject);
    const [event] = parseGitLogOutput(line, REPO, BRANCH);
    expect(event.title).toBe(subject);
  });

  it("skips blank lines without crashing", () => {
    const output = makeLine("abc123", "2026-06-12T10:00:00Z", "msg") + "\n\n";
    const result = parseGitLogOutput(output, REPO, BRANCH);
    expect(result).toHaveLength(1);
  });

  it("sets type to commit for all entries", () => {
    const output = [
      makeLine("aaa", "2026-06-12T10:00:00Z", "a"),
      makeLine("bbb", "2026-06-11T10:00:00Z", "b"),
    ].join("\n");
    const result = parseGitLogOutput(output, REPO, BRANCH);
    expect(result.every((e) => e.type === "commit")).toBe(true);
  });

  it("falls back to (no message) for a line with no subject field", () => {
    const line = "abc123\0"; // only hash + NUL, no subject
    const [event] = parseGitLogOutput(line, REPO, BRANCH);
    expect(event.title).toBe("(no message)");
  });
});
