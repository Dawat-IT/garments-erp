import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  delta?: number;
  deltaSuffix?: string;
  /** When true, a positive delta is rendered as unfavorable (red) and negative as favorable (green). */
  invertTone?: boolean;
  accent?: "teal" | "accent" | "neutral";
  className?: string;
}

const ACCENT_STYLES: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  teal: "bg-teal-50 text-teal-700",
  accent: "bg-accent-50 text-accent-600",
  neutral: "bg-ink-100 text-ink-600",
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  delta,
  deltaSuffix = "%",
  invertTone = false,
  accent = "teal",
  className,
}: KpiCardProps) {
  const hasDelta = typeof delta === "number" && !Number.isNaN(delta);
  const isFlat = hasDelta && delta === 0;
  const isPositiveDirection = hasDelta && delta! > 0;
  const isFavorable = hasDelta ? (invertTone ? !isPositiveDirection : isPositiveDirection) : true;

  return (
    <div
      className={cn(
        "card-surface group relative overflow-hidden p-5 transition-shadow duration-200 hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        {Icon && (
          <span
            className={cn(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              ACCENT_STYLES[accent]
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
        )}
      </div>

      <p className="mt-3 text-[1.75rem] font-bold leading-none tracking-tight text-ink-900">
        {value}
      </p>

      <div className="mt-3 flex items-center gap-2">
        {hasDelta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold",
              isFlat
                ? "bg-ink-100 text-ink-500"
                : isFavorable
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            )}
          >
            {isFlat ? (
              <Minus className="h-3 w-3" />
            ) : isPositiveDirection ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(delta!)}
            {deltaSuffix}
          </span>
        )}
        {hint && <span className="text-xs text-ink-400">{hint}</span>}
      </div>

      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100",
          accent === "accent" ? "bg-accent-400/20" : "bg-teal-400/15"
        )}
      />
    </div>
  );
}

export default KpiCard;
