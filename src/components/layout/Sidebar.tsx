"use client";

import { useEffect, useState } from "react";
import SidebarItem from "./SidebarItem";

interface SidebarCounts {
  cron: number;
  sessions: number;
}

export default function Sidebar() {
  const [counts, setCounts] = useState<SidebarCounts>({ cron: 0, sessions: 0 });
  const [agents, setAgents] = useState<{ id: string; name: string; emoji?: string }[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetch("/api/cron").then(r => r.json()).then(d => {
      setCounts(prev => ({ ...prev, cron: d.jobs?.length || 0 }));
    }).catch(() => {});

    fetch("/api/sessions").then(r => r.json()).then(d => {
      setCounts(prev => ({ ...prev, sessions: d.sessions?.length || 0 }));
    }).catch(() => {});

    fetch("/api/agents").then(r => r.json()).then(d => {
      setAgents(d.agents || []);
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-50 md:hidden rounded-lg bg-gray-100 p-2 text-gray-600"
      >
        {collapsed ? "✕" : "☰"}
      </button>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-50 border-r border-gray-200 flex flex-col transition-transform ${
        collapsed ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200">
          <span className="text-2xl">🥑</span>
          <span className="text-lg font-bold text-gray-900">로찌네 대시보드</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* 모니터링 */}
          <div>
            <p className="px-3 mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-400">
              모니터링
            </p>
            <div className="space-y-0.5">
              <SidebarItem href="/" icon="📊" label="개요" />
              <SidebarItem href="/cron" icon="⏰" label="크론 잡" count={counts.cron} />
              <SidebarItem href="/sessions" icon="💬" label="세션" count={counts.sessions} />
            </div>
          </div>

          {/* 에이전트 */}
          <div>
            <p className="px-3 mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-400">
              에이전트
            </p>
            <div className="space-y-0.5">
              {agents.length > 0 ? (
                agents.map(a => (
                  <SidebarItem key={a.id} href="/agents" icon={a.emoji || "🤖"} label={a.name} />
                ))
              ) : (
                <SidebarItem href="/agents" icon="🤖" label="에이전트" />
              )}
            </div>
          </div>

          {/* 시스템 */}
          <div>
            <p className="px-3 mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-400">
              시스템
            </p>
            <div className="space-y-0.5">
              <SidebarItem href="/memory" icon="📁" label="메모리" />
              <SidebarItem href="/skills" icon="🔧" label="스킬" />
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-400">Mission Control v1.0</p>
        </div>
      </aside>
    </>
  );
}
