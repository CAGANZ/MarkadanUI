import Link from "next/link";
import Image from "next/image";
import { getBrands } from "@/lib/server/catalog";
import { MEDIA } from "@/lib/media";

export const metadata = { title: "Markalar" };

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Markalar</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {brands?.length ?? 0} marka — sevdiğiniz isimler tek butikte.
        </p>
      </header>

      {!brands || brands.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface-card p-16 text-center">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="font-semibold text-ink">Henüz marka eklenmemiş.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/products?brandId=${b.id}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl"
            >
              {/* Görsel — 16:9 */}
              <div className="relative aspect-video w-full overflow-hidden bg-primary-soft">
                <Image
                  src={b.imageUrl || MEDIA.brand.src}
                  alt={b.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>

              {/* Metin */}
              <div className="flex flex-1 flex-col gap-1 p-4">
                <p className="font-bold text-ink transition-colors group-hover:text-accent">
                  {b.name}
                </p>
                {b.description && (
                  <p className="line-clamp-2 text-xs text-ink-soft">{b.description}</p>
                )}
                <span className="mt-2 text-xs font-semibold text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  Ürünleri gör →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
