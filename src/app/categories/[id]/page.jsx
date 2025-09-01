import Link from "next/link";
import HorizontalScroller from "@/components/HorizontalScroller";
import { PLACEHOLDER_PRODUCT, getCategoryImageById } from "@/lib/catalogMedia";

export const dynamic = "force-dynamic";

export default async function CategoryDetailPage({ params }) {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";

  const [prodRes, allCatsRes, catRes] = await Promise.all([
    fetch(`${base}/products?categoryId=${encodeURIComponent(id)}`, { cache: "no-store" }),
    fetch(`${base}/categories`, { cache: "no-store" }),
    fetch(`${base}/categories/${encodeURIComponent(id)}`, { cache: "no-store" }),
  ]);

  // Ürünler — güvenli çıkarım
  let items = [];
  if (prodRes.ok) {
    const data = await prodRes.json();
    items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  }

  // Kategori adı
  let categoryName = `Kategori #${id}`;
  if (catRes.ok) {
    const c = await catRes.json();
    if (c?.name) categoryName = c.name;
  } else if (items[0]?.categoryName) {
    categoryName = items[0].categoryName;
  }

  // Diğer kategoriler
  let otherCategories = [];
  if (allCatsRes.ok) {
    const cats = await allCatsRes.json(); // [{id,name}]
    otherCategories = cats.filter((c) => String(c.id) !== String(id));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900">
      {/* Breadcrumb + başlık */}
      <header className="px-6 pt-10 pb-6 max-w-7xl mx-auto">
        <nav className="text-sm text-neutral-600 flex flex-wrap items-center gap-1 mb-2">
          <Link href="/" className="hover:underline">Ana sayfa</Link><span>›</span>
          <Link href="/categories" className="hover:underline">Kategoriler</Link><span>›</span>
          <span className="text-neutral-900 font-semibold">{categoryName}</span>
        </nav>
      </header>

      <main className="px-6 pb-16 max-w-7xl mx-auto space-y-10">
        {/* ÜST: Bu kategoriye ait ürünler (yatay kaydırma) */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{categoryName} ürünleri</h2>
            {items.length > 0 && (
              <div className="text-sm text-neutral-600">Toplam <span className="font-bold">{items.length}</span> ürün</div>
            )}
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl bg-white border border-neutral-200 p-6 text-neutral-700">
              Bu kategoride henüz ürün bulunamadı.
            </div>
          ) : (
            <HorizontalScroller>
              {items.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="snap-start min-w-[260px] max-w-[280px] flex-shrink-0 group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200 transition hover:shadow-xl hover:scale-[1.02]"
                >
                  {/* Görsel */}
                  <div className="relative aspect-[4/3] w-full">
                    <img
                      src={p.imageUrl || PLACEHOLDER_PRODUCT}
                      alt={p.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
                  </div>

                  {/* Bilgi */}
                  <div className="flex flex-col justify-between flex-grow p-4">
                    <h3 className="text-lg font-extrabold text-neutral-600 line-clamp-1">{p.title}</h3>
                    <div className="text-sm text-neutral-700">
                      <span className="font-semibold">{p.brandName}</span> • <span>{p.categoryName}</span>
                    </div>
                    <div className="text-base font-extrabold text-neutral-900">{p.price} TL</div>
                  </div>

                  {/* Footer buton */}
                  <div className="mt-auto flex items-center justify-center bg-[#FFE2A7] text-neutral-900 text-sm font-bold px-3 py-2 transition group-hover:bg-[#FFD88A]">
                    Detayları gör →
                  </div>
                </Link>
              ))}
            </HorizontalScroller>
          )}
        </section>

        {/* ALT: Diğer kategoriler (yatay kaydırma) */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Diğer kategoriler</h2>
            <Link href="/categories" className="text-sm font-semibold text-neutral-700 hover:underline">Tüm kategoriler</Link>
          </div>

          {otherCategories.length === 0 ? (
            <div className="rounded-2xl bg-white border border-neutral-200 p-6 text-neutral-700">
              Diğer kategori bulunamadı.
            </div>
          ) : (
            <HorizontalScroller>
              {otherCategories.map((c) => (
                <Link
                  key={c.id}
                  href={`/categories/${c.id}`}
                  className="snap-start min-w-[260px] max-w-[280px] flex-shrink-0 group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200 transition hover:shadow-xl hover:scale-[1.02]"
                >
                  {/* Görsel */}
                  <div className="relative aspect-[4/3] w-full">
                    <img
                      src={getCategoryImageById(c.id)}
                      alt={c.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                    <h3 className="absolute bottom-3 left-3 text-lg font-bold text-white drop-shadow-md">{c.name}</h3>
                  </div>

                  {/* Footer buton */}
                  <div className="mt-auto flex items-center justify-center bg-[#FFE2A7] text-neutral-900 text-sm font-bold px-3 py-2 transition group-hover:bg-[#FFD88A]">
                    Ürünleri gör
                  </div>
                </Link>
              ))}
            </HorizontalScroller>
          )}
        </section>
      </main>
    </div>
  );
}
