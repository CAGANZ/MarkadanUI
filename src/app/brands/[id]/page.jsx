
// src/app/brands/[id]/page.jsx
import Link from "next/link";
import HorizontalScroller from "@/components/HorizontalScroller";

export const dynamic = "force-dynamic";

// (Opsiyonel) Marka görselleri — brands/page.jsx ile aynı eşleme.
// Olmayanlar placeholder ile gösterilir.
const brandImages = {
  "LeadTech":
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
  "Ramingues":
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
  "Happie":
    "https://images.unsplash.com/photo-1604289433068-badef6f6c928?q=80&w=2081&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dp",
  "Inhale & Exhale":
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1200&auto=format&fit=crop",
  "AutoMate":
    "https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1200&auto=format&fit=crop",
};

export default async function BrandDetailPage({ params }) {
  const { id } = params;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";

  // Paralel veri çekimi: bu markanın ürünleri, tüm markalar listesi, marka detayı
  const [productsRes, brandsRes, brandRes] = await Promise.all([
    fetch(`${base}/products?brandId=${encodeURIComponent(id)}`, { cache: "no-store" }),
    fetch(`${base}/brands`, { cache: "no-store" }),
    fetch(`${base}/brands/${id}`, { cache: "no-store" }),
  ]);

  if (!brandsRes.ok) {
    return (
      <div className="min-h-[60vh] bg-amber-50 text-neutral-900 p-6">
        Markalar alınamadı. Hata kodu: {brandsRes.status}
      </div>
    );
  }

  const allBrands = await brandsRes.json(); // [{id, name}]
  const brand = brandRes.ok ? await brandRes.json() : null;

  const productsData = productsRes.ok ? await productsRes.json() : { items: [] };
  const items = Array.isArray(productsData?.items) ? productsData.items : [];

  const brandName =
    brand?.name || (items.length > 0 ? items[0].brandName : "Marka");

  // Diğer markalar (bu marka hariç)
  const otherBrands = allBrands.filter((b) => String(b.id) !== String(id));

  const heroImg = brandImages[brandName] || "https://via.placeholder.com/1200x600?text=Marka";

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900">
      {/* Üst bar + breadcrumb */}
      <header className="px-6 pt-8 pb-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Sol üst: Markadan linki */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-extrabold tracking-tight text-neutral-900 hover:opacity-80 transition"
            aria-label="Markadan ana sayfa"
          >
            Markadan
          </Link>
        </div>

        {/* Breadcrumb */}
        <nav className="mt-3 text-sm text-neutral-600 flex flex-wrap items-center gap-1">
          <Link href="/" className="hover:underline">Ana sayfa</Link>
          <span>›</span>
          <Link href="/brands" className="hover:underline">Markalar</Link>
          <span>›</span>
          <span className="text-neutral-900 font-semibold">{brandName}</span>
        </nav>
      </header>

      {/* Hero / Marka görseli (şık başlık alanı) */}
      <div className="px-6 max-w-7xl mx-auto">
        <div className="relative w-full overflow-hidden rounded-2xl border border-neutral-200 shadow-md">
          <div className="relative aspect-[3/1] w-full">
            <img
              src={heroImg}
              alt={brandName}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            <h1 className="absolute bottom-4 left-5 text-3xl md:text-4xl font-extrabold text-white drop-shadow">
              {brandName}
            </h1>
          </div>
        </div>
      </div>

      <main className="px-6 pb-16 max-w-7xl mx-auto space-y-10 mt-6">
        {/* ÜST: Bu markaya ait ürünler — yatay scroller (4 görünür) */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {brandName} ürünleri
            </h2>
            {items.length > 0 && (
              <div className="text-sm text-neutral-600">
                Toplam <span className="font-bold">{productsData.total ?? items.length}</span> ürün
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl bg-white border border-neutral-200 p-6 text-neutral-700">
              Bu markada henüz ürün bulunamadı.
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

        {/* ALT: Diğer markalar — yine yatay scroller (4 görünür) */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Diğer markalar</h2>
            <Link href="/brands" className="text-sm font-semibold text-neutral-700 hover:underline">
              Tüm markalar
            </Link>
          </div>

          <HorizontalScroller visible={4} gapPx={24} bgFadeColor="#FFF7E6">
            {otherBrands.map((b) => {
              const img = brandImages[b.name] || "https://via.placeholder.com/600x400?text=Marka";
              return (
                <Link
                  key={b.id}
                  href={`/brands/${b.id}`}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200 transition hover:shadow-xl hover:scale-[1.02]"
                >
                  {/* Görsel */}
                  <div className="relative aspect-[4/3] w-full">
                    <img
                      src={img}
                      alt={b.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                    <h3 className="absolute bottom-3 left-3 text-lg font-bold text-white drop-shadow-md">
                      {b.name}
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
