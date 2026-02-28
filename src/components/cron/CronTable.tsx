"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { CronJob } from "@/lib/gateway-types";
import { relativeTime, formatSchedule } from "@/lib/cron-utils";
import CronStatusBadge from "./CronStatusBadge";
import CronJobForm from "./CronJobForm";

type FilterTab = "all" | "error" | "disabled";

interface CronTableProps {
  jobs: CronJob[];
  agents: string[];
  onRefresh: () => void;
}

const AGENT_EMOJIS: Record<string, string> = {
  "로찌": "🥑",
  "뽀야": "😺",
  "뽀짜이": "🐱",
};

function AgentBadge({ name }: { name: string }) {
  const emoji = AGENT_EMOJIS[name] || "🤖";
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
      <span>{emoji}</span>
      <span>{name}</span>
    </span>
  );
}

export default function CronTable({ jobs, agents, onRefresh }: CronTableProps) {
  const [tab, setTab] = useState<FilterTab>("all");
  const [agentFilter, setAgentFilter] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob] = useState<CronJob | null>(null);

  const filtered = jobs.filter(j => {
    if (tab === "error") return j.state.lastStatus === "error" || j.state.lastStatus === "timeout" || (j.state.consecutiveErrors && j.state.consecutiveErrors > 0);
    if (tab === "disabled") return !j.enabled;
    if (agentFilter) return j.agent === agentFilter;
    return true;
  });

  const uniqueAgents = [...new Set(jobs.map(j => j.agent).filter(Boolean))] as string[];

  const handleToggle = useCallback(async (id: string, enabled: boolean) => {
    await fetch(`/api/cron/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    });
    onRefresh();
  }, [onRefresh]);

  const handleRun = useCallback(async (id: string) => {
    await fetch("/api/cron/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onRefresh();
  }, [onRefresh]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`"${name}" 크론 잡을 삭제하시겠습니까?`)) return;
    await fetch(`/api/cron/${id}`, { method: "DELETE" });
    onRefresh();
  }, [onRefresh]);

  const handleAdd = async (data: Record<string, string>) => {
    await fetch("/api/cron", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        agent: data.agent,
        schedule: { kind: "cron", expr: data.expression, tz: data.timezone },
        payload: { kind: "agentTurn", message: data.message },
      }),
    });
    setShowForm(false);
    onRefresh();
  };

  const handleEdit = async (data: Record<string, string>) => {
    if (!editJob) return;
    await fetch(`/api/cron/${editJob.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        agent: data.agent,
        schedule: { kind: "cron", expr: data.expression, tz: data.timezone },
        payload: { kind: "agentTurn", message: data.message },
      }),
    });
    setEditJob(null);
    onRefresh();
  };

  const tabs: { key: FilterTab | string; label: string; icon?: string }[] = [
    { key: "all", label: "전체" },
    ...uniqueAgents.map(a => ({ key: `agent:${a}`, label: a, icon: AGENT_EMOJIS[a] || "🤖" })),
    { key: "error", label: "오류", icon: "⚠" },
    { key: "disabled", label: "비활성", icon: "⏸" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">⏰ 크론 잡</h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">{jobs.length}개</span>
        </div>
        <button onClick={() => setShowForm(true)}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors">
          + 추가
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map(t => {
          const isActive = t.key === tab || t.key === `agent:${agentFilter}`;
          return (
            <button
              key={t.key}
              onClick={() => {
                if (t.key.startsWith("agent:")) {
                  setTab("all");
                  setAgentFilter(t.key.replace("agent:", ""));
                } else {
                  setTab(t.key as FilterTab);
                  setAgentFilter(null);
                }
              }}
              className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${
                isActive
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              {t.icon && <span className="mr-1">{t.icon}</span>}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-left bg-gray-50/50">
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3 font-medium">이름</th>
              <th className="px-4 py-3 font-medium">에이전트</th>
              <th className="px-4 py-3 font-medium">스케줄</th>
              <th className="px-4 py-3 font-medium">마지막 실행</th>
              <th className="px-4 py-3 font-medium">다음 실행</th>
              <th className="px-4 py-3 w-16 font-medium">오류</th>
              <th className="px-4 py-3 w-24 font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(job => (
              <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <CronStatusBadge
                    enabled={job.enabled}
                    lastStatus={job.state.lastStatus}
                    consecutiveErrors={job.state.consecutiveErrors}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/cron/${job.id}`} className="hover:text-emerald-600 transition-colors">
                    <div className="font-medium text-gray-900">{job.name}</div>
                    {job.state.lastError && (
                      <div className="text-xs text-red-500 mt-0.5 truncate max-w-[300px]">↳ {job.state.lastError}</div>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {job.agent && <AgentBadge name={job.agent} />}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {formatSchedule(job.schedule.expr, job.schedule.tz)}
                </td>
                <td className="px-4 py-3 text-xs">
                  {job.state.lastRunAtMs ? (
                    <span className={job.state.lastStatus === "error" ? "text-amber-600" : "text-gray-500"}>
                      {relativeTime(job.state.lastRunAtMs)}
                    </span>
                  ) : "-"}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {job.state.nextRunAtMs ? relativeTime(job.state.nextRunAtMs) : "-"}
                </td>
                <td className="px-4 py-3">
                  {job.state.consecutiveErrors && job.state.consecutiveErrors > 0 ? (
                    <span className="text-red-500 text-xs font-semibold bg-red-50 px-1.5 py-0.5 rounded">✕ {job.state.consecutiveErrors}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleToggle(job.id, job.enabled)}
                      title={job.enabled ? "비활성화" : "활성화"}
                      className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                      {job.enabled ? "⏸" : "▶"}
                    </button>
                    <button onClick={() => handleRun(job.id)} title="수동 실행"
                      className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                      ⚡
                    </button>
                    <button onClick={() => setEditJob(job)} title="수정"
                      className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(job.id, job.name)} title="삭제"
                      className="rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50">
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400">해당하는 크론 잡이 없습니다.</div>
        )}
      </div>

      {showForm && (
        <CronJobForm title="크론 잡 추가" onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      )}
      {editJob && (
        <CronJobForm
          title="크론 잡 수정"
          initial={{
            name: editJob.name,
            description: editJob.description,
            expression: editJob.schedule.expr,
            timezone: editJob.schedule.tz,
            message: editJob.payload?.message,
            agent: editJob.agent,
          }}
          onSubmit={handleEdit}
          onCancel={() => setEditJob(null)}
        />
      )}
    </div>
  );
}
