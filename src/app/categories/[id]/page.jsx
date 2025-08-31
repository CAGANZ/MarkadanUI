// src/app/categories/[id]/page.jsx
import Link from "next/link";
import HorizontalScroller from "@/components/HorizontalScroller";

export const dynamic = "force-dynamic";

// Kategori görselleri
const categoryImages = {
  "Elektronik":
    "https://images.unsplash.com/photo-1590109738246-2af866338d35?q=80&w=2136&auto=format&fit=crop&ixlib=rb-4.1.0",
  "Ev & Yaşam":
    "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0",
  "Giyim":
    "https://images.unsplash.com/photo-1606844128209-80ba0f9afd34?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0",
  "Kişisel Bakım":
    "https://images.unsplash.com/photo-1559671216-bda69517c47f?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0",
  "Spor & Outdoor":
    "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0",
};

export default async function CategoryDetailPage({ params }) {
  const { id } = params;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";

  const [productsRes, categoriesRes, catRes] = await Promise.all([
    fetch(`${base}/products?categoryId=${encodeURIComponent(id)}`, { cache: "no-store" }),
    fetch(`${base}/categories`, { cache: "no-store" }),
    fetch(`${base}/categories/${id}`, { cache: "no-store" }),
  ]);

  if (!categoriesRes.ok) {
    return (
      <div className="min-h-[60vh] bg-amber-50 text-neutral-900 p-6">
        Kategoriler alınamadı. Hata kodu: {categoriesRes.status}
      </div>
    );
  }

  const allCategories = await categoriesRes.json(); // [{id, name}]
  const category = catRes.ok ? await catRes.json() : null;

  const productsData = productsRes.ok ? await productsRes.json() : { items: [] };
  const items = Array.isArray(productsData?.items) ? productsData.items : [];

  const categoryName =
    category?.name || (items.length > 0 ? items[0].categoryName : "Kategori");

  const otherCategories = allCategories.filter((c) => String(c.id) !== String(id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900">
      {/* Üst bar + breadcrumb */}
      <main className="px-6 pb-16 max-w-7xl mx-auto space-y-10">
        {/* ÜST: Bu kategoriye ait ürünler — yatay scroller (4 görünür) */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {categoryName} ürünleri
            </h2>
            {items.length > 0 && (
              <div className="text-sm text-neutral-600">
                Toplam <span className="font-bold">{productsData.total ?? items.length}</span> ürün
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl bg-white border border-neutral-200 p-6 text-neutral-700">
              Bu kategoride henüz ürün bulunamadı.
            </div>
          ) : (
            <HorizontalScroller visible={4} gapPx={24} bgFadeColor="#FFF7E6">
              {items.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200 transition hover:shadow-xl hover:scale-[1.02]"
                >
                  {/* Görsel */}
                  <div className="relative aspect-[4/3] w-full">
                    <img
                      src={p.imageUrl || "https://via.placeholder.com/400x300?text=Ürün+Görseli"}
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
                    {/* basit fiyat */}
                    <div className="text-base font-extrabold text-neutral-900">{p.price} TL</div>
                  </div>

                  {/* Footer buton */}
                  <div className="mt-auto flex items-center justify-center bg-[#FFE2A7] text-neutral-900 text-sm font-bold px-3 py-2 transition group-hover:bg-[#FFD88A]">
                    Ürüne git
                  </div>
                </Link>
              ))}
            </HorizontalScroller>
          )}
        </section>

        {/* ALT: Diğer kategoriler — yine yatay scroller (4 görünür) */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Diğer kategoriler</h2>
            <Link href="/categories" className="text-sm font-semibold text-neutral-700 hover:underline">
              Tüm kategoriler
            </Link>
          </div>

          <HorizontalScroller visible={4} gapPx={24} bgFadeColor="#FFF7E6">
            {otherCategories.map((c) => {
              const img = categoryImages[c.name] || "https://via.placeholder.com/600x600";
              return (
                <Link
                  key={c.id}
                  href={`/products?categoryId=${c.id}`}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200 transition hover:shadow-xl hover:scale-[1.02]"
                >
                  {/* Görsel */}
                  <div className="relative aspect-[4/3] w-full">
                    <img
                      src={img}
                      alt={c.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                    <h3 className="absolute bottom-3 left-3 text-lg font-bold text-white drop-shadow-md">
                      {c.name}
                    </h3>
                  </div>

                  {/* Footer buton */}
                  <div className="mt-auto flex items-center justify-center bg-[#FFE2A7] text-neutral-900 text-sm font-bold px-3 py-2 transition group-hover:bg-[#FFD88A]">
                    Ürünleri gör
                  </div>
                </Link>
              );
            })}
          </HorizontalScroller>
        </section>
      </main>
    </div>
  );
}
