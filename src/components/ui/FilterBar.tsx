"use client";

import type { ReactNode } from "react";
import { RotateCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface FilterBarProps {
  children: ReactNode;
  onReset?: () => void;
  onApply?: () => void;
  className?: string;
}

/**
 * Layout wrapper for a row of filter controls (search box, selects, date
 * pickers, etc.) with the familiar Reset / Apply Filter action pair used
 * throughout the reference ERP.
 */
export function FilterBar({ children, onReset, onApply, className }: FilterBarProps) {
  return (
    <div className={cn("paper-surface flex flex-col gap-4 rounded-xl p-4", className)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
      {(onReset || onApply) && (
        <div className="flex items-center justify-end gap-2 border-t border-brand-border pt-3">
          {onReset && (
            <Button variant="outline" size="sm" onClick={onReset} leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
              Reset
            </Button>
          )}
          {onApply && (
            <Button variant="primary" size="sm" onClick={onApply} leftIcon={<Search className="h-3.5 w-3.5" />}>
              Apply Filter
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default FilterBar;
