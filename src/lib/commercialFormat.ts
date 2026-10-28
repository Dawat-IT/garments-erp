/**
 * Self-contained formatting helpers for the Commercial module pages.
 */

export function formatMoney(value: number, currency: string = "$"): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}${currency}${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-CA");
}

export function daysBetween(a: string | Date, b: string | Date): number {
  const dateA = typeof a === "string" ? new Date(a) : a;
  const dateB = typeof b === "string" ? new Date(b) : b;
  return Math.round((dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24));
}
