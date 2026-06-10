// src/app/page.jsx
// Ana sayfa — butik vitrini: hero, yeni gelenler, kategoriler, markalar.
import Link from "next/link";
import Image from "next/image";
import { getProducts, getCategories, getBrands } from "@/lib/server/catalog";
import { BOUTIQUE } from "@/config/boutique";
import { MEDIA } from "@/lib/media";
import ProductCard from "@/components/catalog/ProductCard";

function SectionHeader({ title, href, linkLabel }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h2>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-accent hover:underline">
          {linkLabel ?? "Tümünü gör"}
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [newest, categories, brands] = await Promise.all([
    getProducts({ sort: "newest", pageSize: 8 }),
    getCategories(),
    getBrands(),
  ]);

  const products = newest?.items ?? [];
  const cats = (categories ?? []).slice(0, 8);
  const brandList = (brands ?? []).slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-6 sm:space-y-16 sm:px-6 sm:py-10">
      {/* Hero — butik kimliği */}
      <section className="rounded-base bg-primary px-6 py-10 text-center sm:py-16">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
          {BOUTIQUE.tagline}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
          Yeni sezon ürünleri keşfedin — {BOUTIQUE.name} güvencesiyle.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center justify-center rounded-base bg-accent px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Alışverişe Başla
        </Link>
      </section>

      {/* Yeni gelenler */}
      {products.length > 0 && (
        <section>
          <SectionHeader title="Yeni Gelenler" href="/products?sort=newest" />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {products.slice(0, 8).map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      {/* Kategoriler */}
      {cats.length > 0 && (
        <section>
          <SectionHeader title="Kategoriler" href="/categories" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
            {cats.map((c) => (
              <Link
                key={c.id}
                href={`/products?categoryId=${c.id}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-base border border-line bg-primary-soft"
              >
                <Image
                  src={c.imageUrl || MEDIA.category.src}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                <span className="absolute bottom-3 left-3 text-base font-bold text-white">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Markalar */}
      {brandList.length > 0 && (
        <section>
          <SectionHeader title="Markalar" href="/brands" />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-5">
            {brandList.map((b) => (
              <Link
                key={b.id}
                href={`/products?brandId=${b.id}`}
                className="group flex flex-col items-center gap-2 rounded-base border border-line bg-surface-card p-4 transition-shadow hover:shadow-md"
              >
                <div className="relative size-16 overflow-hidden rounded-full bg-primary-soft">
                  <Image
                    src={b.imageUrl || MEDIA.brand.src}
                    alt={b.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <span className="text-center text-xs font-semibold text-ink group-hover:text-accent">
                  {b.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
