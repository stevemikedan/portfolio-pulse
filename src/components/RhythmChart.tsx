"use client";

import { useMemo } from "react";
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
import type { RhythmDataPoint } from "@/lib/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const SERIES = [
  { key: "commits", label: "Commits", color: "#3b82f6" },
  { key: "prsMerged", label: "PRs Merged", color: "#10b981" },
  { key: "prsOpened", label: "PRs Opened", color: "#8b5cf6" },
  { key: "issuesClosed", label: "Issues Closed", color: "#f59e0b" },
] as const;

function dayLabel(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" });
}

export function RhythmChart({ data }: { data: RhythmDataPoint[] }) {
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
          <p className="text-xs text-[var(--text-3)]">Daily activity over the past {data.length} days</p>
        </div>
        <span className="text-[0.65rem] text-[var(--text-3)]">{total} events</span>
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
