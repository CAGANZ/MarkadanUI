// src/app/products/[id]/page.jsx
// Ürün detayı — büyük görsel, net fiyat, mobilde alt sabit "Sepete Ekle".
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/server/catalog";
import { formatPrice } from "@/lib/format";
import { MEDIA } from "@/lib/media";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductCard from "@/components/catalog/ProductCard";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  return { title: product?.title ?? "Ürün" };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  // İlgili ürünler: aynı kategoriden, kendisi hariç ilk 4
  const related = await getProducts({
    categoryId: product.categoryId,
    pageSize: 5,
  });
  const relatedItems = (related?.items ?? [])
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Kırıntı navigasyon */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-ink-soft sm:text-sm" aria-label="Sayfa yolu">
        <Link href="/products" className="hover:text-ink hover:underline">
          Ürünler
        </Link>
        {product.categoryName && (
          <>
            <span aria-hidden>/</span>
            <Link
              href={`/products?categoryId=${product.categoryId}`}
              className="hover:text-ink hover:underline"
            >
              {product.categoryName}
            </Link>
          </>
        )}
        <span aria-hidden>/</span>
        <span className="text-ink">{product.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        {/* Görsel */}
        <div className="relative aspect-square w-full overflow-hidden rounded-base border border-line bg-primary-soft">
          <Image
            src={product.imageUrl || MEDIA.product.src}
            alt={product.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        </div>

        {/* Bilgi + aksiyon */}
        <div className="flex flex-col gap-4">
          {product.brandName && (
            <Link
              href={`/products?brandId=${product.brandId}`}
              className="w-fit text-sm font-semibold uppercase tracking-wide text-accent hover:underline"
            >
              {product.brandName}
            </Link>
          )}

          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {product.title}
          </h1>

          <div className="text-3xl font-extrabold text-ink">
            {formatPrice(product.price)}
          </div>

          {product.description && (
            <div className="border-t border-line pt-4">
              <h2 className="mb-2 text-sm font-semibold text-ink">Ürün Açıklaması</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {product.description}
              </p>
            </div>
          )}

          {/* Masaüstü aksiyon */}
          <div className="mt-2 hidden sm:block">
            <AddToCartButton productId={product.id} className="max-w-sm" />
          </div>
        </div>
      </div>

      {/* İlgili ürünler */}
      {relatedItems.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-ink">Benzer Ürünler</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {relatedItems.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobil: alt sabit aksiyon çubuğu (MobileNav'ın hemen üstünde) */}
      <div className="fixed inset-x-0 bottom-14 z-40 border-t border-line bg-surface-card/95 p-3 backdrop-blur sm:hidden">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <div className="text-xs text-ink-soft">Fiyat</div>
            <div className="text-lg font-bold text-ink">{formatPrice(product.price)}</div>
          </div>
          <AddToCartButton productId={product.id} />
        </div>
      </div>
      {/* Alt çubuğun içeriği örtmemesi için boşluk */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
