// src/app/brands/page.jsx
import BrandCard from "@/components/cards/BrandCard";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const res = await fetch(`${base}/brands`, { cache: "no-store" });

  if (!res.ok) {
    return (
      <div className="min-h-[60vh] bg-amber-50 text-neutral-900 p-6">
        Markalar alınamadı. Hata kodu: {res.status}
      </div>
    );
  }

  const brands = await res.json(); // [{ id, name }...]

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900">
      <header className="px-6 pt-10 pb-6 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-800">
          Markalar
        </h1>
        <p className="mt-2 text-sm md:text-base text-neutral-600 max-w-2xl">
          Sevilen markalar. Güvenilir alışveriş deneyimi.
        </p>
      </header>

      <main className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {brands.map((b) => (
            <BrandCard key={b.id} id={b.id} name={b.name} />
          ))}
        </div>
      </main>
    </div>
  );
}
