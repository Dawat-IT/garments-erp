"use client";

/**
 * Self-contained UI kit for the Commercial module pages (Buyers, Orders,
 * T&A Calendar, Merchandising, Costing).
 *
 * Kept local to `components/commercial` (instead of the shared
 * `@/components/ui/*`) so this module renders reliably regardless of
 * unrelated, concurrently evolving design-system work elsewhere in the app.
 */

import {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TdHTMLAttributes,
  TextareaHTMLAttributes,
  ThHTMLAttributes,
  forwardRef,
  useEffect,
} from "react";
import { ChevronDown, PackageSearch, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ */
/*  Button                                                              */
/* ------------------------------------------------------------------ */

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-900/10 focus-visible:ring-teal-500",
  secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:ring-teal-500",
  outline: "bg-transparent text-teal-700 border border-teal-300 hover:bg-teal-50 focus-visible:ring-teal-500",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
  icon: "h-9 w-9 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors",
        "disabled:opacity-50 disabled:pointer-events-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        buttonVariantClasses[variant],
        buttonSizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

/* ------------------------------------------------------------------ */
/*  Input / Select / Textarea / Label                                  */
/* ------------------------------------------------------------------ */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, icon, ...props }, ref) => {
  if (icon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input
          ref={ref}
          className={cn(
            "h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-800",
            "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500",
            "disabled:bg-slate-50 disabled:text-slate-400",
            className
          )}
          {...props}
        />
      </div>
    );
  }
  return (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800",
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500",
        "disabled:bg-slate-50 disabled:text-slate-400",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "h-9 w-full appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-8 text-sm text-slate-800",
        "focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500",
        "disabled:bg-slate-50 disabled:text-slate-400",
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  </div>
));
Select.displayName = "Select";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800",
      "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500",
      "disabled:bg-slate-50 disabled:text-slate-400",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label className={cn("mb-1.5 block text-xs font-semibold text-slate-600", className)} {...props}>
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  Card                                                                */
/* ------------------------------------------------------------------ */

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03]", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-slate-100 px-5 py-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold text-slate-800", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-0.5 text-xs text-slate-500", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

/* ------------------------------------------------------------------ */
/*  Modal                                                               */
/* ------------------------------------------------------------------ */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const modalSizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl",
          modalSizeClasses[size]
        )}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Badge                                                               */
/* ------------------------------------------------------------------ */

export type BadgeTone = "teal" | "green" | "amber" | "red" | "slate" | "blue" | "purple";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const badgeToneClasses: Record<BadgeTone, string> = {
  teal: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-600/20",
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  slate: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  purple: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
};

export function Badge({ className, tone = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize",
        badgeToneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

export function taStatusTone(status: string): BadgeTone {
  switch (status) {
    case "On Track":
      return "green";
    case "At Risk":
      return "amber";
    case "Delayed":
      return "red";
    default:
      return "slate";
  }
}

export function paymentStatusTone(status: string): BadgeTone {
  switch (status) {
    case "paid":
      return "green";
    case "partial":
      return "amber";
    case "due":
      return "red";
    default:
      return "slate";
  }
}

export function taskStatusTone(status: string): BadgeTone {
  switch (status) {
    case "Completed":
      return "green";
    case "In Progress":
      return "blue";
    case "Pending":
      return "slate";
    case "Delayed":
      return "red";
    default:
      return "slate";
  }
}

export function sampleStatusTone(status: string): BadgeTone {
  switch (status) {
    case "Approved":
      return "green";
    case "Pending":
      return "amber";
    case "Rejected":
      return "red";
    default:
      return "slate";
  }
}

/* ------------------------------------------------------------------ */
/*  Table                                                               */
/* ------------------------------------------------------------------ */

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full min-w-[720px] border-collapse text-left text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-slate-50", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-slate-100", className)} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("transition-colors hover:bg-teal-50/40", className)} {...props} />;
}

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 align-top text-slate-700", className)} {...props} />;
}

/* ------------------------------------------------------------------ */
/*  Tabs / Toggle chips                                                 */
/* ------------------------------------------------------------------ */

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
    <div className={cn("inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1", className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              active ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
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

/* ------------------------------------------------------------------ */
/*  KPI card / Empty state                                              */
/* ------------------------------------------------------------------ */

export type KpiTone = "teal" | "red" | "amber" | "blue" | "green" | "slate";

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: KpiTone;
  hint?: string;
}

const kpiToneClasses: Record<KpiTone, string> = {
  teal: "bg-teal-50 text-teal-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  slate: "bg-slate-100 text-slate-700",
};

export function KpiCard({ label, value, icon, tone = "teal", hint }: KpiCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03]">
      {icon && (
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", kpiToneClasses[tone])}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-xl font-bold text-slate-800">{value}</p>
        {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

export interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center text-slate-400">
      {icon ?? <PackageSearch className="h-9 w-9 text-slate-300" />}
      <p className="text-sm">{message}</p>
    </div>
  );
}
