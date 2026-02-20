"use client";

import { useEffect, useState } from "react";

interface RemoteProject {
  name: string;
  branch?: string;
  lastCommit?: string;
}

interface RemoteData {
  online: boolean;
  hostname: string;
  ip: string;
  projects: RemoteProject[];
}

export default function RemoteStatus() {
  const [data, setData] = useState<RemoteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/remote")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💻</span>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Remote PC
        </h3>
        {!loading && data && (
          <span
            className={`ml-auto flex items-center gap-1.5 text-sm ${
              data.online ? "text-emerald-500" : "text-zinc-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                data.online
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-zinc-400"
              }`}
            />
            {data.online ? "Online" : "Offline"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-zinc-400">
          연결 확인 중...
        </div>
      ) : !data || !data.online ? (
        <div className="space-y-3">
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-sm text-zinc-500">
              {data?.hostname || "macbook-pro-77"} ({data?.ip || "100.72.168.70"})
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              충전기 연결 시 접근 가능 (WoL 설정됨)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <span>{data.hostname}</span>
            <span className="text-zinc-300 dark:text-zinc-600">|</span>
            <span>{data.ip}</span>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {data.projects.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {p.name}
                  </p>
                  {p.branch && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                        {p.branch}
                      </span>
                      {p.lastCommit && (
                        <span className="text-[10px] text-zinc-400 truncate">
                          {p.lastCommit.split("|")[1] || ""}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-zinc-400 text-right">
            {data.projects.length}개 프로젝트
          </p>
        </div>
      )}
    </div>
  );
}
