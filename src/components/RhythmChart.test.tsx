import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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

  it("renders day labels for each data point", () => {
    render(<RhythmChart data={mockRhythm} />);
    // Each data point renders a day abbreviation
    const dayLabels = screen.getAllByText(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/);
    expect(dayLabels).toHaveLength(3);
  });

  it("renders total activity counts", () => {
    render(<RhythmChart data={mockRhythm} />);
    // Total for first day: 4+1+0+1 = 6
    expect(screen.getByText("6")).toBeInTheDocument();
    // Total for second day: 7+0+1+0 = 8
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("renders legend items", () => {
    render(<RhythmChart data={mockRhythm} />);
    expect(screen.getByText("Commits")).toBeInTheDocument();
    expect(screen.getByText("PRs Merged")).toBeInTheDocument();
  });

  it("handles empty data", () => {
    render(<RhythmChart data={[]} />);
    expect(screen.getByText("Work Rhythm")).toBeInTheDocument();
  });
});
