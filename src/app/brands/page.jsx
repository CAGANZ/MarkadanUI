import Link from "next/link";
import { getBrands } from "@/lib/server/catalog";

export const metadata = { title: "Markalar" };

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Markalar</h1>
        <p className="mt-2 text-sm text-ink-soft">Sevilen markalar. Güvenilir alışveriş deneyimi.</p>
      </header>

      {!brands || brands.length === 0 ? (
        <div className="rounded-base border border-line bg-surface-card p-12 text-center">
          <p className="text-ink-soft">Henüz marka eklenmemiş.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/products?brandId=${b.id}`}
              className="group flex flex-col overflow-hidden rounded-base border border-line bg-surface-card transition hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-surface">
                {b.imageUrl ? (
                  <img
                    src={b.imageUrl}
                    alt={b.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-ink-soft">🏷️</div>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-ink group-hover:text-primary transition-colors">{b.name}</p>
                {b.description && (
                  <p className="mt-1 text-xs text-ink-soft line-clamp-2">{b.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
