import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/server/catalog";
import { MEDIA } from "@/lib/media";

export const metadata = { title: "Kategoriler" };

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Kategoriler</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {categories?.length ?? 0} kategori — tarzına göre keşfet.
        </p>
      </header>

      {!categories || categories.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface-card p-16 text-center">
          <p className="text-4xl mb-3">📂</p>
          <p className="font-semibold text-ink">Henüz kategori eklenmemiş.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              href={`/products?categoryId=${c.id}`}
              className={`group relative overflow-hidden rounded-xl border border-line bg-primary-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                // İlk iki kart daha büyük (vitrin etkisi)
                i === 0 ? "col-span-2 row-span-2" : ""
              }`}
              style={{ aspectRatio: i === 0 ? "auto" : "3/4", minHeight: i === 0 ? "320px" : undefined }}
            >
              <Image
                src={c.imageUrl || MEDIA.category.src}
                alt={c.name}
                fill
                sizes={i === 0 ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

              {/* Hover parlama */}
              <div className="absolute inset-0 bg-accent/0 transition-colors duration-300 group-hover:bg-accent/10" />

              {/* Metin */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <span className={`block font-extrabold text-white drop-shadow ${i === 0 ? "text-2xl sm:text-3xl" : "text-base"}`}>
                  {c.name}
                </span>
                {c.description && (
                  <span className="mt-1 block text-xs text-white/75 line-clamp-1">{c.description}</span>
                )}
                <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-sm">
                  Alışverişe başla →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
