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
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h2>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-accent hover:underline">
          {linkLabel ?? "Tümünü gör →"}
        </Link>
      )}
    </div>
  );
}

// Kategori kartı — editöryel, portrait
function CategoryCard({ category }) {
  return (
    <Link
      href={`/products?categoryId=${category.id}`}
      className="group relative overflow-hidden rounded-xl border border-line bg-primary-soft"
      style={{ aspectRatio: "3/4" }}
    >
      <Image
        src={category.imageUrl || MEDIA.category.src}
        alt={category.name}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Gradient tabaka */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
      {/* Metin */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <span className="block text-base font-bold text-white drop-shadow-sm">{category.name}</span>
        {category.description && (
          <span className="mt-0.5 block max-h-0 overflow-hidden text-xs text-white/80 transition-all duration-300 group-hover:max-h-10">
            {category.description.slice(0, 50)}
          </span>
        )}
      </div>
      {/* Hover kenar ışığı */}
      <div className="absolute inset-0 rounded-xl ring-0 transition-all duration-300 group-hover:ring-2 group-hover:ring-accent/50" />
    </Link>
  );
}

// Marka kartı — yatay pill stili
function BrandCard({ brand }) {
  return (
    <Link
      href={`/products?brandId=${brand.id}`}
      className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-xl border border-line bg-surface-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lg"
    >
      <div className="relative size-16 overflow-hidden rounded-full border-2 border-line bg-primary-soft transition-all duration-300 group-hover:border-accent/50">
        <Image
          src={brand.imageUrl || MEDIA.brand.src}
          alt={brand.name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <span className="text-center text-xs font-bold text-ink transition-colors group-hover:text-accent">
        {brand.name}
      </span>
    </Link>
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
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-10">

      {/* ── Hero ── */}
      <section className="relative mb-14 overflow-hidden rounded-2xl bg-primary">
        {/* Arka plan doku */}
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px"}}
        />
        <div className="relative flex flex-col items-center gap-4 px-6 py-14 text-center sm:py-20">
          <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
            Yeni Sezon
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            {BOUTIQUE.tagline}
          </h1>
          <p className="mx-auto max-w-lg text-sm text-white/75 sm:text-base">
            En sevilen Türk ve dünya markalarını bir arada keşfedin.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/products"
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-md transition-opacity hover:opacity-90"
            >
              Alışverişe Başla
            </Link>
            <Link
              href="/categories"
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Kategorilere Bak
            </Link>
          </div>
        </div>
      </section>

      {/* ── Kategoriler (editorial grid) ── */}
      {cats.length > 0 && (
        <section className="mb-14">
          <SectionHeader title="Kategoriler" href="/categories" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-4">
            {cats.slice(0, 8).map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </section>
      )}

      {/* ── Yeni gelenler ── */}
      {products.length > 0 && (
        <section className="mb-14">
          <SectionHeader title="Yeni Gelenler" href="/products?sort=newest" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {products.slice(0, 8).map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      {/* ── Markalar ── */}
      {brandList.length > 0 && (
        <section className="mb-14">
          <SectionHeader title="Markalar" href="/brands" />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
            {brandList.map((b) => (
              <BrandCard key={b.id} brand={b} />
            ))}
          </div>
        </section>
      )}

      {/* ── CTA bandı ── */}
      <section className="rounded-2xl bg-surface-card border border-line px-6 py-10 text-center">
        <p className="text-lg font-bold text-ink">Tüm ürünleri keşfet</p>
        <p className="mt-1 text-sm text-ink-soft">Filtrele, sırala, favorini bul.</p>
        <Link
          href="/products"
          className="mt-5 inline-flex items-center justify-center rounded-full bg-accent px-8 py-3 text-sm font-bold text-white shadow transition-opacity hover:opacity-90"
        >
          Tüm Ürünlere Git
        </Link>
      </section>
    </div>
  );
}
