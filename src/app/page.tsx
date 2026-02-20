import MissionBanner from "@/components/MissionBanner";
import TaskTracker from "@/components/TaskTracker";
import CalendarView from "@/components/CalendarView";
import DocumentsViewer from "@/components/DocumentsViewer";
import RemoteStatus from "@/components/RemoteStatus";
import SkillsList from "@/components/SkillsList";
import MemoryTimeline from "@/components/MemoryTimeline";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🥑</span>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">
                Mission Control
              </h1>
              <p className="text-sm text-zinc-500">
                로찌 — OpenClaw AI Assistant
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-500">
              {new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
          </div>
        </header>

        {/* Mission Statement */}
        <MissionBanner />

        {/* Main Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <TaskTracker />
          <CalendarView />
        </div>

        {/* Remote PC + Skills */}
        <div className="grid gap-6 md:grid-cols-2">
          <RemoteStatus />
          <SkillsList />
        </div>

        {/* Memory Timeline */}
        <MemoryTimeline />

        {/* Documents */}
        <DocumentsViewer />
      </div>
    </div>
  );
}
