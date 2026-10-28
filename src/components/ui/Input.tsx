"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelBn?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, containerClassName, label, labelBn, hint, error, leftIcon, id, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {(label || labelBn) && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wide text-brand-ink-muted">
          {label}
          {labelBn && <span className="ml-1 normal-case font-normal text-brand-ink-muted/80">({labelBn})</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink-muted">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-10 w-full rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-ink placeholder:text-brand-ink-muted/60",
            "transition-colors focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15",
            leftIcon && "pl-9",
            error && "border-brand-danger focus:border-brand-danger focus:ring-brand-danger/15",
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-xs text-brand-ink-muted">{hint}</p>}
      {error && <p className="text-xs text-brand-danger">{error}</p>}
    </div>
  );
});

export default Input;
