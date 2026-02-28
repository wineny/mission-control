"use client";

import { useEffect, useState } from "react";

interface Session {
  id: string;
  startedAt?: string;
  timestamp?: string;
  topic: string;
  messageCount: number;
}

export default function TaskTracker() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d.sessions) ? d.sessions : [];
        setSessions(list);
        setLoading(false);
      })
      .catch(() => {
        setSessions([]);
        setLoading(false);
      });
  }, []);

  const getTimestamp = (s: Session) => s.timestamp || s.startedAt || "";

  const formatDate = (ts: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours().toString().padStart(2, "0");
    const mins = d.getMinutes().toString().padStart(2, "0");
    return `${month}/${day} ${hours}:${mins}`;
  };

  const extractTopic = (text: string) => {
    const cleaned = text
      .replace(/\[Thread history.*?\]\s*/g, "")
      .replace(/\[Slack .*?\] /g, "")
      .replace(/\[slack message id:.*?\]/g, "")
      .trim();
    return cleaned.slice(0, 80) + (cleaned.length > 80 ? "..." : "");
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📋</span>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Task Tracker
        </h3>
        <span className="ml-auto text-sm text-zinc-500">
          최근 {sessions.length}개 세션
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-zinc-400">
          로딩 중...
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-8 text-center text-zinc-400">세션 없음</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-start gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50"
            >
              <div className="shrink-0 mt-0.5 h-2 w-2 rounded-full bg-emerald-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                  {extractTopic(s.topic)}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-zinc-500">
                    {formatDate(getTimestamp(s))}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {s.messageCount}개 메시지
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
