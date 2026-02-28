interface CronStatusBadgeProps {
  enabled: boolean;
  lastStatus?: string;
  consecutiveErrors?: number;
}

export default function CronStatusBadge({ enabled, lastStatus, consecutiveErrors }: CronStatusBadgeProps) {
  if (!enabled) {
    return <span className="inline-flex items-center text-gray-400 text-sm">·</span>;
  }

  if (lastStatus === "error" || lastStatus === "timeout" || (consecutiveErrors && consecutiveErrors > 0)) {
    return <span className="inline-flex items-center text-red-500 text-sm font-medium">✕</span>;
  }

  if (lastStatus === "ok") {
    return <span className="inline-flex items-center text-emerald-500 text-sm font-medium">✓</span>;
  }

  return <span className="inline-flex items-center text-gray-400 text-sm">·</span>;
}
