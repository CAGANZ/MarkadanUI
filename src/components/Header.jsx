// src/components/Header.jsx
import Link from "next/link";
import CategoryDropdown from "@/components/CategoryDropdown";

export default async function Header() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";

  let categories = [];
  try {
    const res = await fetch(`${base}/categories`, { cache: "no-store" });
    if (res.ok) categories = await res.json();
  } catch {
    // sessiz geç
  }

  const top9 = Array.isArray(categories) ? categories.slice(0, 9) : [];

  return (
    <header className="border-b border-neutral-200 bg-white">
      {/* Üst satır: logo + search + auth/cart */}
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-neutral-900 hover:opacity-80"
          aria-label="Markadan ana sayfa"
        >
          Markadan
        </Link>

        {/* Search */}
        <form action="/products" method="GET" className="flex-1">
          <div className="flex items-center rounded-full bg-neutral-100 border border-neutral-200 px-4 py-2 focus-within:ring-2 focus-within:ring-amber-300">
            <input
              type="text"
              name="q"
              placeholder="Aradığınız ürün, kategori veya markayı yazınız"
              className="w-full bg-transparent outline-none text-sm text-neutral-800 placeholder:text-neutral-400"
            />
            <button
              type="submit"
              className="ml-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
            >
              Ara
            </button>
          </div>
        </form>

        {/* Auth & Cart */}
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/login"
            className="text-neutral-700 hover:text-neutral-900"
            title="Giriş yap (yakında Hesabım)"
          >
            Giriş Yap
          </Link>
          <Link
            href="/cart"
            className="text-neutral-700 hover:text-neutral-900"
            title="Sepetim"
          >
            Sepetim
          </Link>
        </nav>
      </div>

      {/* Alt satır: kategori menüsü */}
      <div className="border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-4">
          {/* Dropdown: Tüm Kategoriler */}
          <CategoryDropdown categories={categories} />

          <div className="h-4 w-px bg-neutral-300" />

          {/* İlk 10 kategori — hover: kutu + underline */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
            {top9.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.id}`}
                className="
                  text-neutral-700
                  hover:text-neutral-900
                  rounded-md
                  px-2.5 py-1
                  transition
                  hover:bg-[#FFF1C9]  /* krem tonlu kutu efekti */
                  hover:underline    /* altı çizgili */
                  underline-offset-2
                  decoration-amber-500
                "
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
