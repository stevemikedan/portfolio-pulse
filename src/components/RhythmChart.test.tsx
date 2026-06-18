import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

vi.mock("react-chartjs-2", () => ({
  Bar: (props: { data: { labels: string[]; datasets: { label: string }[] } }) => (
    <div
      data-testid="bar-chart"
      data-labels={props.data.labels.length}
      data-series={props.data.datasets.map((d) => d.label).join(",")}
    />
  ),
}));

import type { RhythmDataPoint } from "@/lib/types";

const { mockAggregate, mockRhythm } = vi.hoisted(() => {
  const mockRhythm: RhythmDataPoint[] = [
    { date: "2026-06-02", commits: 4, prsOpened: 1, prsMerged: 0, issuesClosed: 1 },
    { date: "2026-06-03", commits: 7, prsOpened: 0, prsMerged: 1, issuesClosed: 0 },
    { date: "2026-06-04", commits: 2, prsOpened: 0, prsMerged: 0, issuesClosed: 0 },
  ];
  return { mockAggregate: vi.fn(() => mockRhythm), mockRhythm };
});
vi.mock("@/lib/activity-rhythm", () => ({ aggregateRhythm: mockAggregate }));

import { RhythmChart } from "./RhythmChart";

describe("RhythmChart", () => {
  it("renders the chart heading", () => {
    render(<RhythmChart activity={[]} />);
    expect(screen.getByText("Work Rhythm")).toBeInTheDocument();
  });

  it("renders a bar for each day with all activity series", () => {
    render(<RhythmChart activity={[]} />);
    const chart = screen.getByTestId("bar-chart");
    expect(chart).toHaveAttribute("data-labels", "3");
    expect(chart.getAttribute("data-series")).toContain("Commits");
    expect(chart.getAttribute("data-series")).toContain("PRs Merged");
  });

  it("shows the total event count", () => {
    render(<RhythmChart activity={[]} />);
    // 4+1+0+1 + 7+0+1+0 + 2 = 16
    expect(screen.getByText(/16 events/)).toBeInTheDocument();
  });

  it("shows an empty-state message when aggregation returns all zeros", () => {
    mockAggregate.mockReturnValueOnce([
      { date: "2026-06-02", commits: 0, prsOpened: 0, prsMerged: 0, issuesClosed: 0 },
    ]);
    render(<RhythmChart activity={[]} />);
    expect(screen.getByText(/No activity in this window/)).toBeInTheDocument();
  });

  it("renders range toggle buttons defaulting to 14d", () => {
    render(<RhythmChart activity={[]} />);
    expect(screen.getByRole("button", { name: "7d" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "14d" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30d" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "14d" })).toHaveClass("bg-blue-600");
  });

  it("calls aggregateRhythm with the selected range when toggled", async () => {
    const user = userEvent.setup();
    render(<RhythmChart activity={[]} />);
    await user.click(screen.getByRole("button", { name: "30d" }));
    expect(mockAggregate).toHaveBeenCalledWith([], 30);
  });
});
