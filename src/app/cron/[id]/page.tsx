"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { CronJob } from "@/lib/gateway-types";
import { relativeTime, formatSchedule, cronToKorean } from "@/lib/cron-utils";
import CronStatusBadge from "@/components/cron/CronStatusBadge";
import CronRunHistory from "@/components/cron/CronRunHistory";

export default function CronDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<CronJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cron")
      .then(r => r.json())
      .then(d => {
        const found = (d.jobs || []).find((j: CronJob) => j.id === id);
        setJob(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-gray-400 animate-pulse">로딩 중...</div>;
  if (!job) return <div className="p-10 text-gray-400">크론 잡을 찾을 수 없습니다.</div>;

  const handleRun = async () => {
    await fetch("/api/cron/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <Link href="/cron" className="text-sm text-gray-500 hover:text-gray-700">← 크론 잡 목록</Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CronStatusBadge enabled={job.enabled} lastStatus={job.state.lastStatus} consecutiveErrors={job.state.consecutiveErrors} />
            <h2 className="text-xl font-bold text-gray-900">{job.name}</h2>
          </div>
          <button onClick={handleRun}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">
            ⚡ 수동 실행
          </button>
        </div>

        {job.description && <p className="text-sm text-gray-500 mb-4">{job.description}</p>}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-1">에이전트</p>
            <p className="text-gray-800">{job.agent || "-"}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">스케줄</p>
            <p className="text-gray-800 font-mono text-xs">{formatSchedule(job.schedule.expr, job.schedule.tz)}</p>
            <p className="text-gray-500 text-xs mt-0.5">{cronToKorean(job.schedule.expr)}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">마지막 실행</p>
            <p className="text-gray-800">{job.state.lastRunAtMs ? relativeTime(job.state.lastRunAtMs) : "-"}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">다음 실행</p>
            <p className="text-gray-800">{job.state.nextRunAtMs ? relativeTime(job.state.nextRunAtMs) : "-"}</p>
          </div>
          {job.state.lastDurationMs !== undefined && (
            <div>
              <p className="text-gray-400 mb-1">실행 시간</p>
              <p className="text-gray-800">{(job.state.lastDurationMs / 1000).toFixed(1)}초</p>
            </div>
          )}
          {job.delivery && (
            <div>
              <p className="text-gray-400 mb-1">전달</p>
              <p className="text-gray-800">{job.delivery.channel} {job.delivery.to ? `→ ${job.delivery.to}` : ""}</p>
            </div>
          )}
          {job.state.lastError && (
            <div className="col-span-2">
              <p className="text-gray-400 mb-1">마지막 오류</p>
              <p className="text-red-500 text-xs">{job.state.lastError}</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <CronRunHistory jobId={id} />
      </div>
    </div>
  );
}
