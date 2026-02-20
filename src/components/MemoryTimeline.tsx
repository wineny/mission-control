"use client";

import { useEffect, useState, useCallback } from "react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  text: string;
}

interface TimelineEntry {
  name: string;
  type: "daily" | "longterm" | "workspace";
  modifiedAt: string;
  sizeBytes: number;
  lineCount: number;
  hash: string;
  content: string;
  staleDays: number;
  diff: DiffLine[] | null;
  prevSnapshotAt: string | null;
}

interface TimelineData {
  entries: TimelineEntry[];
  missingDays: string[];
  summary: {
    totalFiles: number;
    dailyCount: number;
    missingDayCount: number;
    oldestStale: number;
    lastUpdate: string;
  } | null;
}

const TYPE_STYLES: Record<string, { bg: string; label: string }> = {
  daily: {
    bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    label: "Daily",
  },
  longterm: {
    bg: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    label: "Long-term",
  },
  workspace: {
    bg: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    label: "Workspace",
  },
};

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StaleBadge({ days }: { days: number }) {
  if (days === 0)
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        Today
      </span>
    );
  if (days <= 2) return null;
  if (days <= 5)
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
        {days}일 정체
      </span>
    );
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      {days}일 정체
    </span>
  );
}

function DiffView({
  diff,
  prevSnapshotAt,
}: {
  diff: DiffLine[];
  prevSnapshotAt: string | null;
}) {
  const added = diff.filter((l) => l.type === "added").length;
  const removed = diff.filter((l) => l.type === "removed").length;
  // Show only changed lines + surrounding context
  const contextLines = 2;
  const changedIndices = new Set<number>();
  diff.forEach((line, i) => {
    if (line.type !== "unchanged") {
      for (let j = Math.max(0, i - contextLines); j <= Math.min(diff.length - 1, i + contextLines); j++) {
        changedIndices.add(j);
      }
    }
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-[10px]">
        <span className="text-zinc-400">
          vs {prevSnapshotAt ? formatTime(prevSnapshotAt) : "이전"} 스냅샷
        </span>
        {added > 0 && (
          <span className="text-emerald-600 dark:text-emerald-400">
            +{added}줄
          </span>
        )}
        {removed > 0 && (
          <span className="text-red-600 dark:text-red-400">
            -{removed}줄
          </span>
        )}
      </div>
      <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 p-3 max-h-64 overflow-y-auto">
        <pre className="text-[11px] font-mono leading-relaxed">
          {diff.map((line, i) => {
            if (!changedIndices.has(i)) {
              // Check if previous line was shown (avoid duplicate separators)
              if (i > 0 && changedIndices.has(i - 1)) return null;
              if (changedIndices.has(i + 1))
                return (
                  <div key={i} className="text-zinc-300 dark:text-zinc-600 select-none">
                    ···
                  </div>
                );
              return null;
            }
            return (
              <div
                key={i}
                className={
                  line.type === "added"
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                    : line.type === "removed"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 line-through"
                    : "text-zinc-500 dark:text-zinc-500"
                }
              >
                <span className="select-none text-[10px] w-5 inline-block text-right mr-2 opacity-50">
                  {line.type === "added"
                    ? "+"
                    : line.type === "removed"
                    ? "-"
                    : " "}
                </span>
                {line.text}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

function ContentView({ content }: { content: string }) {
  return (
    <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 p-3 max-h-64 overflow-y-auto">
      <pre className="text-[11px] text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed">
        {content}
      </pre>
    </div>
  );
}

export default function MemoryTimeline() {
  const [data, setData] = useState<TimelineData | null>(null);
  const [prevHashes, setPrevHashes] = useState<Record<string, string>>({});
  const [changedFiles, setChangedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<Record<string, "content" | "diff">>({});

  const fetchData = useCallback(() => {
    fetch("/api/memory/timeline")
      .then((r) => r.json())
      .then((d: TimelineData) => {
        if (Object.keys(prevHashes).length > 0) {
          const newChanges = new Set<string>();
          for (const entry of d.entries) {
            const prev = prevHashes[entry.name];
            if (prev && prev !== entry.hash) {
              newChanges.add(entry.name);
            }
          }
          if (newChanges.size > 0) {
            setChangedFiles(newChanges);
            setTimeout(() => setChangedFiles(new Set()), 5000);
          }
        }

        const hashes: Record<string, string> = {};
        for (const e of d.entries) hashes[e.name] = e.hash;
        setPrevHashes(hashes);

        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [prevHashes]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleView = (name: string) => {
    setViewMode((prev) => ({
      ...prev,
      [name]: prev[name] === "diff" ? "content" : "diff",
    }));
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🧠</span>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Memory Timeline
        </h3>
        {data?.summary && (
          <span className="ml-auto text-sm text-zinc-500">
            {data.summary.totalFiles}개 파일
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-zinc-400">
          로딩 중...
        </div>
      ) : !data?.summary ? (
        <div className="py-8 text-center text-zinc-400">
          메모리 데이터 없음
        </div>
      ) : (
        <div className="space-y-4">
          {/* Missing daily alert */}
          {data.missingDays.length > 0 && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 dark:bg-red-900/10 dark:border-red-900/30">
              <p className="text-sm text-red-700 dark:text-red-400">
                <span className="font-medium">
                  Daily 메모리 {data.missingDays.length}일 누락
                </span>
                <span className="text-red-500 dark:text-red-500 ml-2 text-xs">
                  {data.missingDays.slice(-5).join(", ")}
                  {data.missingDays.length > 5 && " ..."}
                </span>
              </p>
            </div>
          )}

          {/* Timeline entries */}
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {data.entries
              .sort(
                (a, b) =>
                  new Date(b.modifiedAt).getTime() -
                  new Date(a.modifiedAt).getTime()
              )
              .map((entry) => {
                const isExpanded = expanded === entry.name;
                const mode = viewMode[entry.name] || "content";
                const hasDiff = !!entry.diff;

                return (
                  <div
                    key={entry.name}
                    className={`rounded-xl transition-all ${
                      changedFiles.has(entry.name)
                        ? "bg-emerald-50 ring-2 ring-emerald-400 dark:bg-emerald-900/20"
                        : "bg-zinc-50 dark:bg-zinc-800/50"
                    }`}
                  >
                    {/* Header row (clickable) */}
                    <button
                      onClick={() =>
                        setExpanded(isExpanded ? null : entry.name)
                      }
                      className="w-full text-left p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`shrink-0 h-2.5 w-2.5 rounded-full ${
                            entry.staleDays === 0
                              ? "bg-emerald-500"
                              : entry.staleDays <= 2
                              ? "bg-zinc-400"
                              : entry.staleDays <= 5
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        />

                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                          {entry.name}
                        </span>

                        <span
                          className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full ${
                            TYPE_STYLES[entry.type].bg
                          }`}
                        >
                          {TYPE_STYLES[entry.type].label}
                        </span>

                        <StaleBadge days={entry.staleDays} />

                        {hasDiff && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                            diff
                          </span>
                        )}

                        {changedFiles.has(entry.name) && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 animate-pulse">
                            Updated!
                          </span>
                        )}

                        <span className="ml-auto shrink-0 text-xs text-zinc-400">
                          {formatRelative(entry.modifiedAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 ml-[18px]">
                        <span className="text-[10px] text-zinc-400">
                          {formatTime(entry.modifiedAt)}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {entry.lineCount}줄
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {(entry.sizeBytes / 1024).toFixed(1)}KB
                        </span>
                        <span className="text-[10px] text-zinc-300 dark:text-zinc-600 font-mono">
                          #{entry.hash.slice(0, 6)}
                        </span>
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2">
                        {/* Tab switcher */}
                        {hasDiff && (
                          <div className="flex gap-1 ml-[18px]">
                            <button
                              onClick={() => toggleView(entry.name)}
                              className={`text-[11px] px-2 py-1 rounded-md transition-colors ${
                                mode === "content"
                                  ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                                  : "text-zinc-400 hover:text-zinc-600"
                              }`}
                            >
                              전체 내용
                            </button>
                            <button
                              onClick={() => toggleView(entry.name)}
                              className={`text-[11px] px-2 py-1 rounded-md transition-colors ${
                                mode === "diff"
                                  ? "bg-violet-200 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200"
                                  : "text-zinc-400 hover:text-zinc-600"
                              }`}
                            >
                              변경사항
                            </button>
                          </div>
                        )}

                        <div className="ml-[18px]">
                          {mode === "diff" && entry.diff ? (
                            <DiffView
                              diff={entry.diff}
                              prevSnapshotAt={entry.prevSnapshotAt}
                            />
                          ) : (
                            <ContentView content={entry.content} />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span>30초마다 자동 갱신</span>
            <button
              onClick={fetchData}
              className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              수동 새로고침
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
