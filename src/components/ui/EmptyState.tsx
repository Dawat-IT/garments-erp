import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title = "No records found",
  subtitle = "No records found for the selected filters.",
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-14 text-center", className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-surface text-brand-ink-muted">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-semibold text-brand-ink">{title}</p>
        <p className="mt-1 text-sm text-brand-ink-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export default EmptyState;
