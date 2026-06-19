'use client';

import { useState } from 'react';
import type { Task, TaskStatus, Priority } from '@/lib/types';

interface TaskFormProps {
  /** When provided, the form edits this task (PATCH). When null/absent, it creates a new task (POST). */
  task?: Task | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewTaskForm({ task, onClose, onSuccess }: TaskFormProps) {
  const isEdit = !!task;
  const isReadOnly = task?.source === 'github' || task?.source === 'notion';
  const [title, setTitle] = useState(task?.title ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'todo');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [project, setProject] = useState(task?.project ?? '');
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        status,
        priority,
        project: project.trim() || undefined,
        dueDate: dueDate || undefined,
      };
      const res = isEdit
        ? await fetch(`/api/tasks/${task!.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, source: 'notion' }),
          });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? String(res.status));
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isEdit) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${task!.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(String(res.status));
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      setDeleting(false);
    }
  }

  const busy = submitting || deleting;

  const sourceLabel: Record<string, string> = { github: 'GitHub', notion: 'Notion' };

  if (isReadOnly && task) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <div
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">{sourceLabel[task.source] ?? task.source} Task</h2>
            <button type="button" onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text-1)] text-sm leading-none" aria-label="Close">✕</button>
          </div>
          <div className="space-y-3 text-sm">
            <p className="font-medium">{task.title}</p>
            {task.project && <p className="text-xs text-[var(--text-3)]">{task.project}</p>}
            <div className="flex gap-2 flex-wrap text-xs text-[var(--text-3)]">
              <span>{task.status.replace('_', ' ')}</span>
              <span>·</span>
              <span>{task.priority} priority</span>
              {task.dueDate && <><span>·</span><span>due {task.dueDate}</span></>}
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
              Close
            </button>
            {task.sourceUrl && (
              <a
                href={task.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-center"
              >
                View on {sourceLabel[task.source] ?? task.source} ↗
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-3)] hover:text-[var(--text-1)] text-sm leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--text-3)] mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Task title"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-3)] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-3)] mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-3)] mb-1">Project</label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Project name"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-3)] mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-3 pt-1">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="px-4 py-2 text-sm rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !title.trim()}
              className="flex-1 px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isEdit ? (submitting ? 'Saving…' : 'Save') : submitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
