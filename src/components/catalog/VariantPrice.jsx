"use client";
// src/components/catalog/VariantPrice.jsx
// Seçime bağlı fiyat. Seçim tamamlanmadan varyant fiyat aralığı gösterilir
// (aralık tek fiyattan ibaretse tek değer yazılır).
import { formatPrice } from "@/lib/format";
import { useVariant } from "@/components/catalog/VariantProvider";

export default function VariantPrice({ className = "" }) {
  const ctx = useVariant();
  if (!ctx) return null;

  const { price, range } = ctx;

  if (price != null) return <span className={className}>{formatPrice(price)}</span>;

  if (range) {
    return (
      <span className={className}>
        {range.min === range.max
          ? formatPrice(range.min)
          : `${formatPrice(range.min)} – ${formatPrice(range.max)}`}
      </span>
    );
  }

  return null;
}
