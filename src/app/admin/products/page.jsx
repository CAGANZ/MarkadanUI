"use client";
// src/app/admin/products/page.jsx
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import { formatPrice } from "@/lib/format";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Modal from "@/components/ui/Modal";
import Pager from "@/components/catalog/Pager";

export default function AdminProductsPage() {
  const toast = useToast();

  const [products, setProducts] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const debouncedQ = useDebounce(q, 500);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setProducts(null);
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("pageSize", String(pageSize));
    if (debouncedQ.trim()) sp.set("q", debouncedQ.trim());
    if (sort) sp.set("sort", sort);
    try {
      const data = await api(`/admin/products?${sp}`);
      setProducts(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      toast.error(err.detail || "Ürünler yüklenemedi");
      setProducts([]);
    }
  }, [page, debouncedQ, sort, toast]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => { setQ(e.target.value); setPage(1); };
  const handleSort = (e) => { setSort(e.target.value); setPage(1); };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await api(`/admin/products/${deleteId}`, { method: "DELETE" });
      toast.success("Ürün silindi");
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setTotal((t) => Math.max(0, t - 1));
      setDeleteId(null);
    } catch (err) {
      toast.error(err.detail || "Silme başarısız");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const inputCls =
    "rounded-base border border-line bg-surface-card px-3 py-2 text-sm text-ink outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Ürün Yönetimi</h1>
          <p className="mt-1 text-sm text-ink-soft">Ürün ekleme, düzenleme ve silme</p>
        </div>
        <Button asChild variant="primary" size="sm">
          <Link href="/admin/products/create">+ Yeni Ürün</Link>
        </Button>
      </div>

      {/* Arama + sıralama */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <input
            value={q}
            onChange={handleSearch}
            placeholder="Ürün, marka, kategori ara..."
            className={`${inputCls} pr-8 w-64`}
          />
          {q && (
            <button
              onClick={() => { setQ(""); setPage(1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>
        <select value={sort} onChange={handleSort} className={inputCls}>
          <option value="newest">Önerilen</option>
          <option value="name_asc">İsim: A-Z</option>
          <option value="name_desc">İsim: Z-A</option>
          <option value="price_asc">Fiyat: Artan</option>
          <option value="price_desc">Fiyat: Azalan</option>
        </select>
        <span className="text-sm text-ink-soft">Toplam: {total}</span>
      </div>

      {/* Liste */}
      <div className="rounded-base border border-line bg-surface-card overflow-hidden shadow-sm">
        {products === null ? (
          <div className="space-y-2 p-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-semibold text-ink mb-2">Ürün bulunamadı</p>
            <p className="text-sm text-ink-soft mb-5">Arama kriterini değiştirmeyi deneyin.</p>
            <Button variant="ghost" size="sm" onClick={() => { setQ(""); setSort("newest"); setPage(1); }}>
              Filtreyi Temizle
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    {["Ürün", "Kategori", "Marka", "Fiyat", "Stok", "İşlemler"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-surface">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.title} className="h-10 w-10 rounded-base object-cover border border-line" />
                          ) : (
                            <div className="h-10 w-10 rounded-base bg-surface flex items-center justify-center text-ink-soft text-xs border border-line">
                              —
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-ink">{p.title}</div>
                            <div className="text-xs text-ink-soft">#{p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-ink">{p.categoryName || "—"}</td>
                      <td className="px-5 py-3 text-sm text-ink">{p.brandName || "—"}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-ink">{formatPrice(p.price)}</td>
                      <td className="px-5 py-3 text-sm text-ink">{p.stock ?? "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/products/${p.id}`} className="text-xs font-medium text-ink-soft hover:text-ink" title="Görüntüle">👁</Link>
                          <Link href={`/admin/products/${p.id}/edit`} className="text-xs font-medium text-primary hover:underline" title="Düzenle">Düzenle</Link>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="text-xs font-medium text-danger hover:underline"
                            title="Sil"
                          >
                            Sil
                          </button>
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
        title="Ürünü sil"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" size="sm" loading={deleting} onClick={doDelete}>
              Evet, Sil
            </Button>
          </>
        }
      >
        Bu ürünü kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
      </Modal>
    </div>
  );
}
