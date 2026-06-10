// src/lib/format.js
import { BOUTIQUE } from "@/config/boutique";

const priceFmt = new Intl.NumberFormat(BOUTIQUE.locale, {
  style: "currency",
  currency: BOUTIQUE.currency,
  minimumFractionDigits: 2,
});

const dateFmt = new Intl.DateTimeFormat(BOUTIQUE.locale, {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat(BOUTIQUE.locale, {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// 1299 → "₺1.299,00"
export function formatPrice(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return priceFmt.format(Number(value));
}

// "2026-06-10T20:00:00Z" → "10 Haziran 2026"
export function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : dateFmt.format(d);
}

// "2026-06-10T20:00:00Z" → "10 Haziran 2026 23:00"
export function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : dateTimeFmt.format(d);
}
