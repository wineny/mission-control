"use client";

import { useState } from "react";

export default function CalendarView() {
  const [currentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = currentDate.getDate();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📅</span>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Calendar
        </h3>
        <span className="ml-auto text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {monthName}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-xs font-medium text-zinc-400"
          >
            {d}
          </div>
        ))}
        {days.map((day, i) => (
          <div
            key={i}
            className={`flex h-9 items-center justify-center rounded-lg text-sm ${
              day === today
                ? "bg-emerald-600 font-bold text-white"
                : day
                  ? "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
        <p className="text-xs font-medium text-zinc-500 mb-1">
          오늘의 스케줄
        </p>
        <p className="text-sm text-zinc-400">
          HEARTBEAT.md 기반 자동 체크 — 캘린더, 메일, Linear 이슈
        </p>
      </div>
    </div>
  );
}
