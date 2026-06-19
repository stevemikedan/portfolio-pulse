"use client";

interface ProjectFilterProps {
  projects: string[];
  taskCounts: Record<string, number>;
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function ProjectFilter({ projects, taskCounts, selected, onChange }: ProjectFilterProps) {
  if (projects.length === 0) return null;

  const allSelected = selected.length === 0;

  function toggle(project: string) {
    if (selected.includes(project)) {
      const next = selected.filter((p) => p !== project);
      onChange(next);
    } else {
      onChange([...selected, project]);
    }
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        type="button"
        onClick={() => onChange([])}
        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
          allSelected
            ? "bg-blue-600 border-blue-600 text-white"
            : "border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-2)] hover:border-[var(--text-3)]"
        }`}
      >
        All Projects
      </button>
      {projects.map((project) => {
        const active = selected.includes(project);
        const count = taskCounts[project] ?? 0;
        return (
          <button
            key={project}
            type="button"
            onClick={() => toggle(project)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1.5 ${
              active
                ? "bg-[var(--bg-hover)] border-[var(--text-3)] text-[var(--text-1)]"
                : "border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-2)] hover:border-[var(--text-3)]"
            }`}
          >
            {project}
            <span
              className={`text-[0.6rem] rounded-full px-1 min-w-[1.1rem] text-center ${
                active ? "bg-blue-600 text-white" : "bg-[var(--bg-hover)] text-[var(--text-3)]"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
