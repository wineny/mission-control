"use client";

interface Agent {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  model?: string;
  status?: string;
}

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{agent.emoji || "🤖"}</span>
        <div>
          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
          <p className="text-xs text-gray-400">{agent.id}</p>
        </div>
      </div>
      {agent.description && <p className="text-sm text-gray-500 mb-3">{agent.description}</p>}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {agent.model && <span className="bg-gray-100 px-2 py-0.5 rounded">{agent.model}</span>}
        {agent.status && (
          <span className={`flex items-center gap-1 ${agent.status === "active" ? "text-emerald-600" : "text-gray-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${agent.status === "active" ? "bg-emerald-500" : "bg-gray-400"}`} />
            {agent.status}
          </span>
        )}
      </div>
    </div>
  );
}
