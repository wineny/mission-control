"use client";

import { useEffect, useState } from "react";
import AgentCard from "@/components/agents/AgentCard";

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents")
      .then(r => r.json())
      .then(d => { setAgents(d.agents || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">🤖 에이전트</h1>
      {loading ? (
        <div className="py-12 text-center text-gray-400 animate-pulse">에이전트 로딩 중...</div>
      ) : agents.length === 0 ? (
        <div className="py-12 text-center text-gray-400">에이전트 정보를 가져올 수 없습니다.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((a: { id: string; name: string; emoji?: string; description?: string; model?: string; status?: string }) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </div>
      )}
    </div>
  );
}
