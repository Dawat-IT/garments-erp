import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_KEYWORDS: Record<string, StatusTone> = {
  "on track": "success",
  "on-track": "success",
  ontrack: "success",
  shipped: "success",
  passed: "success",
  approved: "success",
  completed: "success",
  active: "success",
  "at risk": "warning",
  "at-risk": "warning",
  pending: "warning",
  review: "warning",
  delayed: "danger",
  rejected: "danger",
  failed: "danger",
  overdue: "danger",
  info: "info",
  draft: "neutral",
};

const TONE_STYLES: Record<StatusTone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-rose-50 text-rose-700 ring-rose-600/20",
  info: "bg-teal-50 text-teal-700 ring-teal-700/20",
  neutral: "bg-ink-100 text-ink-600 ring-ink-400/15",
};

const DOT_STYLES: Record<StatusTone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-teal-600",
  neutral: "bg-ink-400",
};

export interface StatusBadgeProps {
  status: string;
  tone?: StatusTone;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({ status, tone, className, dot = true }: StatusBadgeProps) {
  const resolvedTone = tone ?? TONE_KEYWORDS[status.trim().toLowerCase()] ?? "neutral";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        TONE_STYLES[resolvedTone],
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT_STYLES[resolvedTone])} />}
      {status}
    </span>
  );
}

export default StatusBadge;
