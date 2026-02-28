import cronstrue from "cronstrue";

export function cronToKorean(expression: string): string {
  try {
    return cronstrue.toString(expression, { locale: "ko" });
  } catch {
    return expression;
  }
}

export function relativeTime(dateOrMs: string | number | Date): string {
  const now = Date.now();
  const then = typeof dateOrMs === "number" ? dateOrMs : new Date(dateOrMs).getTime();
  const diff = now - then;
  const future = diff < 0;
  const abs = Math.abs(diff);

  const minutes = Math.floor(abs / 60_000);
  const hours = Math.floor(abs / 3_600_000);
  const days = Math.floor(abs / 86_400_000);

  if (minutes < 1) return future ? "곧" : "방금";
  if (minutes < 60) return future ? `${minutes}분 후` : `${minutes}분 전`;
  if (hours < 24) return future ? `${hours}시간 후` : `${hours}시간 전`;
  if (days < 7) return future ? `${days}일 후` : `${days}일 전`;

  return new Date(then).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

export function formatSchedule(expr: string, tz: string): string {
  return `${expr} (${tz})`;
}
