"use client";
// src/components/layout/SearchBox.jsx
// Header arama kutusu — /products?q= sayfasına yönlendirir.
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBox({ className = "" }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [value, setValue] = useState(sp.get("q") || "");

  const submit = (e) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  return (
    <form onSubmit={submit} role="search" className={className}>
      <div className="flex items-center rounded-full border border-line bg-surface px-4 py-2 transition-colors focus-within:border-primary">
        <input
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ürün, marka veya kategori arayın"
          aria-label="Arama"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60"
        />
        <button
          type="submit"
          aria-label="Ara"
          className="ml-2 shrink-0 text-sm font-semibold text-ink-soft hover:text-ink"
        >
          Ara
        </button>
      </div>
    </form>
  );
}
