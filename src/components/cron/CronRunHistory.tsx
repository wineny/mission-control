"use client";

import { useEffect, useState } from "react";
import { relativeTime } from "@/lib/cron-utils";

interface RunEntry {
  id: string;
  jobId: string;
  startedAt: string;
  finishedAt?: string;
  status: string;
  error?: string;
  duration?: number;
}

export default function CronRunHistory({ jobId }: { jobId: string }) {
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cron/${jobId}/runs?limit=20`)
      .then(r => r.json())
      .then(d => { setRuns(d.runs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [jobId]);

  if (loading) return <div className="py-4 text-gray-400 text-sm">로딩 중...</div>;
  if (runs.length === 0) return <div className="py-4 text-gray-400 text-sm">실행 이력이 없습니다.</div>;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 mb-3">실행 이력</h4>
      <div className="space-y-1">
        {runs.map((run) => (
          <div key={run.id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm">
            <span className={run.status === "success" ? "text-emerald-500" : run.status === "error" ? "text-red-500" : "text-amber-500"}>
              {run.status === "success" ? "✓" : run.status === "error" ? "✕" : "⏳"}
            </span>
            <span className="text-gray-700 flex-1">{relativeTime(run.startedAt)}</span>
            {run.duration !== undefined && (
              <span className="text-gray-400 text-xs">{(run.duration / 1000).toFixed(1)}s</span>
            )}
            {run.error && (
              <span className="text-red-500 text-xs truncate max-w-[200px]">{run.error}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
