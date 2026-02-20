"use client";

import { useEffect, useState } from "react";

interface MemoryFile {
  name: string;
  content: string;
  modifiedAt: string;
  type: "daily" | "longterm" | "workspace";
}

const TYPE_LABELS: Record<string, string> = {
  daily: "일일 메모리",
  longterm: "장기 메모리",
  workspace: "워크스페이스",
};

const TYPE_COLORS: Record<string, string> = {
  daily: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  longterm:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  workspace:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function DocumentsViewer() {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [selected, setSelected] = useState<MemoryFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/memory")
      .then((r) => r.json())
      .then((d) => {
        setFiles(d.files || []);
        setLoading(false);
      });
  }, []);

  const formatDate = (ts: string) => {
    return new Date(ts).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📄</span>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Documents
        </h3>
        <span className="ml-auto text-sm text-zinc-500">
          {files.length}개 파일
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-zinc-400">
          로딩 중...
        </div>
      ) : (
        <div className="flex gap-4">
          {/* File list */}
          <div className="w-1/3 space-y-1 max-h-80 overflow-y-auto">
            {files.map((f) => (
              <button
                key={f.name}
                onClick={() => setSelected(f)}
                className={`w-full text-left rounded-lg p-2 text-sm transition-colors ${
                  selected?.name === f.name
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="font-medium truncate">{f.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${TYPE_COLORS[f.type]}`}
                  >
                    {TYPE_LABELS[f.type]}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {formatDate(f.modifiedAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Content viewer */}
          <div className="flex-1 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50 max-h-80 overflow-y-auto">
            {selected ? (
              <pre className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                {selected.content}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-zinc-400">
                파일을 선택하세요
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
