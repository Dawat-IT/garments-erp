"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1",
        className
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              active
                ? "bg-white text-teal-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export interface ToggleChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
  tone?: "slate" | "red" | "amber";
}

export function ToggleChip({ active, onClick, children, icon, tone = "slate" }: ToggleChipProps) {
  const activeTone =
    tone === "red"
      ? "bg-red-600 border-red-600 text-white"
      : tone === "amber"
      ? "bg-amber-500 border-amber-500 text-white"
      : "bg-teal-600 border-teal-600 text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active ? activeTone : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
      )}
    >
      {icon}
      {children}
    </button>
  );
}
