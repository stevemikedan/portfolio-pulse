'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useActivity } from '@/hooks/useActivity';
import { useGitHub } from '@/hooks/useGitHub';
import { detectGaps } from '@/lib/gap-detection';
import { AppHeader, type SourceStatus } from './AppHeader';
import { ProjectFilter } from './ProjectFilter';
import { StatCards } from './StatCards';
import { AssignmentsList } from './AssignmentsList';
import { ActivityFeed } from './ActivityFeed';
import { GapAnalysis } from './GapAnalysis';
import { RhythmChart } from './RhythmChart';
import { NewTaskForm } from './NewTaskForm';
import { CsvImport } from './CsvImport';
import { LocalRepoPicker } from './LocalRepoPicker';
import type { Task } from '@/lib/types';

export function Dashboard() {
  const { tasks: localTasks, loading, error, refresh: refreshTasks } = useTasks();
  const { activity, refresh: refreshActivity } = useActivity();
  const { tasks: githubTasks, refresh: refreshGitHub } = useGitHub();

  const tasks = useMemo(() => {
    const localIds = new Set(localTasks.map((t) => t.id));
    const uniqueGitHub = githubTasks.filter((t) => !localIds.has(t.id));
    return [...localTasks, ...uniqueGitHub];
  }, [localTasks, githubTasks]);

  const [formTask, setFormTask] = useState<Task | null | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!loading) setLastUpdated(new Date());
  }, [loading, tasks, activity]);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshTasks(), refreshActivity(), refreshGitHub()]);
    setRefreshing(false);
    setLastUpdated(new Date());
  }, [refreshTasks, refreshActivity, refreshGitHub]);

  // Sorted unique project list derived from all tasks
  const projects = useMemo(() => {
    const names = [...new Set(tasks.map((t) => t.project).filter(Boolean) as string[])];
    return names.sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  // Task count per project for the filter badges
  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tasks) {
      if (t.project) counts[t.project] = (counts[t.project] ?? 0) + 1;
    }
    return counts;
  }, [tasks]);

  // Filtered tasks — when no project selected, show all
  const filteredTasks = useMemo(() => {
    if (selectedProjects.length === 0) return tasks;
    return tasks.filter((t) => t.project && selectedProjects.includes(t.project));
  }, [tasks, selectedProjects]);

  // Filtered activity — match repo name against selected projects (case-insensitive)
  const filteredActivity = useMemo(() => {
    if (selectedProjects.length === 0) return activity;
    const lower = selectedProjects.map((p) => p.toLowerCase());
    return activity.filter((a) => lower.some((p) => a.repo.toLowerCase().includes(p) || p.includes(a.repo.toLowerCase())));
  }, [activity, selectedProjects]);

  const stats = useMemo(() => {
    const totalTasks = filteredTasks.length;
    const inProgress = filteredTasks.filter((t) => t.status === 'in_progress').length;
    const now = new Date();
    const overdue = filteredTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length;
    const done = filteredTasks.filter((t) => t.status === 'done').length;
    const finishRate = totalTasks > 0 ? done / totalTasks : 0;
    const activeRepos = new Set(filteredTasks.map((t) => t.project).filter(Boolean)).size;
    return { totalTasks, inProgress, overdue, finishRate, activeRepos };
  }, [filteredTasks]);

  const gaps = useMemo(() => detectGaps(filteredTasks, filteredActivity), [filteredTasks, filteredActivity]);

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
      <div className="space-y-5">
        {/* Project filter */}
        <div className="flex items-center justify-between gap-4">
          <ProjectFilter
            projects={projects}
            taskCounts={taskCounts}
            selected={selectedProjects}
            onChange={setSelectedProjects}
          />
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            title="Configure sources"
            className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              showSettings
                ? 'border-[var(--text-3)] text-[var(--text-2)] bg-[var(--bg-hover)]'
                : 'border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-2)]'
            }`}
          >
            ⚙ Settings
          </button>
        </div>

        {showSettings && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LocalRepoPicker onSave={refreshAll} />
          </div>
        )}

        <StatCards
          totalTasks={stats.totalTasks}
          inProgress={stats.inProgress}
          overdue={stats.overdue}
          finishRate={stats.finishRate}
          activeRepos={stats.activeRepos}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssignmentsList
            tasks={filteredTasks}
            onNew={() => setFormTask(null)}
            onOpen={(t) => setFormTask(t)}
            headerActions={<CsvImport onSuccess={refreshAll} />}
          />
          <ActivityFeed events={filteredActivity} />
          <GapAnalysis gaps={gaps} />
          <RhythmChart activity={filteredActivity} />
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
