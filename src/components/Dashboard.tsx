'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useActivity } from '@/hooks/useActivity';
import { detectGaps } from '@/lib/gap-detection';
import { aggregateRhythm } from '@/lib/activity-rhythm';
import { AppHeader, type SourceStatus } from './AppHeader';
import { StatCards } from './StatCards';
import { AssignmentsList } from './AssignmentsList';
import { ActivityFeed } from './ActivityFeed';
import { GapAnalysis } from './GapAnalysis';
import { RhythmChart } from './RhythmChart';
import { NewTaskForm } from './NewTaskForm';
import { CsvImport } from './CsvImport';
import type { Task } from '@/lib/types';

export function Dashboard() {
  const { tasks, loading, error, refresh: refreshTasks } = useTasks();
  const { activity, refresh: refreshActivity } = useActivity();
  // undefined = form closed · null = creating a new task · Task = editing that task
  const [formTask, setFormTask] = useState<Task | null | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading) setLastUpdated(new Date());
  }, [loading, tasks, activity]);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshTasks(), refreshActivity()]);
    setRefreshing(false);
    setLastUpdated(new Date());
  }, [refreshTasks, refreshActivity]);

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const now = new Date();
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const finishRate = totalTasks > 0 ? done / totalTasks : 0;
    const activeRepos = new Set(tasks.map((t) => t.project).filter(Boolean)).size;
    return { totalTasks, inProgress, overdue, finishRate, activeRepos };
  }, [tasks]);

  const gaps = useMemo(() => detectGaps(tasks, activity), [tasks, activity]);

  const rhythm = useMemo(() => aggregateRhythm(activity, 14), [activity]);

  const sources: SourceStatus[] = useMemo(() => {
    const hasLocal = activity.some((a) => a.id?.startsWith('local-'));
    const hasGitHub = activity.some((a) => !a.id?.startsWith('local-'));
    const hasCsv = tasks.some((t) => t.source === 'csv');
    return [
      { label: 'SQLite', active: true },
      { label: 'Local Git', active: hasLocal },
      { label: 'GitHub', active: hasGitHub },
      { label: 'CSV', active: hasCsv },
      { label: 'Notion', active: false },
    ];
  }, [tasks, activity]);

  let body: React.ReactNode;
  if (loading) {
    body = (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[var(--bg-card)]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-[var(--bg-card)]" />
          ))}
        </div>
      </div>
    );
  } else if (error) {
    body = (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-red-400">
        <p className="font-medium">Failed to load tasks</p>
        <p className="mt-1 text-sm opacity-80">{error}</p>
        <button
          type="button"
          onClick={refreshAll}
          className="mt-3 text-xs px-3 py-1.5 rounded-lg border border-red-500/40 hover:bg-red-500/10 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  } else {
    body = (
      <div className="space-y-6">
        <StatCards
          totalTasks={stats.totalTasks}
          inProgress={stats.inProgress}
          overdue={stats.overdue}
          finishRate={stats.finishRate}
          activeRepos={stats.activeRepos}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssignmentsList
            tasks={tasks}
            onNew={() => setFormTask(null)}
            onOpen={(t) => setFormTask(t)}
            headerActions={<CsvImport onSuccess={refreshAll} />}
          />
          <ActivityFeed events={activity} />
          <GapAnalysis gaps={gaps} />
          <RhythmChart data={rhythm} />
        </div>
      </div>
    );
  }

  return (
    <>
      {formTask !== undefined && (
        <NewTaskForm
          task={formTask}
          onClose={() => setFormTask(undefined)}
          onSuccess={() => {
            setFormTask(undefined);
            refreshAll();
          }}
        />
      )}
      <AppHeader
        onRefresh={refreshAll}
        refreshing={refreshing}
        lastUpdated={lastUpdated}
        sources={sources}
      />
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">{body}</div>
      </main>
    </>
  );
}
