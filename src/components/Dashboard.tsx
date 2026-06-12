'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useActivity } from '@/hooks/useActivity';
import { detectGaps } from '@/lib/gap-detection';
import { mockData } from '@/lib/mock-data';
import { StatCards } from './StatCards';
import { AssignmentsList } from './AssignmentsList';
import { ActivityFeed } from './ActivityFeed';
import { GapAnalysis } from './GapAnalysis';
import { RhythmChart } from './RhythmChart';
import { NewTaskForm } from './NewTaskForm';
import { CsvImport } from './CsvImport';
import type { TaskStatus, Priority } from '@/lib/types';

export function Dashboard() {
  const { tasks, loading, error, refresh } = useTasks();
  const { activity } = useActivity();
  const { rhythm } = mockData;
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

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

  const handleStatusChange = useCallback(
    (id: string, status: TaskStatus) => {
      fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).then(() => refresh());
    },
    [refresh],
  );

  const handlePriorityChange = useCallback(
    (id: string, priority: Priority) => {
      fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      }).then(() => refresh());
    },
    [refresh],
  );

  const handleDelete = useCallback(
    (id: string) => {
      fetch(`/api/tasks/${id}`, { method: 'DELETE' }).then(() => refresh());
    },
    [refresh],
  );

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
    <>
      {showNewTaskForm && (
        <NewTaskForm
          onClose={() => setShowNewTaskForm(false)}
          onSuccess={() => {
            setShowNewTaskForm(false);
            refresh();
          }}
        />
      )}
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
            onNew={() => setShowNewTaskForm(true)}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onDelete={handleDelete}
            headerActions={<CsvImport onSuccess={refresh} />}
          />
          <ActivityFeed events={activity} />
          <GapAnalysis gaps={gaps} />
          <RhythmChart data={rhythm} />
        </div>
      </div>
    </>
  );
}
