import Link from "next/link";
import HorizontalScroller from "@/components/HorizontalScroller";
import BrandCard from "@/components/cards/BrandCard";

// Ürün görselleri için yerel placeholder
const PLACEHOLDER_PRODUCT = "https://via.placeholder.com/800x600?text=No+Image";

export const dynamic = "force-dynamic";

export default async function BrandDetailPage({ params }) {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";

  const [prodRes, allBrandsRes, brandRes] = await Promise.all([
    fetch(`${base}/products?brandId=${encodeURIComponent(id)}`, { cache: "no-store" }),
    fetch(`${base}/brands`, { cache: "no-store" }),
    fetch(`${base}/brands/${encodeURIComponent(id)}`, { cache: "no-store" }),
  ]);

  // Ürünler — güvenli çıkarım
  let items = [];
  if (prodRes.ok) {
    const data = await prodRes.json();
    items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  }

  // Marka bilgileri
  let brandName = `Marka #${id}`;
  let brandDescription = "";
  let brandImageUrl = "https://images.unsplash.com/photo-1667840578922-98e2a31aff95?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // default
  if (brandRes.ok) {
    const b = await brandRes.json();
    if (b?.name) brandName = b.name;
    if (b?.description) brandDescription = b.description;
    if (b?.imageUrl) brandImageUrl = b.imageUrl;
  } else if (items[0]?.brandName) {
    brandName = items[0].brandName;
  }

  // Diğer markalar
  let otherBrands = [];
  if (allBrandsRes.ok) {
    const brands = await allBrandsRes.json(); // [{id,name}]
    otherBrands = brands.filter((b) => String(b.id) !== String(id));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900">
      {/* Breadcrumb + başlık */}
      <header className="px-6 pt-10 pb-6 max-w-7xl mx-auto">
        <nav className="text-sm text-neutral-600 flex flex-wrap items-center gap-1 mb-2">
          <Link href="/" className="hover:underline">Ana sayfa</Link><span>›</span>
          <Link href="/brands" className="hover:underline">Markalar</Link><span>›</span>
          <span className="text-neutral-900 font-semibold">{brandName}</span>
        </nav>
      </header>

      <main className="px-6 pb-16 max-w-7xl mx-auto space-y-10">
        {/* Marka bilgi alanı: görsel + açıklama */}
        <section className="rounded-3xl overflow-hidden border border-neutral-200 bg-white shadow-sm">
          <div className="grid md:grid-cols-2 gap-0 items-center">
            {/* Görsel (kare 300x300) */}
            <div className="flex items-center justify-center p-6 md:p-10">
              <div className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden border border-neutral-200">
                <img
                  src={brandImageUrl}
                  alt={brandName}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
              </div>
            </div>
            {/* Açıklama */}
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900">{brandName}</h1>
              {brandDescription ? (
                <p className="mt-3 text-neutral-700 md:text-base">{brandDescription}</p>
              ) : (
                <p className="mt-3 text-neutral-600 text-sm">Bu marka hakkında açıklama bulunmuyor.</p>
              )}
            </div>
          </div>
        </section>
        {/* ÜST: Bu markanın ürünleri (yatay kaydırma) */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{brandName} ürünleri</h2>
            {items.length > 0 && (
              <div className="text-sm text-neutral-600">Toplam <span className="font-bold">{items.length}</span> ürün</div>
            )}
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl bg-white border border-neutral-200 p-6 text-neutral-700">
              Bu markaya ait henüz ürün bulunamadı.
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

        {/* ALT: Diğer markalar (yatay kaydırma) */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Diğer markalar</h2>
            <Link href="/brands" className="text-sm font-semibold text-neutral-700 hover:underline">Tüm markalar</Link>
          </div>

          {otherBrands.length === 0 ? (
            <div className="rounded-2xl bg-white border border-neutral-200 p-6 text-neutral-700">
              Diğer marka bulunamadı.
            </div>
          ) : (
            <HorizontalScroller>
              {otherBrands.map((b) => (
                <div key={b.id} className="snap-start min-w-[260px] max-w-[280px] flex-shrink-0">
                  <BrandCard id={b.id} name={b.name} imageUrl={b.imageUrl} />
                </div>
              ))}
            </HorizontalScroller>
          )}
        </section>
      </main>
    </div>
  );
}
