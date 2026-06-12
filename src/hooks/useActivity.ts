"use client";

import { useState, useEffect } from "react";
import type { ActivityEvent } from "@/lib/types";

interface UseActivityResult {
  activity: ActivityEvent[];
  loading: boolean;
}

export function useActivity(): UseActivityResult {
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchActivity() {
      const results = await Promise.allSettled([
        fetch("/api/local/activity").then((r) =>
          r.ok ? (r.json() as Promise<ActivityEvent[]>) : [],
        ),
        fetch("/api/github/activity").then((r) =>
          r.ok ? (r.json() as Promise<ActivityEvent[]>) : [],
        ),
      ]);

      if (cancelled) return;

      const merged: ActivityEvent[] = results.flatMap((result) =>
        result.status === "fulfilled" && Array.isArray(result.value)
          ? result.value
          : [],
      );

      merged.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      setActivity(merged);
      setLoading(false);
    }

    fetchActivity();
    return () => {
      cancelled = true;
    };
  }, []);

  return { activity, loading };
}
