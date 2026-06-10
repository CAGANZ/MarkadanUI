// src/app/products/page.jsx
// Ürün listesi: filtre + sıralama + arama + sayfalama (tümü URL'de).
import { Suspense } from "react";
import { getProducts, getCategories, getBrands } from "@/lib/server/catalog";
import ProductCard from "@/components/catalog/ProductCard";
import Pager from "@/components/catalog/Pager";
import FilterBar from "@/components/catalog/FilterBar";

export const metadata = { title: "Ürünler" };

const PAGE_SIZE = 12;

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page ?? 1));
  const filters = {
    q: sp?.q ?? "",
    categoryId: sp?.categoryId ?? "",
    brandId: sp?.brandId ?? "",
    min: sp?.min ?? "",
    max: sp?.max ?? "",
    sort: sp?.sort ?? "",
    page,
    pageSize: PAGE_SIZE,
  };

  const [data, categories, brands] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getBrands(),
  ]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / (data?.pageSize ?? PAGE_SIZE)));

  // Sayfalama linki üretici — mevcut filtreleri korur
  const buildHref = (p) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v && k !== "page" && k !== "pageSize") qs.set(k, String(v));
    }
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return `/products${s ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Başlık + sonuç sayısı */}
      <div className="mb-4 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {filters.q ? `"${filters.q}" için sonuçlar` : "Ürünler"}
        </h1>
        <p className="text-sm text-ink-soft">
          {data === null
            ? "Ürünler şu an yüklenemiyor"
            : `${total} ürün bulundu`}
        </p>
      </div>

      {/* Filtre çubuğu */}
      <div className="mb-6">
        <Suspense>
          <FilterBar categories={categories ?? []} brands={brands ?? []} />
        </Suspense>
      </div>

      {/* Sonuç ızgarası / boş durum / hata durumu */}
      {data === null ? (
        <div className="rounded-base border border-line bg-surface-card p-10 text-center">
          <p className="font-medium text-ink">Ürünlere şu an ulaşılamıyor.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Lütfen birkaç saniye sonra sayfayı yenileyin.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-base border border-line bg-surface-card p-10 text-center">
          <p className="font-medium text-ink">
            {filters.q
              ? `"${filters.q}" ile eşleşen ürün bulunamadı.`
              : "Bu filtrelerle eşleşen ürün bulunamadı."}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Filtreleri azaltmayı ya da farklı bir arama yapmayı deneyin.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {items.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>

          <div className="mt-8">
            <Pager page={page} totalPages={totalPages} buildHref={buildHref} />
          </div>
        </>
      )}
    </div>
  );
}
