"use client";

import { useEffect, useState } from "react";

export default function SystemStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking");

  useEffect(() => {
    fetch("/api/gateway/test")
      .then(r => r.json())
      .then(d => setStatus(d.connected ? "connected" : "disconnected"))
      .catch(() => setStatus("disconnected"));
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">시스템 상태</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Gateway WebSocket</span>
          <span className={`text-sm flex items-center gap-1.5 ${
            status === "connected" ? "text-emerald-600" :
            status === "disconnected" ? "text-red-500" : "text-gray-400"
          }`}>
            <span className={`inline-block w-2 h-2 rounded-full ${
              status === "connected" ? "bg-emerald-500" :
              status === "disconnected" ? "bg-red-500" : "bg-gray-400 animate-pulse"
            }`} />
            {status === "connected" ? "연결됨" : status === "disconnected" ? "연결 끊김" : "확인 중..."}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">포트</span>
          <span className="text-sm text-gray-500 font-mono">18789</span>
        </div>
      </div>
    </div>
  );
}
