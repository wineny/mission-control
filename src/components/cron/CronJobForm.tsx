"use client";

import { useState } from "react";

interface CronJobFormProps {
  initial?: {
    name?: string;
    description?: string;
    expression?: string;
    timezone?: string;
    message?: string;
    agent?: string;
  };
  onSubmit: (data: Record<string, string>) => Promise<void>;
  onCancel: () => void;
  title: string;
}

export default function CronJobForm({ initial, onSubmit, onCancel, title }: CronJobFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [expression, setExpression] = useState(initial?.expression || "");
  const [timezone, setTimezone] = useState(initial?.timezone || "Asia/Seoul");
  const [message, setMessage] = useState(initial?.message || "");
  const [agent, setAgent] = useState(initial?.agent || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ name, description, expression, timezone, message, agent });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-gray-200 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">이름</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="w-full rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">설명</label>
            <input value={description} onChange={e => setDescription(e.target.value)}
              className="w-full rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">크론 표현식</label>
              <input value={expression} onChange={e => setExpression(e.target.value)} required placeholder="0 9 * * 1-5"
                className="w-full rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">타임존</label>
              <input value={timezone} onChange={e => setTimezone(e.target.value)}
                className="w-full rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">에이전트</label>
            <input value={agent} onChange={e => setAgent(e.target.value)} placeholder="main"
              className="w-full rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">메시지</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
              className="w-full rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              취소
            </button>
            <button type="submit" disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
