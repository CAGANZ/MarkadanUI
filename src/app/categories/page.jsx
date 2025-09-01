// src/app/categories/page.jsx
import CategoryCard from "@/components/cards/CategoryCard";


export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const res = await fetch(`${base}/categories`, { cache: "no-store" });

  if (!res.ok) {
    return (
      <div className="min-h-[60vh] bg-amber-50 text-neutral-900 p-6">
        Kategoriler alınamadı. Hata kodu: {res.status}
      </div>
    );
  }

  const categories = await res.json(); // [{ id, name }...]

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900">
      <header className="px-6 pt-10 pb-6 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-800">
          Kategoriler
        </h1>
        <p className="mt-2 text-sm md:text-base text-neutral-600 max-w-2xl">
          İlham veren seçimler. Modern ve sade tasarımla alışveriş keyfi.
        </p>
      </header>

      <main className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c) => (
            <CategoryCard key={c.id} id={c.id} name={c.name} />
          ))}
        </div>
      </main>
    </div>
  );
}
