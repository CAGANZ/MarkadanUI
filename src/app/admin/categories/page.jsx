"use client";
// src/app/admin/categories/page.jsx
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Modal from "@/components/ui/Modal";

export default function AdminCategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("id_desc");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setCategories(null);
    try {
      const data = await api("/categories");
      setCategories(Array.isArray(data) ? data : data.items ?? []);
    } catch (err) {
      toast.error(err.detail || "Kategoriler yüklenemedi");
      setCategories([]);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!categories) return [];
    const term = q.trim().toLowerCase();
    let list = categories.filter((c) =>
      !term || c.name?.toLowerCase().includes(term) || c.description?.toLowerCase().includes(term)
    );
    switch (sort) {
      case "name_asc": list = [...list].sort((a, b) => (a.name || "").localeCompare(b.name || "")); break;
      case "name_desc": list = [...list].sort((a, b) => (b.name || "").localeCompare(a.name || "")); break;
      case "id_asc": list = [...list].sort((a, b) => (a.id ?? 0) - (b.id ?? 0)); break;
      default: list = [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }
    return list;
  }, [categories, q, sort]);

  const doDelete = async () => {
    setDeleting(true);
    try {
      await api(`/admin/categories/${deleteId}`, { method: "DELETE" });
      toast.success("Kategori silindi");
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      toast.error(err.detail || "Silme başarısız");
    } finally {
      setDeleting(false);
    }
  };

  const inputCls =
    "rounded-base border border-line bg-surface-card px-3 py-2 text-sm text-ink outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Kategori Yönetimi</h1>
          <p className="mt-1 text-sm text-ink-soft">Kategori ekleme, düzenleme ve silme</p>
        </div>
        <Button variant="primary" size="sm" asChild>
          <Link href="/admin/categories/create">+ Yeni Kategori</Link>
        </Button>
      </div>

      {/* Arama + sıralama */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Kategori ara..."
            className={`${inputCls} pr-8 w-56`}
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink">✕</button>
          )}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={inputCls}>
          <option value="id_desc">ID: Yeni → Eski</option>
          <option value="id_asc">ID: Eski → Yeni</option>
          <option value="name_asc">İsim: A-Z</option>
          <option value="name_desc">İsim: Z-A</option>
        </select>
        {categories && <span className="text-sm text-ink-soft">Toplam: {filtered.length}</span>}
      </div>

      {/* Liste */}
      <div className="rounded-base border border-line bg-surface-card overflow-hidden shadow-sm">
        {categories === null ? (
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📂</p>
            <p className="font-semibold text-ink mb-2">Kategori bulunamadı</p>
            {q ? (
              <Button variant="ghost" size="sm" onClick={() => setQ("")}>Aramayı Temizle</Button>
            ) : (
              <Button variant="primary" size="sm" asChild>
                <Link href="/admin/categories/create">İlk Kategoriyi Ekle</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface">
                <tr>
                  {["Kategori", "Açıklama", "Görsel", "İşlemler"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-surface">
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-ink">{c.name}</div>
                      <div className="text-xs text-ink-soft">#{c.id}</div>
                    </td>
                    <td className="px-5 py-3 text-sm text-ink-soft">{c.description || "—"}</td>
                    <td className="px-5 py-3">
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt={c.name} className="h-10 w-10 rounded-base object-cover border border-line" />
                      ) : (
                        <span className="text-xs text-ink-soft">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/categories/${c.id}/edit`} className="text-xs font-medium text-primary hover:underline">Düzenle</Link>
                        <button onClick={() => setDeleteId(c.id)} className="text-xs font-medium text-danger hover:underline">Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Silme onay modalı */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Kategoriyi sil"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" size="sm" loading={deleting} onClick={doDelete}>Evet, Sil</Button>
          </>
        }
      >
        Bu kategoriyi kalıcı olarak silmek istediğinizden emin misiniz?
      </Modal>
    </div>
  );
}
