"use client";

import { useState, useEffect, useCallback } from "react";
import type { ActivityEvent, Task } from "@/lib/types";

interface UseGitHubResult {
  tasks: Task[];
  activities: ActivityEvent[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useGitHub(): UseGitHubResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGitHub = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [activityRes, issuesRes] = await Promise.allSettled([
      fetch("/api/github/activity"),
      fetch("/api/github/issues"),
    ]);

    const errors: string[] = [];

    if (activityRes.status === "fulfilled" && activityRes.value.ok) {
      setActivities(await activityRes.value.json() as ActivityEvent[]);
    } else {
      const msg =
        activityRes.status === "rejected"
          ? activityRes.reason instanceof Error
            ? activityRes.reason.message
            : "Network error"
          : `Activity fetch failed (${activityRes.value.status})`;
      errors.push(msg);
      setActivities([]);
    }

    if (issuesRes.status === "fulfilled" && issuesRes.value.ok) {
      setTasks(await issuesRes.value.json() as Task[]);
    } else {
      const msg =
        issuesRes.status === "rejected"
          ? issuesRes.reason instanceof Error
            ? issuesRes.reason.message
            : "Network error"
          : `Issues fetch failed (${issuesRes.value.status})`;
      errors.push(msg);
      setTasks([]);
    }

    setError(errors.length > 0 ? errors.join("; ") : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGitHub();
  }, [fetchGitHub]);

  return { tasks, activities, loading, error, refresh: fetchGitHub };
}
