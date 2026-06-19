import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useGitHub } from "./useGitHub";
import type { ActivityEvent, Task } from "@/lib/types";

const mockActivities: ActivityEvent[] = [
  { id: "a1", type: "commit", title: "fix: bug", repo: "my-repo", timestamp: "2026-06-17T10:00:00Z" },
];

const mockTasks: Task[] = [
  { id: "t1", title: "Fix login bug", status: "todo", priority: "high", source: "github" },
];

function mockFetch(activityPayload: unknown, issuesPayload: unknown) {
  return vi.fn((url: string) => {
    if (url === "/api/github/activity") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(activityPayload) });
    }
    if (url === "/api/github/issues") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(issuesPayload) });
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });
}

describe("useGitHub", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch(mockActivities, mockTasks));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts in loading state", () => {
    const { result } = renderHook(() => useGitHub());
    expect(result.current.loading).toBe(true);
  });

  it("returns tasks and activities on success", async () => {
    const { result } = renderHook(() => useGitHub());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.activities).toEqual(mockActivities);
    expect(result.current.error).toBeNull();
  });

  it("sets error and empties activities when activity fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (url === "/api/github/activity") {
        return Promise.resolve({ ok: false, status: 401 });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTasks) });
    }));

    const { result } = renderHook(() => useGitHub());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.activities).toEqual([]);
    expect(result.current.error).toContain("401");
    expect(result.current.tasks).toEqual(mockTasks);
  });

  it("sets error and empties tasks when issues fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (url === "/api/github/issues") {
        return Promise.resolve({ ok: false, status: 403 });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockActivities) });
    }));

    const { result } = renderHook(() => useGitHub());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks).toEqual([]);
    expect(result.current.error).toContain("403");
    expect(result.current.activities).toEqual(mockActivities);
  });

  it("accumulates errors from both endpoints when both fail", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 }),
    ));

    const { result } = renderHook(() => useGitHub());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain("Activity fetch failed");
    expect(result.current.error).toContain("Issues fetch failed");
  });

  it("handles network errors", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("Network error"))));

    const { result } = renderHook(() => useGitHub());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain("Network error");
  });

  it("exposes a refresh function that re-fetches", async () => {
    const fetchSpy = mockFetch(mockActivities, mockTasks);
    vi.stubGlobal("fetch", fetchSpy);

    const { result } = renderHook(() => useGitHub());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const callsBefore = fetchSpy.mock.calls.length;

    await result.current.refresh();
    expect(fetchSpy.mock.calls.length).toBeGreaterThan(callsBefore);
  });
});
