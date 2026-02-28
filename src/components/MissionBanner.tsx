"use client";

import { useEffect, useState } from "react";

export default function MissionBanner() {
  const [mission, setMission] = useState("");

  useEffect(() => {
    fetch("/api/mission")
      .then((r) => r.json())
      .then((d) => setMission(d.mission));
  }, []);

  if (!mission) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white shadow-md">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">🥑</span>
        <h2 className="text-sm font-medium uppercase tracking-wider opacity-80">
          Mission Statement
        </h2>
      </div>
      <p className="text-lg font-semibold leading-relaxed">{mission}</p>
    </div>
  );
}
