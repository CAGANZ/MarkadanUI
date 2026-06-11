"use client";
// src/app/admin/brands/page.jsx
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Modal from "@/components/ui/Modal";
import Pager from "@/components/catalog/Pager";

const PAGE_SIZE = 12;

export default function AdminBrandsPage() {
  const toast = useToast();
  const [all, setAll] = useState(null);
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 400);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api("/brands");
        setAll(Array.isArray(data) ? data : data.items ?? []);
      } catch (err) {
        toast.error(err.detail || "Markalar yüklenemedi");
        setAll([]);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!all) return [];
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
      case "name_asc": arr.sort((a, b) => (a.name || "").localeCompare(b.name || "")); break;
      case "name_desc": arr.sort((a, b) => (b.name || "").localeCompare(a.name || "")); break;
      default: arr.sort((a, b) => Number(b.id) - Number(a.id));
    }
    return arr;
  }, [all, debouncedQ, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const doDelete = async () => {
    setDeleting(true);
    try {
      await api(`/admin/brands/${deleteId}`, { method: "DELETE" });
      toast.success("Marka silindi");
      setAll((prev) => prev.filter((x) => x.id !== deleteId));
      setDeleteId(null);
      const after = filtered.length - 1;
      const maxPage = Math.max(1, Math.ceil(after / PAGE_SIZE));
      if (page > maxPage) setPage(maxPage);
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
          <h1 className="text-2xl font-bold tracking-tight text-ink">Marka Yönetimi</h1>
          <p className="mt-1 text-sm text-ink-soft">Marka ekleme, düzenleme ve silme</p>
        </div>
        <Button variant="primary" size="sm" asChild>
          <Link href="/admin/brands/create">+ Yeni Marka</Link>
        </Button>
      </div>

      {/* Arama + sıralama */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Marka ara (ad/açıklama/id)..."
            className={`${inputCls} pr-8 w-64`}
          />
          {q && (
            <button onClick={() => { setQ(""); setPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink">✕</button>
          )}
        </div>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className={inputCls}>
          <option value="newest">Önerilen (Yeni → Eski)</option>
          <option value="name_asc">İsim A → Z</option>
          <option value="name_desc">İsim Z → A</option>
        </select>
        {all && <span className="text-sm text-ink-soft">Toplam: {filtered.length}</span>}
      </div>

      {/* Liste */}
      <div className="rounded-base border border-line bg-surface-card overflow-hidden shadow-sm">
        {all === null ? (
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🏷️</p>
            <p className="font-semibold text-ink mb-2">Sonuç yok</p>
            {q ? (
              <Button variant="ghost" size="sm" onClick={() => setQ("")}>Aramayı Temizle</Button>
            ) : (
              <Button variant="primary" size="sm" asChild>
                <Link href="/admin/brands/create">İlk Markayı Ekle</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    {["Marka", "Açıklama", "İşlemler"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {pageItems.map((b) => (
                    <tr key={b.id} className="hover:bg-surface">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {b.imageUrl ? (
                            <img src={b.imageUrl} alt={b.name} className="h-10 w-10 rounded-base object-cover border border-line" loading="lazy" />
                          ) : (
                            <div className="h-10 w-10 rounded-base bg-surface flex items-center justify-center text-ink-soft text-xs border border-line">—</div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-ink">{b.name}</div>
                            <div className="text-xs text-ink-soft">#{b.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-ink-soft line-clamp-2">{b.description || "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Link href={`/admin/brands/${b.id}/edit`} className="text-xs font-medium text-primary hover:underline">Düzenle</Link>
                          <button onClick={() => setDeleteId(b.id)} className="text-xs font-medium text-danger hover:underline">Sil</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-line px-5 py-4">
              <Pager page={page} totalPages={totalPages} onPage={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Silme onay modalı */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Markayı sil"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" size="sm" loading={deleting} onClick={doDelete}>Evet, Sil</Button>
          </>
        }
      >
        Bu markayı kalıcı olarak silmek istediğinizden emin misiniz?
      </Modal>
    </div>
  );
}
