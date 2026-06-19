"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface LocalRepoPickerProps {
  onSave?: () => void;
}

export function LocalRepoPicker({ onSave }: LocalRepoPickerProps) {
  const [repos, setRepos] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/repos");
      if (res.ok) setRepos(await res.json() as string[]);
    } catch {
      // silently ignore — empty list is fine
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(next: string[]) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/repos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setRepos(await res.json() as string[]);
      onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function add() {
    const trimmed = input.trim();
    if (!trimmed || repos.includes(trimmed)) return;
    setInput("");
    inputRef.current?.focus();
    save([...repos, trimmed]);
  }

  function remove(repo: string) {
    save(repos.filter((r) => r !== repo));
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold">Local Repos</h2>
        <p className="text-xs text-[var(--text-3)]">Absolute paths to git repos for activity tracking</p>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            placeholder="/path/to/my-repo"
            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          />
          <button
            type="button"
            onClick={add}
            disabled={saving || !input.trim()}
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {repos.length === 0 ? (
          <p className="text-xs text-[var(--text-3)] py-2">No repos configured — add a path above.</p>
        ) : (
          <ul className="space-y-1">
            {repos.map((repo) => (
              <li key={repo} className="flex items-center gap-2 group">
                <span className="flex-1 text-xs font-mono text-[var(--text-2)] truncate">{repo}</span>
                <button
                  type="button"
                  onClick={() => remove(repo)}
                  disabled={saving}
                  className="text-[0.65rem] text-[var(--text-3)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all disabled:cursor-not-allowed"
                  aria-label={`Remove ${repo}`}
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
