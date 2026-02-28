"use client";

import { useEffect, useState, useCallback } from "react";
import type { CronJob } from "@/lib/gateway-types";
import CronTable from "@/components/cron/CronTable";

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = useCallback(() => {
    fetch("/api/cron")
      .then(r => r.json())
      .then(d => {
        setJobs(d.jobs || []);
        setError(d.error || "");
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30_000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const agents = [...new Set(jobs.map(j => j.agent).filter(Boolean))] as string[];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {loading ? (
        <div className="flex items-center justify-center h-64 text-zinc-500">
          <span className="animate-pulse">크론 잡 로딩 중...</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-800 bg-red-900/20 p-6 text-red-300">
          <p className="font-medium">Gateway 연결 오류</p>
          <p className="text-sm mt-1 text-red-400">{error}</p>
          <button onClick={fetchJobs} className="mt-3 text-sm underline hover:text-red-200">재시도</button>
        </div>
      ) : (
        <CronTable jobs={jobs} agents={agents} onRefresh={fetchJobs} />
      )}
    </div>
  );
}
