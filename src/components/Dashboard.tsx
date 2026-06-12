'use client';

import { useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { detectGaps } from '@/lib/gap-detection';
import { mockData } from '@/lib/mock-data';
import { StatCards } from './StatCards';
import { AssignmentsList } from './AssignmentsList';
import { ActivityFeed } from './ActivityFeed';
import { GapAnalysis } from './GapAnalysis';
import { RhythmChart } from './RhythmChart';

export function Dashboard() {
  const { tasks, loading, error } = useTasks();
  const { activity, rhythm } = mockData;

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const now = new Date();
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const finishRate = totalTasks > 0 ? done / totalTasks : 0;
    const activeRepos = new Set(
      tasks.map((t) => t.project).filter(Boolean)
    ).size;
    return { totalTasks, inProgress, overdue, finishRate, activeRepos };
  }, [tasks]);

  const gaps = useMemo(() => detectGaps(tasks, activity), [tasks, activity]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
        <p className="font-medium">Failed to load tasks</p>
        <p className="mt-1 text-sm opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatCards
        totalTasks={stats.totalTasks}
        inProgress={stats.inProgress}
        overdue={stats.overdue}
        finishRate={stats.finishRate}
        activeRepos={stats.activeRepos}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssignmentsList tasks={tasks} />
        <ActivityFeed events={activity} />
        <GapAnalysis gaps={gaps} />
        <RhythmChart data={rhythm} />
      </div>
    </div>
  );
}
