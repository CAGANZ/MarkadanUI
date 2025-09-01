// src/app/products/[id]/page.jsx
import Link from "next/link";
import MagnifierImage from "@/components/MagnifierImage";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const res = await fetch(`${base}/products/${id}`, { cache: "no-store" });
  console.log(id);

  if (!res.ok) {
    return (
      <div className="min-h-[60vh] bg-amber-50 text-neutral-900 p-6 space-y-4">
        <Link
          href="/"
          className="inline-block rounded-lg bg-amber-100 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-amber-200"
        >
          Ana sayfa
        </Link>
        <h1 className="text-xl font-semibold">Ürün bulunamadı</h1>
        <p className="text-neutral-600 text-sm">ID: {id}</p>
      </div>
    );
  }

  // Beklenen alanlar: id, title, price, brandId, brandName, categoryId, categoryName, imageUrl
  const p = await res.json(); //*************//

  const categoryHref = p?.categoryId
    ? `/categories/${p.categoryId}`
    : `/categories`;
  const brandHref = p?.brandId ? `/brands/${p.brandId}` : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900">
      {/* breadcrumb */}
      <header className="px-6 pt-8 pb-4 max-w-7xl mx-auto">
        <nav className="mt-3 text-sm text-neutral-600 flex flex-wrap items-center gap-1">
          <Link href="/" className="hover:underline">
            Ana sayfa
          </Link>
          <span>›</span>
          <Link href="/categories" className="hover:underline">
            Kategoriler
          </Link>
          <span>›</span>
          <Link href={categoryHref} className="hover:underline">
            {p.categoryName}
          </Link>
          <span>›</span>
          <span className="text-neutral-900 font-semibold">{p.title}</span>
        </nav>
      </header>

      <main className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="grid gap-6 md:grid-cols-12">
          {/* Görsel (büyüteçli) */}
          <section className="md:col-span-5">
            <MagnifierImage
              src={
                p.imageUrl ||
                "https://via.placeholder.com/800x600?text=Ürün+Görseli"
              }
              alt={p.title}
              zoom={2}
            />
          </section>

          {/* Bilgi */}
          <section className="md:col-span-7">
            <div className="rounded-2xl bg-white shadow-md border border-neutral-200 p-5 md:p-6 space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {p.title}
                </h1>
                <div className="text-neutral-700">
                  {/* Marka: brandId varsa /brands/{id}’e link, yoksa düz metin */}
                  {brandHref ? (
                    <Link
                      href={brandHref}
                      className="hover:underline font-semibold"
                    >
                      {p.brandName}
                    </Link>
                  ) : (
                    <span className="font-semibold">{p.brandName}</span>
                  )}{" "}
                  •{" "}
                  <Link href={categoryHref} className="hover:underline">
                    {p.categoryName}
                  </Link>
                </div>
              </div>

              {/* Fiyat */}
              <div className="text-2xl md:text-3xl font-extrabold text-neutral-900">
                {p.price} TL
              </div>

              {/* Adet seçici (pasif) */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-neutral-700 font-semibold">
                  Adet
                </label>
                <div className="flex items-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                  <button
                    type="button"
                    disabled
                    className="px-3 py-2 text-neutral-400 cursor-not-allowed"
                    title="Yakında"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={1}
                    disabled
                    readOnly
                    className="w-14 appearance-none bg-transparent text-center text-sm font-semibold text-neutral-800 py-2"
                  />
                  <button
                    type="button"
                    disabled
                    className="px-3 py-2 text-neutral-400 cursor-not-allowed"
                    title="Yakında"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Aksiyonlar */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  disabled
                  title="Sepet özelliği Sprint-3'te"
                  className="w-full rounded-xl bg-amber-100 text-neutral-800 px-4 py-2 text-sm font-bold border border-amber-200 cursor-not-allowed"
                >
                  Sepete ekle (yakında)
                </button>

                <Link
                  href="/products"
                  className="w-full sm:w-auto text-center rounded-xl bg-white px-4 py-2 text-sm font-semibold border border-neutral-200 hover:bg-neutral-50"
                >
                  Alışverişe devam et
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
