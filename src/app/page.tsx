"use client";

import { useEffect, useState } from "react";
import type { CronJob } from "@/lib/gateway-types";
import MissionBanner from "@/components/MissionBanner";
import TaskTracker from "@/components/TaskTracker";
import StatsCards from "@/components/overview/StatsCards";
import RecentRuns from "@/components/overview/RecentRuns";
import SystemStatus from "@/components/overview/SystemStatus";

export default function Home() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    fetch("/api/cron").then(r => r.json()).then(d => setJobs(d.jobs || [])).catch(() => {});
    fetch("/api/sessions").then(r => r.json()).then(d => setSessionCount(d.sessions?.length || 0)).catch(() => {});
  }, []);

  const totalCron = jobs.length;
  const activeCron = jobs.filter(j => j.enabled).length;
  const errorCron = jobs.filter(j => j.state.lastStatus === "error" || j.state.lastStatus === "timeout" || (j.state.consecutiveErrors && j.state.consecutiveErrors > 0)).length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🥑</span>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">로찌네 대시보드</h1>
            <p className="text-sm text-zinc-500">OpenClaw Mission Control</p>
          </div>
        </div>
        <p className="text-sm text-zinc-500">
          {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        </p>
      </header>

      <MissionBanner />
      <StatsCards totalCron={totalCron} activeCron={activeCron} errorCron={errorCron} totalSessions={sessionCount} />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentRuns jobs={jobs} />
        <SystemStatus />
      </div>

      <TaskTracker />
    </div>
  );
}
