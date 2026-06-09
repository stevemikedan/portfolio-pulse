import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatCards } from "./StatCards";

describe("StatCards", () => {
  const defaultProps = {
    totalTasks: 9,
    inProgress: 3,
    overdue: 0,
    finishRate: 0.35,
    activeRepos: 5,
  };

  it("renders all 5 stat cards", () => {
    render(<StatCards {...defaultProps} />);
    expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByText("Finish Rate")).toBeInTheDocument();
    expect(screen.getByText("Active Repos")).toBeInTheDocument();
  });

  it("displays correct numeric values", () => {
    render(<StatCards {...defaultProps} />);
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("formats finish rate as percentage", () => {
    render(<StatCards {...defaultProps} />);
    expect(screen.getByText("35%")).toBeInTheDocument();
  });

  it("shows red for overdue > 0", () => {
    const { container } = render(<StatCards {...defaultProps} overdue={2} />);
    const overdueValue = screen.getByText("2");
    expect(overdueValue).toHaveClass("text-red-400");
  });

  it("shows green for overdue = 0", () => {
    render(<StatCards {...defaultProps} overdue={0} />);
    const overdueValue = screen.getByText("0");
    expect(overdueValue).toHaveClass("text-emerald-400");
  });

  it("shows amber for low finish rate", () => {
    render(<StatCards {...defaultProps} finishRate={0.3} />);
    const rate = screen.getByText("30%");
    expect(rate).toHaveClass("text-amber-400");
  });

  it("shows green for high finish rate", () => {
    render(<StatCards {...defaultProps} finishRate={0.75} />);
    const rate = screen.getByText("75%");
    expect(rate).toHaveClass("text-emerald-400");
  });
});
