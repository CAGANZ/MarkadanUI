// src/app/page.jsx
import Link from "next/link";
import HScrollProducts from "@/components/HScrollProducts";

export const dynamic = "force-dynamic";

// Anasayfa boyunca kullanacağımız kategori görsel eşlemeleri
const categoryImages = {
  "Elektronik":
    "https://images.unsplash.com/photo-1590109738246-2af866338d35?q=80&w=2136&auto=format&fit=crop",
  "Ev & Yaşam":
    "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=880&auto=format&fit=crop",
  "Giyim":
    "https://images.unsplash.com/photo-1606844128209-80ba0f9afd34?q=80&w=2080&auto=format&fit=crop",
  "Kişisel Bakım":
    "https://images.unsplash.com/photo-1559671216-bda69517c47f?q=80&w=2080&auto=format&fit=crop",
  "Spor & Outdoor":
    "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2073&auto=format&fit=crop",
};

// Güvenli fetch helper (fail olursa null döner, sayfa yine render olur)
async function safeJson(url) {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";

  // API URL’leri
  const productsUrl = `${base}/products?page=1&pageSize=20`;
  const categoriesUrl = `${base}/categories`;
  const brandsUrl = `${base}/brands`;

  // Paralel ve toleranslı veri çekme
  const [productsData, categoriesData, brandsData] = await Promise.all([
    safeJson(productsUrl),
    safeJson(categoriesUrl),
    safeJson(brandsUrl),
  ]);

  const products = Array.isArray(productsData?.items) ? productsData.items : [];
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const brands = Array.isArray(brandsData) ? brandsData : [];

  return (
    <main className="bg-[#FFF7E6] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-14">
        {/* 1) Ürün vitrini: Yatay kaydırılabilir (HScrollProducts) */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900">
              Sizin için seçtiklerimiz
            </h2>
            <Link
              href="/products"
              className="text-sm font-semibold text-neutral-700 hover:underline"
            >
              Tüm ürünler
            </Link>
          </div>

          <HScrollProducts items={products} />
        </section>

        {/* 2) Kategoriler: Grid, kartların tamamı tıklanabilir, footer-CTA var */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900">
              Kategoriler
            </h2>
            <Link
              href="/categories"
              className="text-sm font-semibold text-neutral-700 hover:underline"
            >
              Tüm kategoriler
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((c) => {
              const img =
                categoryImages[c.name] || "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2073&auto=format&fit=crop";
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
                    <h3 className="absolute bottom-3 left-3 text-lg font-bold text-white drop-shadow">
                      {c.name}
                    </h3>
                  </div>

                  {/* Footer CTA */}
                  <div className="mt-auto flex items-center justify-center bg-[#FFE2A7] text-neutral-900 text-sm font-bold px-3 py-2 transition group-hover:bg-[#FFD88A]">
                    Ürünleri gör
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 3) Markalar: Basit grid + CTA */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900">
              Markalar
            </h2>
            <Link
              href="/brands"
              className="text-sm font-semibold text-neutral-700 hover:underline"
            >
              Tüm markalar
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/brands/${b.id}`}
                className="group flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-6 shadow-md transition hover:shadow-xl hover:scale-[1.02]"
              >
                <div className="mb-3 h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center text-neutral-800 font-extrabold text-lg">
                  {b.name?.[0] || "M"}
                </div>
                <div className="text-lg font-bold text-neutral-900">
                  {b.name}
                </div>
                <div className="mt-3 w-full text-center rounded-lg bg-amber-100 px-3 py-2 text-sm font-bold text-neutral-800 transition group-hover:bg-amber-200">
                  Ürünleri gör
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
