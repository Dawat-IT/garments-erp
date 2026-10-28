"use client";

import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  labelBn?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, containerClassName, label, labelBn, hint, error, options, placeholder, id, ...props },
  ref
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {(label || labelBn) && (
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wide text-brand-ink-muted">
          {label}
          {labelBn && <span className="ml-1 normal-case font-normal text-brand-ink-muted/80">({labelBn})</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-10 w-full appearance-none rounded-lg border border-brand-border bg-white pl-3 pr-9 text-sm text-brand-ink",
            "transition-colors focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15",
            error && "border-brand-danger focus:border-brand-danger focus:ring-brand-danger/15",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled={props.required}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink-muted" />
      </div>
      {hint && !error && <p className="text-xs text-brand-ink-muted">{hint}</p>}
      {error && <p className="text-xs text-brand-danger">{error}</p>}
    </div>
  );
});

export default Select;
