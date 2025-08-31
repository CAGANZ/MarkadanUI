import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE_DEFAULT = 12;

function Chip({ active, href, children }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-semibold
        ${active ? "bg-[#FFD88A] border-amber-500 text-neutral-900"
                 : "bg-white border-neutral-300 hover:bg[#FFE9BF] text-neutral-900"} transition`}
    >
      {children}
    </Link>
  );
}

function SortIcon({ dir }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" className="inline-block align-middle text-neutral-900" aria-hidden="true">
      {dir === "asc" ? <path d="M7 14l5-5 5 5H7z" fill="currentColor" /> : <path d="M7 10l5 5 5-5H7z" fill="currentColor" />}
    </svg>
  );
}

export default async function ProductsPage({ searchParams }) {
  const categoryId = searchParams?.categoryId ?? "";
  const sort = searchParams?.sort ?? "";
  const page = Math.max(1, Number(searchParams?.page ?? 1));
  const pageSize = PAGE_SIZE_DEFAULT;

  const qs = new URLSearchParams();
  if (categoryId) qs.set("categoryId", String(categoryId));
  if (sort) qs.set("sort", sort);
  qs.set("page", String(page));
  qs.set("pageSize", String(pageSize));
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/products?${qs.toString()}`;

  let data = null;
  let error = null;
  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (!res.ok) error = `Ürünler alınamadı. Hata kodu: ${res.status}`;
    else data = await res.json();
  } catch {
    error = "Sunucuya bağlanırken bir hata oluştu.";
  }

  if (error) {
    return (
      <>
        
        <div className="bg-[#FFF7E6] min-h-screen p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            {error}
          </div>
        </div>
      </>
    );
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? page;
  const currentPageSize = data?.pageSize ?? pageSize;
  const totalPages = Math.max(1, Math.ceil(total / currentPageSize));
  const categoryName = items.length > 0 && categoryId ? items[0].categoryName : null;

  const buildLink = (overrides = {}) => {
    const p = new URLSearchParams();
    if (overrides.categoryId === null) {
      // temizle
    } else if (String(overrides.categoryId ?? categoryId)) {
      p.set("categoryId", String(overrides.categoryId ?? categoryId));
    }
    if (overrides.sort ?? sort) p.set("sort", overrides.sort ?? sort);
    p.set("page", String(overrides.page ?? currentPage));
    p.set("pageSize", String(currentPageSize));
    return `/products?${p.toString()}`;
  };

  const windowPages = () => {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <>
      

      <div className="bg-[#FFF7E6] min-h-screen">
        {/* Üst başlık */}
        <div className="px-6 pt-8 pb-4 mx-auto max-w-7xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-800">Ürünler</h1>
              <p className="mt-2 text-sm md:text-base text-neutral-700">
                Toplam <span className="font-bold">{total}</span> ürün bulundu
                {categoryId && <> — <span className="font-semibold">{categoryName ?? `Kategori #${categoryId}`}</span></>}
              </p>
            </div>

            {/* Sağ üst: sayfalama */}
            <div className="flex items-center gap-2">
              <Link
                href={buildLink({ page: Math.max(1, currentPage - 1) })}
                aria-disabled={currentPage <= 1}
                className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                  currentPage <= 1 ? "pointer-events-none opacity-40 border-neutral-300 text-neutral-400"
                                   : "border-neutral-400 bg-white hover:bg-[#FFE9BF] text-neutral-900"
                }`}
                title="Önceki sayfa"
              >
                Önceki
              </Link>

              {currentPage > 3 && (
                <>
                  <Link href={buildLink({ page: 1 })} className="px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white hover:bg-[#FFE9BF] text-neutral-900">1</Link>
                  {currentPage > 4 && <span className="px-2 text-neutral-500">…</span>}
                </>
              )}

              {windowPages().map((p) => (
                <Link
                  key={p}
                  href={buildLink({ page: p })}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    p === currentPage ? "bg-[#FFD88A] border-amber-500 font-bold text-neutral-900"
                                      : "border-neutral-300 bg-white hover:bg-[#FFE9BF] text-neutral-900"
                  }`}
                  title={`${p}. sayfa`}
                >
                  {p}
                </Link>
              ))}

              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="px-2 text-neutral-500">…</span>}
                  <Link
                    href={buildLink({ page: totalPages })}
                    className="px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white hover:bg-[#FFE9BF] text-neutral-900"
                  >
                    {totalPages}
                  </Link>
                </>
              )}

              <Link
                href={buildLink({ page: Math.min(totalPages, currentPage + 1) })}
                aria-disabled={currentPage >= totalPages}
                className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                  currentPage >= totalPages ? "pointer-events-none opacity-40 border-neutral-300 text-neutral-400"
                                            : "border-neutral-400 bg-white hover:bg-[#FFE9BF] text-neutral-900"
                }`}
                title="Sonraki sayfa"
              >
                Sonraki
              </Link>
            </div>
          </div>

          {/* Ürün üstü toolbar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Chip href="/categories">Kategoriler</Chip>
              <Chip href="/brands">Markalar</Chip>
            </div>

            <div className="flex items-center gap-2">
              <Chip href={buildLink({ page: 1, sort: "" })} active={!sort}>Varsayılan</Chip>
              <Chip href={buildLink({ page: 1, sort: "newest" })} active={sort === "newest"}>En Yeni</Chip>
              <Chip href={buildLink({ page: 1, sort: "price_asc" })} active={sort === "price_asc"}>
                Fiyat <SortIcon dir="asc" />
              </Chip>
              <Chip href={buildLink({ page: 1, sort: "price_desc" })} active={sort === "price_desc"}>
                Fiyat <SortIcon dir="desc" />
              </Chip>
            </div>
          </div>
        </div>

        {/* Grid */}
        <main className="px-6 pb-16 mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200 transition hover:shadow-xl hover:scale-[1.02]"
              >
                <div className="relative aspect-[4/3] w-full">
                  <img
                    src={p.imageUrl || "https://via.placeholder.com/400x300?text=Ürün+Görseli"}
                    alt={p.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
                </div>

                <div className="flex flex-col justify-between flex-grow p-4">
                  <h3 className="text-lg font-extrabold text-neutral-600 line-clamp-1">{p.title}</h3>
                  <div className="text-sm text-neutral-700">
                    <span className="font-semibold">{p.brandName}</span> • <span>{p.categoryName}</span>
                  </div>
                  {/* basit fiyat formatı */}
                  <div className="text-base font-extrabold text-neutral-900">{p.price} TL</div>
                </div>

                {/* Footer CTA (ok kaldırıldı) */}
                <div className="mt-auto flex items-center justify-center bg-[#FFE2A7] text-neutral-900 text-sm font-bold px-3 py-2 transition group-hover:bg-[#FFD88A]">
                  Detayları gör
                </div>
              </Link>
            ))}
          </div>

          {/* Alt pager */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <Link
              href={buildLink({ page: Math.max(1, currentPage - 1) })}
              className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                currentPage <= 1 ? "pointer-events-none opacity-40 border-neutral-300 text-neutral-400"
                                  : "border-neutral-400 bg-white hover:bg-[#FFE9BF] text-neutral-900"
              }`}
              title="Önceki sayfa"
            >
              Önceki
            </Link>

            {currentPage > 3 && (
              <>
                <Link href={buildLink({ page: 1 })} className="px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white hover:bg-[#FFE9BF] text-neutral-900">1</Link>
                {currentPage > 4 && <span className="px-2 text-neutral-500">…</span>}
              </>
            )}

            {windowPages().map((p) => (
              <Link
                key={`bottom-${p}`}
                href={buildLink({ page: p })}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  p === currentPage ? "bg-[#FFD88A] border-amber-500 font-bold text-neutral-900"
                                    : "border-neutral-300 bg-white hover:bg-[#FFE9BF] text-neutral-900"
                }`}
              >
                {p}
              </Link>
            ))}

            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="px-2 text-neutral-500">…</span>}
                <Link
                  href={buildLink({ page: totalPages })}
                  className="px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white hover:bg-[#FFE9BF] text-neutral-900"
                >
                  {totalPages}
                </Link>
              </>
            )}

            <Link
              href={buildLink({ page: Math.min(totalPages, currentPage + 1) })}
              className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                currentPage >= totalPages ? "pointer-events-none opacity-40 border-neutral-300 text-neutral-400"
                                          : "border-neutral-400 bg-white hover:bg-[#FFE9BF] text-neutral-900"
              }`}
              title="Sonraki sayfa"
            >
              Sonraki
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
