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
import WishlistButton from "@/components/catalog/WishlistButton";
import { getStoreSettings } from "@/lib/server/storeSettings";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  return { title: product?.title ?? "Ürün" };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const [product, store] = await Promise.all([getProduct(id), getStoreSettings()]);
  if (!product) notFound();

  const whatsappUrl = store.whatsappPhone
    ? `https://wa.me/${store.whatsappPhone}?text=${encodeURIComponent(
        `Merhaba, "${product.title}" ürününü sipariş etmek istiyorum.\nhttps://markadan.com/products/${id}`
      )}`
    : null;

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
          <div className="mt-2 hidden sm:flex sm:flex-col sm:gap-3 sm:max-w-sm">
            <AddToCartButton productId={product.id} />
            <WishlistButton productId={product.id} />
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-base border border-[#25D366] bg-[#25D366]/10 px-4 py-2.5 text-sm font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366]/20"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366]" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp ile Sipariş Ver
              </a>
            )}
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
        <div className="flex items-center gap-2">
          <div className="shrink-0">
            <div className="text-xs text-ink-soft">Fiyat</div>
            <div className="text-base font-bold text-ink">{formatPrice(product.price)}</div>
          </div>
          <AddToCartButton productId={product.id} />
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-base bg-[#25D366] px-3 py-2.5 text-xs font-bold text-white"
              aria-label="WhatsApp ile sipariş ver"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WA
            </a>
          )}
        </div>
      </div>
      {/* Alt çubuğun içeriği örtmemesi için boşluk */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
