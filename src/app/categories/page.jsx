import Link from "next/link";
import { getCategories } from "@/lib/server/catalog";

export const metadata = { title: "Kategoriler" };

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Kategoriler</h1>
        <p className="mt-2 text-sm text-ink-soft">İlham veren seçimler. Modern ve sade tasarımla alışveriş keyfi.</p>
      </header>

      {!categories || categories.length === 0 ? (
        <div className="rounded-base border border-line bg-surface-card p-12 text-center">
          <p className="text-ink-soft">Henüz kategori eklenmemiş.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?categoryId=${c.id}`}
              className="group flex flex-col overflow-hidden rounded-base border border-line bg-surface-card transition hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-surface">
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-ink-soft">📂</div>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-ink group-hover:text-primary transition-colors">{c.name}</p>
                {c.description && (
                  <p className="mt-1 text-xs text-ink-soft line-clamp-2">{c.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
