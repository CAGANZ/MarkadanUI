"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import ConfirmDeleteBrandModal from "@/components/ConfirmDeleteBrandModal";

export default function AdminBrandsPage() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 400);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/brands", { cache: "no-store" });
        if (!res.ok) throw new Error("Markalar yüklenemedi");
        const data = await res.json();
        setAll(Array.isArray(data) ? data : data.items ?? []);
      } catch (e) {
        setError(e.message || "Hata");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let arr = [...all];
    const term = debouncedQ.trim().toLowerCase();
    if (term) {
      arr = arr.filter(
        (b) =>
          String(b.id).includes(term) ||
          (b.name || "").toLowerCase().includes(term) ||
          (b.description || "").toLowerCase().includes(term)
      );
    }
    switch (sort) {
      case "name_asc":
        arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name_desc":
        arr.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "newest":
      default:
        arr.sort((a, b) => Number(b.id) - Number(a.id));
        break;
    }
    return arr;
  }, [all, debouncedQ, sort]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const onSearch = (e) => {
    setQ(e.target.value);
    setPage(1);
  };

  const openDelete = (id) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const handleDeleted = (id) => {
    setAll((prev) => prev.filter((x) => x.id !== id));
    const after = total - 1;
    const maxPage = Math.max(1, Math.ceil(after / pageSize));
    if (page > maxPage) setPage(maxPage);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900">
      <header className="px-6 pt-10 pb-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <nav className="text-sm text-neutral-600 flex items-center gap-2 mb-4">
              <Link href="/admin" className="hover:underline">Admin</Link>
              <span>›</span>
              <span className="text-neutral-900 font-semibold">Marka Yönetimi</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-extrabold">Markalar</h1>
            <p className="mt-2 text-sm text-neutral-600">Ekle / düzenle / sil</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                value={q}
                onChange={onSearch}
                placeholder="Marka ara (ad/açıklama/id)..."
                className="rounded-lg border border-neutral-300 pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {q && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800"
                  onClick={() => { setQ(""); setPage(1); }}
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="newest">Önerilen (Yeni→Eski)</option>
              <option value="name_asc">İsim A→Z</option>
              <option value="name_desc">İsim Z→A</option>
            </select>

            <Link
              href="/admin"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold border border-neutral-200 hover:bg-neutral-50"
            >
              Geri
            </Link>
            <Link
              href="/admin/brands/create"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Yeni Marka
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Markalar ({total})</h2>
            <Pagination
              currentPage={page}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>

          {pageItems.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-2">🏷️</div>
              <p>Sonuç yok. Aramayı temizlemeyi deneyin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Marka</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Açıklama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {pageItems.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.imageUrl || "https://via.placeholder.com/48x48?text=M"}
                            alt={b.name}
                            className="h-12 w-12 rounded-lg object-cover border"
                            loading="lazy"
                          />
                          <div>
                            <div className="text-sm font-semibold">{b.name}</div>
                            <div className="text-xs text-neutral-500">ID: {b.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-700 line-clamp-2">{b.description || "-"}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/brands/${b.id}/edit`} className="text-amber-600 hover:text-amber-800">✏️ Düzenle</Link>
                          <button onClick={() => openDelete(b.id)} className="text-red-600 hover:text-red-800">🗑️ Sil</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pageItems.length > 0 && (
            <div className="px-6 py-4 border-t">
              <Pagination
                currentPage={page}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </main>

      <ConfirmDeleteBrandModal
        open={confirmOpen}
        id={confirmId}
        onClose={() => setConfirmOpen(false)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
