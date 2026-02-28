"use client";

import { useEffect, useState } from "react";
import SessionList from "@/components/sessions/SessionList";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then(r => r.json())
      .then(d => { setSessions(d.sessions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">💬 세션</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{sessions.length}개</span>
      </div>
      {loading ? (
        <div className="py-12 text-center text-gray-400 animate-pulse">세션 로딩 중...</div>
      ) : (
        <SessionList sessions={sessions} />
      )}
    </div>
  );
}
