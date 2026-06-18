"use client";

import { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import type { ActivityEvent } from "@/lib/types";
import { aggregateRhythm } from "@/lib/activity-rhythm";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const SERIES = [
  { key: "commits", label: "Commits", color: "#3b82f6" },
  { key: "prsMerged", label: "PRs Merged", color: "#10b981" },
  { key: "prsOpened", label: "PRs Opened", color: "#8b5cf6" },
  { key: "issuesClosed", label: "Issues Closed", color: "#f59e0b" },
] as const;

const RANGES = [7, 14, 30] as const;
type Range = (typeof RANGES)[number];

function dayLabel(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" });
}

export function RhythmChart({ activity }: { activity: ActivityEvent[] }) {
  const [days, setDays] = useState<Range>(14);

  const data = useMemo(() => aggregateRhythm(activity, days), [activity, days]);

  const total = useMemo(
    () =>
      data.reduce(
        (sum, d) => sum + d.commits + d.prsOpened + d.prsMerged + d.issuesClosed,
        0,
      ),
    [data],
  );

  const chartData = useMemo(
    () => ({
      labels: data.map((d) => dayLabel(d.date)),
      datasets: SERIES.map((s) => ({
        label: s.label,
        data: data.map((d) => d[s.key]),
        backgroundColor: s.color,
        borderRadius: 3,
        stack: "activity",
        maxBarThickness: 26,
      })),
    }),
    [data],
  );

  const options: ChartOptions<"bar"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { color: "#64748b", font: { size: 10 } },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { color: "#2d3748" },
          ticks: { color: "#64748b", font: { size: 10 }, precision: 0 },
        },
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#94a3b8",
            boxWidth: 10,
            boxHeight: 10,
            font: { size: 10 },
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: "#1a2332",
          borderColor: "#2d3748",
          borderWidth: 1,
          titleColor: "#e2e8f0",
          bodyColor: "#94a3b8",
        },
      },
    }),
    [],
  );

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Work Rhythm</h2>
          <p className="text-xs text-[var(--text-3)]">Daily activity — {total} events</p>
        </div>
        <div className="flex items-center gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={`px-2 py-0.5 text-[0.65rem] rounded font-medium transition-colors ${
                days === r
                  ? "bg-blue-600 text-white"
                  : "text-[var(--text-3)] hover:text-[var(--text-2)]"
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        {total === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-center text-sm text-[var(--text-3)]">
            No activity in this window — connect a GitHub token or add local repos.
          </div>
        ) : (
          <div className="h-[200px]">
            <Bar data={chartData} options={options} />
          </div>
        )}
      </div>
    </div>
  );
}
