"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

function pushToast(title: string, variant: ToastVariant, description?: string) {
  const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  toasts = [...toasts, { id, title, description, variant }];
  emit();
  window.setTimeout(() => dismissToast(id), 4200);
  return id;
}

function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

/**
 * Simple imperative toast API — call from anywhere on the client:
 *   toast.success("Saved", "Order updated successfully");
 *   toast.error("Failed to save changes");
 */
export const toast = {
  success: (title: string, description?: string) => pushToast(title, "success", description),
  error: (title: string, description?: string) => pushToast(title, "error", description),
  warning: (title: string, description?: string) => pushToast(title, "warning", description),
  info: (title: string, description?: string) => pushToast(title, "info", description),
  dismiss: dismissToast,
};

const variantStyles: Record<ToastVariant, { icon: typeof CheckCircle2; classes: string }> = {
  success: { icon: CheckCircle2, classes: "border-brand-success/30 bg-brand-success-bg text-brand-success" },
  error: { icon: XCircle, classes: "border-brand-danger/30 bg-brand-danger-bg text-brand-danger" },
  warning: { icon: TriangleAlert, classes: "border-brand-warning/30 bg-brand-warning-bg text-brand-warning" },
  info: { icon: Info, classes: "border-brand-info/30 bg-brand-info-bg text-brand-info" },
};

/**
 * Renders the toast stack. Mount once near the root (e.g. inside AppShell).
 */
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>(toasts);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
      {items.map((item) => {
        const { icon: Icon, classes } = variantStyles[item.variant];
        return (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg",
              classes
            )}
            role="status"
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-ink">{item.title}</p>
              {item.description && <p className="mt-0.5 text-xs text-brand-ink-muted">{item.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              className="shrink-0 rounded-full p-1 text-brand-ink-muted hover:bg-black/5"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}

export default Toaster;
