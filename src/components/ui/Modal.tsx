"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  titleBn?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export function Modal({ open, onClose, title, titleBn, description, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-brand-ink/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative z-10 w-full rounded-xl bg-white shadow-2xl ring-1 ring-black/5",
          sizeClasses[size]
        )}
      >
        {(title || titleBn) && (
          <div className="flex items-start justify-between gap-4 border-b border-brand-border px-6 py-4">
            <div>
              {title && <h2 className="font-display text-lg font-semibold text-brand-ink">{title}</h2>}
              {titleBn && <p className="text-sm text-brand-ink-muted">{titleBn}</p>}
              {description && <p className="mt-1 text-sm text-brand-ink-muted">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-brand-ink-muted transition-colors hover:bg-brand-surface hover:text-brand-ink"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 border-t border-brand-border px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
