"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ConfirmDeleteCategoryModal from "@/components/ConfirmDeleteCategoryModal";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("id_desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) throw new Error("Kategoriler yüklenemedi");
      const data = await res.json();
      // Beklenen: dizi
      setCategories(Array.isArray(data) ? data : (data.items ?? []));
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function openDelete(id) {
    setConfirmId(id);
    setShowConfirm(true);
  }

  function handleDeleted(id) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  // Arama + sıralama (client-side; veri az olduğu için yeterli)
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = categories.filter((c) => {
      if (!term) return true;
      return (
        c.name?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
      );
    });

    switch (sort) {
      case "name_asc":
        list = [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name_desc":
        list = [...list].sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "id_asc":
        list = [...list].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        break;
      case "id_desc":
      default:
        list = [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        break;
    }

    return list;
  }, [categories, q, sort]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Kategoriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCategories}
            className="rounded-lg bg-amber-600 px-4 py-2 text-white font-semibold hover:bg-amber-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900">
      {/* Üst başlık – ürünlerdekiyle aynı kalıp */}
      <header className="px-6 pt-10 pb-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <nav className="text-sm text-neutral-600 flex items-center gap-2 mb-4">
              <Link href="/admin" className="hover:underline">Admin</Link>
              <span>›</span>
              <span className="text-neutral-900 font-semibold">Kategori Yönetimi</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-800">Kategori Yönetimi</h1>
            <p className="mt-2 text-sm md:text-base text-neutral-600">Kategori ekleme, düzenleme ve silme</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/categories/create"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Yeni Kategori
            </Link>
          </div>
        </div>
      </header>

      {/* Kart + gri üst alan */}
      <main className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Kategoriler ({filtered.length})</h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Kategori ara..."
                  className="rounded-lg border border-neutral-300 pl-4 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-full"
                />
                {q && (
                  <button
                    onClick={() => setQ("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800"
                  >
                    ✕
                  </button>
                )}
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-auto"
              >
                <option value="id_desc">ID: Yeni → Eski</option>
                <option value="id_asc">ID: Eski → Yeni</option>
                <option value="name_asc">İsim: A-Z</option>
                <option value="name_desc">İsim: Z-A</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Hiç kategori yok</h3>
              <p className="text-neutral-600 mb-6">Bir kategori oluşturarak başlayın.</p>
              <Link
                href="/admin/categories/create"
                className="inline-block rounded-lg bg-amber-600 px-6 py-3 text-white font-semibold hover:bg-amber-700"
              >
                Yeni Kategori
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Açıklama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Görsel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">{c.name}</div>
                        <div className="text-sm text-neutral-500">ID: {c.id}</div>
                      </td>
                      <td className="px-6 py-4">{c.description || "-"}</td>
                      <td className="px-6 py-4">
                        {c.imageUrl ? (
                          <img src={c.imageUrl} alt={c.name} className="h-12 w-12 object-cover rounded-lg border" />
                        ) : (
                          <span className="text-neutral-400 text-sm">Yok</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/categories/${c.id}/edit`}
                            className="text-amber-600 hover:text-amber-900"
                            title="Düzenle"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => openDelete(c.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <ConfirmDeleteCategoryModal
        open={showConfirm}
        id={confirmId}
        onClose={() => setShowConfirm(false)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
