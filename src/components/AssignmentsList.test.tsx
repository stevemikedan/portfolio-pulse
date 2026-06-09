import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AssignmentsList } from "./AssignmentsList";
import type { Task } from "@/lib/types";

const makeTasks = (overrides: Partial<Task>[] = []): Task[] => [
  {
    id: "t1",
    title: "High priority in-progress task",
    source: "notion",
    status: "in_progress",
    priority: "high",
    ...overrides[0],
  },
  {
    id: "t2",
    title: "Medium priority todo task",
    source: "github",
    sourceUrl: "https://github.com/example/repo/issues/1",
    status: "todo",
    priority: "medium",
    project: "TestProject",
    tags: ["feature"],
    ...overrides[1],
  },
  {
    id: "t3",
    title: "Done task",
    source: "notion",
    status: "done",
    priority: "low",
    ...overrides[2],
  },
];

describe("AssignmentsList", () => {
  it("renders all tasks", () => {
    render(<AssignmentsList tasks={makeTasks()} />);
    expect(screen.getByText("High priority in-progress task")).toBeInTheDocument();
    expect(screen.getByText("Medium priority todo task")).toBeInTheDocument();
    expect(screen.getByText("Done task")).toBeInTheDocument();
  });

  it("sorts by status then priority (in_progress first, done last)", () => {
    const { container } = render(<AssignmentsList tasks={makeTasks()} />);
    const items = container.querySelectorAll(".text-sm.font-medium");
    expect(items[0]).toHaveTextContent("High priority in-progress task");
    expect(items[2]).toHaveTextContent("Done task");
  });

  it("displays source badge for Notion tasks", () => {
    render(<AssignmentsList tasks={makeTasks()} />);
    const badges = screen.getAllByText("N");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("renders GitHub source as a link when sourceUrl exists", () => {
    render(<AssignmentsList tasks={makeTasks()} />);
    const ghLink = screen.getByText("GH").closest("a");
    expect(ghLink).toHaveAttribute("href", "https://github.com/example/repo/issues/1");
    expect(ghLink).toHaveAttribute("target", "_blank");
  });

  it("displays project name when present", () => {
    render(<AssignmentsList tasks={makeTasks()} />);
    expect(screen.getByText("TestProject")).toBeInTheDocument();
  });

  it("displays tags", () => {
    render(<AssignmentsList tasks={makeTasks()} />);
    expect(screen.getByText("feature")).toBeInTheDocument();
  });

  it("shows overdue badge for past-due tasks", () => {
    const tasks = makeTasks([{ dueDate: "2020-01-01" }]);
    render(<AssignmentsList tasks={tasks} />);
    expect(screen.getByText(/overdue/)).toBeInTheDocument();
  });

  it("shows due-soon badge for tasks due within 3 days", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tasks = makeTasks([{ dueDate: tomorrow.toISOString().split("T")[0] }]);
    render(<AssignmentsList tasks={tasks} />);
    expect(screen.getByText(/due in/)).toBeInTheDocument();
  });

  it("renders empty list without crashing", () => {
    render(<AssignmentsList tasks={[]} />);
    expect(screen.getByText("My Assignments")).toBeInTheDocument();
  });
});
