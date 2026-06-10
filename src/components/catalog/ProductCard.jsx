// src/components/catalog/ProductCard.jsx
// Katalogdaki tek ürün kartı — listede, vitrinde, ilgili ürünlerde aynı kart.
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { MEDIA } from "@/lib/media";

export default function ProductCard({ product, priority = false }) {
  const { id, title, price, imageUrl, brandName, categoryName } = product;

  return (
    <Link
      href={`/products/${id}`}
      className="group flex flex-col overflow-hidden rounded-base border border-line bg-surface-card transition-shadow hover:shadow-lg"
    >
      {/* Görsel — kare oran, butik vitrini hissi */}
      <div className="relative aspect-square w-full overflow-hidden bg-primary-soft">
        <Image
          src={imageUrl || MEDIA.product.src}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {brandName && (
          <span className="text-xs font-semibold uppercase tracking-wide text-accent">
            {brandName}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium text-ink">{title}</h3>
        {categoryName && (
          <span className="text-xs text-ink-soft">{categoryName}</span>
        )}
        <div className="mt-auto pt-2 text-base font-bold text-ink">
          {formatPrice(price)}
        </div>
      </div>
    </Link>
  );
}
