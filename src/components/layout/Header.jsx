// src/components/layout/Header.jsx
// Global üst şerit (RSC). Kategoriler sunucuda çekilir (revalidate ile),
// hesap/sepet bloğu client bileşendir.
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getCategories } from "@/lib/server/catalog";
import SearchBox from "./SearchBox";
import HeaderActions from "./HeaderActions";

export default async function Header({ store }) {
  const categories = (await getCategories()) ?? [];
  const topCategories = categories.slice(0, 8);

  return (
    <header>
      {/* Üst satır: logo + arama + hesap/sepet */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-xl font-extrabold tracking-tight text-ink hover:opacity-80 sm:text-2xl"
          aria-label={`${store.name} ana sayfa`}
        >
          {store.logoUrl ? (
            <Image
              src={store.logoUrl}
              alt={store.name}
              width={140}
              height={36}
              className="h-9 w-auto"
              priority
            />
          ) : (
            store.name
          )}
        </Link>

        <Suspense>
          <SearchBox className="flex-1" />
        </Suspense>

        <HeaderActions />
      </div>

      {/* Alt satır: kategori menüsü (masaüstü) */}
      {topCategories.length > 0 && (
        <div className="hidden border-t border-line sm:block">
          <nav
            className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-6 py-1.5 text-sm"
            aria-label="Kategoriler"
          >
            {topCategories.map((c) => (
              <Link
                key={c.id}
                href={`/products?categoryId=${c.id}`}
                className="rounded-base px-2.5 py-1.5 font-medium text-ink-soft transition-colors hover:bg-primary-soft hover:text-ink"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/categories"
              className="rounded-base px-2.5 py-1.5 font-semibold text-accent transition-colors hover:bg-accent-soft"
            >
              Tümü
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
