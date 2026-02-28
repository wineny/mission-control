"use client";

import { relativeTime } from "@/lib/cron-utils";

interface Session {
  id: string;
  startedAt?: string;
  timestamp?: string;
  topic?: string;
  messageCount?: number;
  status?: string;
  agentId?: string;
  lastActiveAt?: string;
}

export default function SessionList({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return <div className="py-12 text-center text-gray-400">세션이 없습니다.</div>;
  }

  return (
    <div className="space-y-2">
      {sessions.map(s => {
        const time = s.startedAt || s.timestamp || "";
        const topic = s.topic || "(대화 내용 없음)";
        return (
          <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">{topic}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  {time && <span className="text-xs text-gray-400">{relativeTime(time)}</span>}
                  {s.messageCount !== undefined && (
                    <span className="text-xs text-gray-400">{s.messageCount}개 메시지</span>
                  )}
                  {s.agentId && (
                    <span className="text-xs text-gray-500">🤖 {s.agentId}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
