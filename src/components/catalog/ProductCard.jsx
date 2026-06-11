// src/components/catalog/ProductCard.jsx
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { MEDIA } from "@/lib/media";

export default function ProductCard({ product, priority = false }) {
  const { id, title, price, imageUrl, brandName, categoryName, stockQuantity } = product;
  const outOfStock = stockQuantity !== undefined && stockQuantity <= 0;

  return (
    <Link
      href={`/products/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Görsel alanı — 3:4 portrait (tekstil için ideal) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-primary-soft">
        <Image
          src={imageUrl || MEDIA.product.src}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Karartma overlay — hover'da görünür */}
        <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/10" />

        {/* Stok bitti rozeti */}
        {outOfStock && (
          <div className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Tükendi
          </div>
        )}

        {/* Yeni etiket — id düşükse göster (gerçek "new" flag yoksa placeholder) */}
        {!outOfStock && id <= 8 && (
          <div className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Yeni
          </div>
        )}

        {/* Hızlı bakış chip — hover'da çıkar */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="whitespace-nowrap rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold text-ink shadow-md backdrop-blur-sm">
            Detayları gör →
          </span>
        </div>
      </div>

      {/* Metin alanı */}
      <div className="flex flex-1 flex-col gap-0.5 px-3 pb-3 pt-2.5">
        {/* Marka — accent renk */}
        {brandName && (
          <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
            {brandName}
          </span>
        )}

        {/* Başlık */}
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Kategori etiketi */}
        {categoryName && (
          <span className="mt-0.5 text-[11px] text-ink-soft">{categoryName}</span>
        )}

        {/* Fiyat */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className={`text-base font-extrabold ${outOfStock ? "text-ink-soft line-through" : "text-ink"}`}>
            {formatPrice(price)}
          </span>
          {outOfStock && (
            <span className="text-xs text-ink-soft">Stok yok</span>
          )}
        </div>
      </div>
    </Link>
  );
}
