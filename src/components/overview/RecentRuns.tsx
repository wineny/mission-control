"use client";

import type { CronJob } from "@/lib/gateway-types";
import { relativeTime } from "@/lib/cron-utils";
import CronStatusBadge from "@/components/cron/CronStatusBadge";

interface RecentRunsProps {
  jobs: CronJob[];
}

export default function RecentRuns({ jobs }: RecentRunsProps) {
  const recent = jobs
    .filter(j => j.state.lastRunAtMs)
    .sort((a, b) => (b.state.lastRunAtMs || 0) - (a.state.lastRunAtMs || 0))
    .slice(0, 10);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">최근 크론 실행</h3>
      {recent.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">실행 이력이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {recent.map(job => (
            <div key={job.id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <CronStatusBadge enabled={job.enabled} lastStatus={job.state.lastStatus} consecutiveErrors={job.state.consecutiveErrors} />
              <span className="text-sm text-gray-800 flex-1 truncate">{job.name}</span>
              <span className="text-xs text-gray-400">{job.agent}</span>
              <span className="text-xs text-gray-500">{relativeTime(job.state.lastRunAtMs!)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
