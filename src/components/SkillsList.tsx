"use client";

import { useEffect, useState } from "react";

interface Skill {
  slug: string;
  name: string;
  description: string;
  version: string;
  emoji: string;
}

interface SkillsData {
  skills: Skill[];
  zipOnlyCount: number;
}

const FALLBACK_EMOJIS: Record<string, string> = {
  "tavily-search": "🔍",
  gmail: "📧",
  "agent-browser": "🌐",
  "ai-trend-monitor": "📈",
  "api-gateway": "🔌",
  "auto-updater": "🔄",
  "daily-brief": "📰",
  "proactive-agent": "🤖",
  "self-improving-agent": "🧠",
  ontology: "🗂️",
  gog: "🎮",
  byterover: "🐛",
  loopwind: "🔁",
  "nano-banana-pro": "🍌",
};

export default function SkillsList() {
  const [data, setData] = useState<SkillsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getEmoji = (skill: Skill) =>
    skill.emoji || FALLBACK_EMOJIS[skill.slug] || "⚡";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🧩</span>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Skills
        </h3>
        {data && (
          <span className="ml-auto text-sm text-zinc-500">
            {data.skills.length}개 설치됨
            {data.zipOnlyCount > 0 && (
              <span className="text-zinc-400">
                {" "}
                + {data.zipOnlyCount} 미설치
              </span>
            )}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-zinc-400">
          로딩 중...
        </div>
      ) : !data || data.skills.length === 0 ? (
        <div className="py-8 text-center text-zinc-400">스킬 없음</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {data.skills.map((skill) => (
            <div
              key={skill.slug}
              className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{getEmoji(skill)}</span>
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                  {skill.name}
                </span>
              </div>
              {skill.description && (
                <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                  {skill.description}
                </p>
              )}
              {skill.version && (
                <span className="text-[10px] text-zinc-400 mt-1 inline-block">
                  v{skill.version}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
