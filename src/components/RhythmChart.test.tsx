import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Chart.js renders to a <canvas>, which jsdom doesn't implement — mock the
// chart and assert on the data we hand it instead.
vi.mock("react-chartjs-2", () => ({
  Bar: (props: { data: { labels: string[]; datasets: { label: string }[] } }) => (
    <div
      data-testid="bar-chart"
      data-labels={props.data.labels.length}
      data-series={props.data.datasets.map((d) => d.label).join(",")}
    />
  ),
}));

import { RhythmChart } from "./RhythmChart";
import type { RhythmDataPoint } from "@/lib/types";

const mockRhythm: RhythmDataPoint[] = [
  { date: "2026-06-02", commits: 4, prsOpened: 1, prsMerged: 0, issuesClosed: 1 },
  { date: "2026-06-03", commits: 7, prsOpened: 0, prsMerged: 1, issuesClosed: 0 },
  { date: "2026-06-04", commits: 2, prsOpened: 0, prsMerged: 0, issuesClosed: 0 },
];

describe("RhythmChart", () => {
  it("renders the chart heading", () => {
    render(<RhythmChart data={mockRhythm} />);
    expect(screen.getByText("Work Rhythm")).toBeInTheDocument();
  });

  it("renders a bar for each day with all activity series", () => {
    render(<RhythmChart data={mockRhythm} />);
    const chart = screen.getByTestId("bar-chart");
    expect(chart).toHaveAttribute("data-labels", "3");
    expect(chart.getAttribute("data-series")).toContain("Commits");
    expect(chart.getAttribute("data-series")).toContain("PRs Merged");
  });

  it("shows the total event count", () => {
    render(<RhythmChart data={mockRhythm} />);
    // 4+1+0+1 + 7+0+1+0 + 2 = 16
    expect(screen.getByText("16 events")).toBeInTheDocument();
  });

  it("shows an empty-state message when there is no activity", () => {
    const empty: RhythmDataPoint[] = [
      { date: "2026-06-02", commits: 0, prsOpened: 0, prsMerged: 0, issuesClosed: 0 },
    ];
    render(<RhythmChart data={empty} />);
    expect(screen.getByText("Work Rhythm")).toBeInTheDocument();
    expect(screen.getByText(/No activity in this window/)).toBeInTheDocument();
  });
});
