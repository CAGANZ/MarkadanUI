"use client";
// src/components/catalog/FilterBar.jsx
// Filtre + sıralama çubuğu. Tüm durum URL'de yaşar (paylaşılabilir linkler).
// Mobilde filtreler alttan açılan panele toplanır.
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

const SORTS = [
  { value: "", label: "Önerilen" },
  { value: "newest", label: "En yeni" },
  { value: "price_asc", label: "Fiyat (artan)" },
  { value: "price_desc", label: "Fiyat (azalan)" },
  { value: "name_asc", label: "İsim (A-Z)" },
  { value: "name_desc", label: "İsim (Z-A)" },
];

export default function FilterBar({ categories = [], brands = [] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);

  // Panel içi taslak değerler (Uygula'ya basınca URL'e yazılır)
  const [draft, setDraft] = useState({
    categoryId: sp.get("categoryId") || "",
    brandId: sp.get("brandId") || "",
    min: sp.get("min") || "",
    max: sp.get("max") || "",
  });

  const apply = (overrides = {}) => {
    const next = new URLSearchParams(sp.toString());
    const merged = { ...draft, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page"); // filtre değişince 1. sayfaya dön
    router.push(`/products?${next.toString()}`);
    setOpen(false);
  };

  const setSort = (value) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set("sort", value);
    else next.delete("sort");
    next.delete("page");
    router.push(`/products?${next.toString()}`);
  };

  const clearAll = () => {
    const q = sp.get("q");
    setDraft({ categoryId: "", brandId: "", min: "", max: "" });
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setOpen(false);
  };

  const activeCount = ["categoryId", "brandId", "min", "max"].filter((k) =>
    sp.get(k)
  ).length;

  const selectCls =
    "w-full rounded-base border border-line bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary";

  return (
    <div className="flex items-center gap-2">
      {/* Filtre paneli tetikleyici */}
      <Button variant="secondary" size="md" onClick={() => setOpen(true)}>
        Filtrele
        {activeCount > 0 && (
          <span className="rounded-full bg-accent px-1.5 text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
      </Button>

      {/* Sıralama — her zaman görünür */}
      <select
        aria-label="Sıralama"
        value={sp.get("sort") || ""}
        onChange={(e) => setSort(e.target.value)}
        className="rounded-base border border-line bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Filtre paneli (mobilde bottom sheet) */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Filtrele"
        footer={
          <>
            <Button variant="ghost" onClick={clearAll}>
              Temizle
            </Button>
            <Button onClick={() => apply()}>Uygula</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Kategori</label>
            <select
              className={selectCls}
              value={draft.categoryId}
              onChange={(e) => setDraft((d) => ({ ...d, categoryId: e.target.value }))}
            >
              <option value="">Tümü</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Marka</label>
            <select
              className={selectCls}
              value={draft.brandId}
              onChange={(e) => setDraft((d) => ({ ...d, brandId: e.target.value }))}
            >
              <option value="">Tümü</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Fiyat aralığı (₺)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="En az"
                className={selectCls}
                value={draft.min}
                onChange={(e) => setDraft((d) => ({ ...d, min: e.target.value }))}
              />
              <span className="text-ink-soft">—</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="En çok"
                className={selectCls}
                value={draft.max}
                onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
