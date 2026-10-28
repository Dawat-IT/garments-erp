import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names, resolving conflicts (later classes win).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as USD currency, e.g. 184800 -> "$184,800".
 * Garment export orders in this ERP are quoted in USD.
 */
export function formatCurrency(value: number | null | undefined, options?: { decimals?: number }): string {
  const amount = Number.isFinite(value) ? (value as number) : 0;
  const decimals = options?.decimals ?? 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format a number as BDT currency, e.g. 184800 -> "৳184,800".
 */
export function formatBdt(value: number | null | undefined, options?: { decimals?: number }): string {
  const amount = Number.isFinite(value) ? (value as number) : 0;
  const decimals = options?.decimals ?? 0;
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Compact BDT formatting for dashboard KPIs, e.g. 12500000 -> "৳1.25 Cr".
 */
export function formatCurrencyBDT(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 10000000) return `${sign}৳${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}৳${(abs / 100000).toFixed(2)} Lac`;
  return `${sign}৳${formatNumber(abs)}`;
}

/**
 * Format a plain number with thousand separators, e.g. 48000 -> "48,000".
 */
export function formatNumber(value: number | null | undefined, options?: { decimals?: number }): string {
  const amount = Number.isFinite(value) ? (value as number) : 0;
  const decimals = options?.decimals ?? 0;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/** Kept for older callers. Digits stay in English. */
export function toBanglaDigits(input: string | number): string {
  return String(input);
}

/** English date. The name is historical. */
export function formatDateBn(
  input: string | number | Date | null | undefined,
  options?: { withWeekday?: boolean }
): string {
  return formatDate(input, options?.withWeekday ? { weekday: "long", day: "numeric", month: "long", year: "numeric" } : { day: "numeric", month: "long", year: "numeric" });
}

/** English date, kept under the old name so existing pages stay in English. */
export function bnDate(date: Date = new Date()): string {
  return formatDate(date, { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Format a date the normal (English/ISO-ish) way, e.g. "27 Jul 2026".
 */
export function formatDate(
  input: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!input) return "—";
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", options ?? { day: "2-digit", month: "short", year: "numeric" }).format(
    date
  );
}

/**
 * Generate a short, reasonably-unique id for client-created records.
 */
export function generateId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Clamp a percentage-like number between 0 and 100.
 */
export function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * Compute due amount as invoiced - received, floored at 0.
 */
export function computeDue(invoiced: number, received: number): number {
  return Math.max(0, Math.round((invoiced - received) * 100) / 100);
}

/**
 * Human friendly title-case a kebab/camel/snake string, e.g. "in_house" -> "In House".
 */
export function titleCase(input: string): string {
  return input
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
