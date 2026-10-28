import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "primary" | "accent" | "success" | "danger" | "warning" | "info" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

const toneClasses: Record<BadgeTone, string> = {
  primary: "bg-brand-primary/10 text-brand-primary-dark ring-1 ring-inset ring-brand-primary/20",
  accent: "bg-brand-accent/10 text-brand-accent-dark ring-1 ring-inset ring-brand-accent/25",
  success: "bg-brand-success-bg text-brand-success ring-1 ring-inset ring-brand-success/20",
  danger: "bg-brand-danger-bg text-brand-danger ring-1 ring-inset ring-brand-danger/20",
  warning: "bg-brand-warning-bg text-brand-warning ring-1 ring-inset ring-brand-warning/25",
  info: "bg-brand-info-bg text-brand-info ring-1 ring-inset ring-brand-info/20",
  neutral: "bg-brand-ink/5 text-brand-ink-muted ring-1 ring-inset ring-brand-ink/10",
};

const dotClasses: Record<BadgeTone, string> = {
  primary: "bg-brand-primary",
  accent: "bg-brand-accent",
  success: "bg-brand-success",
  danger: "bg-brand-danger",
  warning: "bg-brand-warning",
  info: "bg-brand-info",
  neutral: "bg-brand-ink-muted",
};

export function Badge({ className, tone = "neutral", dot = false, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotClasses[tone])} />}
      {children}
    </span>
  );
}

export default Badge;
