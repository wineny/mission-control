"use client";

interface StatsCardsProps {
  totalCron: number;
  activeCron: number;
  errorCron: number;
  totalSessions: number;
}

export default function StatsCards({ totalCron, activeCron, errorCron, totalSessions }: StatsCardsProps) {
  const cards = [
    { label: "크론 잡", value: totalCron, icon: "⏰", color: "text-blue-600" },
    { label: "활성", value: activeCron, icon: "✅", color: "text-emerald-600" },
    { label: "오류", value: errorCron, icon: "⚠️", color: "text-red-500" },
    { label: "세션", value: totalSessions, icon: "💬", color: "text-purple-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <span>{c.icon}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">{c.label}</span>
          </div>
          <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
