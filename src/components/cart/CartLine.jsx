"use client";
// src/components/cart/CartLine.jsx
// Sepet satırı — snapshot fiyat esastır; fiyat değiştiyse eski→yeni gösterilir.
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { MEDIA } from "@/lib/media";

export default function CartLine({ item, onQuantity, onRemove, busy }) {
  const {
    id,
    productId,
    title,
    imageUrl,
    unitPriceSnapshot,
    currentPrice,
    priceChanged,
    quantity,
    subtotal,
    variantLabel,
  } = item;

  return (
    <li className="flex gap-3 rounded-base border border-line bg-surface-card p-3 sm:p-4">
      {/* Görsel */}
      <Link
        href={`/products/${productId}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-base bg-primary-soft sm:size-24"
      >
        <Image
          src={imageUrl || MEDIA.product.src}
          alt={title}
          fill
          sizes="96px"
          className="object-cover"
        />
      </Link>

      {/* Bilgi + aksiyonlar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${productId}`}
            className="line-clamp-2 text-sm font-medium text-ink hover:underline"
          >
            {title}
          </Link>
          <button
            type="button"
            onClick={() => onRemove(id)}
            disabled={busy}
            aria-label={`${title} ürününü sepetten çıkar`}
            className="shrink-0 text-xs font-semibold text-ink-soft hover:text-danger disabled:opacity-40"
          >
            Kaldır
          </button>
        </div>

        {/* Seçilen varyant — "Kırmızı / M" */}
        {variantLabel && (
          <span className="mt-1 w-fit rounded bg-surface px-1.5 py-0.5 text-xs font-medium text-ink-soft">
            {variantLabel}
          </span>
        )}

        {/* Fiyat — değiştiyse şeffaf göster */}
        <div className="mt-1 text-sm">
          {priceChanged ? (
            <span className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-ink-soft line-through">{formatPrice(unitPriceSnapshot)}</span>
              <span className="font-semibold text-warning">{formatPrice(currentPrice)}</span>
              <span className="rounded bg-warning-soft px-1.5 py-0.5 text-[11px] font-semibold text-warning">
                Fiyat güncellendi
              </span>
            </span>
          ) : (
            <span className="text-ink-soft">{formatPrice(unitPriceSnapshot)}</span>
          )}
        </div>

        {/* Miktar + satır toplamı */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center rounded-base border border-line">
            <button
              type="button"
              onClick={() => onQuantity(id, quantity - 1)}
              disabled={busy}
              aria-label="Miktarı azalt"
              className="px-3 py-1.5 text-ink hover:bg-primary-soft disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-8 text-center text-sm font-semibold text-ink" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantity(id, quantity + 1)}
              disabled={busy}
              aria-label="Miktarı artır"
              className="px-3 py-1.5 text-ink hover:bg-primary-soft disabled:opacity-40"
            >
              +
            </button>
          </div>
          <div className="text-base font-bold text-ink">{formatPrice(subtotal)}</div>
        </div>
      </div>
    </li>
  );
}
