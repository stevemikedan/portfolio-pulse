import { StatCards } from "@/components/StatCards";
import { AssignmentsList } from "@/components/AssignmentsList";
import { ActivityFeed } from "@/components/ActivityFeed";
import { GapAnalysis } from "@/components/GapAnalysis";
import { RhythmChart } from "@/components/RhythmChart";
import { mockData } from "@/lib/mock-data";

export default function Home() {
  const { stats, tasks, activity, gaps, rhythm } = mockData;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <StatCards
          totalTasks={stats.totalTasks}
          inProgress={stats.inProgress}
          overdue={stats.overdue}
          finishRate={stats.finishRate}
          activeRepos={stats.activeRepos}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssignmentsList tasks={tasks} />
          <ActivityFeed events={activity} />
          <GapAnalysis gaps={gaps} />
          <RhythmChart data={rhythm} />
        </div>
      </div>
    </div>
  );
}
