import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GapAnalysis } from "./GapAnalysis";
import type { GapItem } from "@/lib/types";

const mockGaps: GapItem[] = [
  {
    type: "neglected",
    label: "Project X has no activity in 10 days",
    detail: "High-priority task with no recent progress.",
    severity: "danger",
    relatedTaskId: "t1",
  },
  {
    type: "unplanned",
    label: "3 hours on untracked repo",
    detail: "Recent commits don't match any tracked assignment.",
    severity: "info",
  },
  {
    type: "overloaded",
    label: "5 projects active simultaneously",
    detail: "Consider parking some.",
    severity: "warning",
  },
];

describe("GapAnalysis", () => {
  it("renders all gap items", () => {
    render(<GapAnalysis gaps={mockGaps} />);
    expect(screen.getByText("Project X has no activity in 10 days")).toBeInTheDocument();
    expect(screen.getByText("3 hours on untracked repo")).toBeInTheDocument();
    expect(screen.getByText("5 projects active simultaneously")).toBeInTheDocument();
  });

  it("displays type labels", () => {
    render(<GapAnalysis gaps={mockGaps} />);
    expect(screen.getByText("Neglected")).toBeInTheDocument();
    expect(screen.getByText("Unplanned Work")).toBeInTheDocument();
    expect(screen.getByText("Overloaded")).toBeInTheDocument();
  });

  it("sorts by severity — danger first, info last", () => {
    const { container } = render(<GapAnalysis gaps={mockGaps} />);
    const labels = container.querySelectorAll(".text-sm.font-medium");
    expect(labels[0]).toHaveTextContent("Project X has no activity in 10 days");
    expect(labels[2]).toHaveTextContent("3 hours on untracked repo");
  });

  it("applies danger styling to danger items", () => {
    const { container } = render(<GapAnalysis gaps={[mockGaps[0]]} />);
    const card = container.querySelector(".border-red-500\\/30");
    expect(card).toBeInTheDocument();
  });

  it("shows aligned message when no gaps", () => {
    render(<GapAnalysis gaps={[]} />);
    expect(screen.getByText(/No gaps detected/)).toBeInTheDocument();
  });
});
