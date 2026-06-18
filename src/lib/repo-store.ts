import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "data", "local-repos.json");

function readStore(): string[] {
  try {
    if (!existsSync(STORE_PATH)) return [];
    return JSON.parse(readFileSync(STORE_PATH, "utf8")) as string[];
  } catch {
    return [];
  }
}

function writeStore(paths: string[]): void {
  mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(paths, null, 2), "utf8");
}

/** Returns all configured repo paths: persisted store merged with LOCAL_REPO_PATHS env var. */
export function getRepoPaths(): string[] {
  const fromEnv = (process.env.LOCAL_REPO_PATHS ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const fromStore = readStore();
  return [...new Set([...fromEnv, ...fromStore])];
}

/** Replace the persisted repo list (env var entries are unaffected). */
export function setRepoPaths(paths: string[]): void {
  writeStore(paths.map((p) => p.trim()).filter(Boolean));
}
