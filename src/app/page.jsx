// src/app/page.jsx
import Link from "next/link";
import HScrollProducts from "@/components/HScrollProducts";
import CategoryCard from "@/components/cards/CategoryCard";

export const dynamic = "force-dynamic";

// Kategori kartları artık global `CategoryCard` bileşeninden geliyor

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
            {categories.map((c) => (
              <CategoryCard
                key={c.id}
                id={c.id}
                name={c.name}
                imageUrl={c.imageUrl}
              />
            ))}
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
