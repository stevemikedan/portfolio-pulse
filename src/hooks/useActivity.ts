"use client";

import { useState, useEffect, useCallback } from "react";
import type { ActivityEvent } from "@/lib/types";

interface UseActivityResult {
  activity: ActivityEvent[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useActivity(): UseActivityResult {
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      fetch("/api/local/activity").then((r) =>
        r.ok ? (r.json() as Promise<ActivityEvent[]>) : [],
      ),
      fetch("/api/github/activity").then((r) =>
        r.ok ? (r.json() as Promise<ActivityEvent[]>) : [],
      ),
    ]);

    const merged: ActivityEvent[] = results.flatMap((result) =>
      result.status === "fulfilled" && Array.isArray(result.value)
        ? result.value
        : [],
    );

    merged.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    setActivity(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { activity, loading, refresh: fetchActivity };
}
