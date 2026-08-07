"use client";
// src/app/admin/products/page.jsx
import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import { formatPrice } from "@/lib/format";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Modal from "@/components/ui/Modal";
import Pager from "@/components/catalog/Pager";

const CSV_MAX_BYTES = 10 * 1024 * 1024; // 10 MB — BFF route ile aynı limit

export default function AdminProductsPage() {
  const toast = useToast();
  const fileRef = useRef(null);
  const [csvModal, setCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState(null);

  const [products, setProducts] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const debouncedQ = useDebounce(q, 500);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [togglingId, setTogglingId] = useState(null);

  // isActive alanı backend listede dönmeye başlayınca durum kolonu otomatik açılır.
  const hasActiveField = Array.isArray(products) && products.some((p) => p.isActive !== undefined);

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

  const pickCsv = (file) => {
    setCsvResult(null);
    if (!file) { setCsvFile(null); return; }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Yalnızca .csv dosyaları kabul edilir");
      setCsvFile(null);
      return;
    }
    if (file.size > CSV_MAX_BYTES) {
      toast.error("Dosya çok büyük (maksimum 10 MB)");
      setCsvFile(null);
      return;
    }
    if (file.size === 0) {
      toast.error("Dosya boş");
      setCsvFile(null);
      return;
    }
    setCsvFile(file);
  };

  const uploadCsv = async () => {
    if (!csvFile) return;
    if (csvFile.size > CSV_MAX_BYTES) { toast.error("Dosya çok büyük (maksimum 10 MB)"); return; }
    setCsvUploading(true);
    setCsvResult(null);
    try {
      const fd = new FormData();
      fd.append("file", csvFile);
      const res = await fetch("/api/admin/products/bulk", { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.detail || "Yükleme başarısız");
        return;
      }
      setCsvResult(data);
      toast.success(`${data.succeeded} ürün eklendi`);
      await load();
    } catch {
      toast.error("Yükleme sırasında hata oluştu");
    } finally {
      setCsvUploading(false);
    }
  };

  const exportHref = `/api/admin/products/export?${new URLSearchParams(
    Object.fromEntries(Object.entries({ q: debouncedQ.trim(), sort }).filter(([, v]) => v))
  ).toString()}`;

  const toggleActive = async (p) => {
    setTogglingId(p.id);
    const next = !p.isActive;
    try {
      await api(`/admin/products/${p.id}/active`, { method: "PATCH", body: { isActive: next } });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, isActive: next } : x)));
      toast.success(next ? "Ürün aktife alındı" : "Ürün pasife alındı");
    } catch (err) {
      toast.error(err.detail || "Durum güncellenemedi");
    } finally {
      setTogglingId(null);
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
        <div className="flex gap-2">
          <Button asChild variant="secondary" size="sm">
            <a href={exportHref} download>CSV İndir</a>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => { setCsvFile(null); setCsvResult(null); setCsvModal(true); }}>
            CSV Yükle
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/admin/products/create">+ Yeni Ürün</Link>
          </Button>
        </div>
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
                    {["Ürün", "Kategori", "Marka", "Fiyat", "Stok", ...(hasActiveField ? ["Durum"] : []), "İşlemler"].map((h) => (
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
                      {hasActiveField && (
                        <td className="px-5 py-3">
                          <button
                            onClick={() => toggleActive(p)}
                            disabled={togglingId === p.id}
                            title={p.isActive ? "Pasife al" : "Aktife al"}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                              p.isActive
                                ? "bg-success/10 text-success hover:bg-success/20"
                                : "bg-surface text-ink-soft hover:bg-line/40"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${p.isActive ? "bg-success" : "bg-ink-soft"}`} />
                            {p.isActive ? "Aktif" : "Pasif"}
                          </button>
                        </td>
                      )}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/products/${p.id}`} className="text-xs font-medium text-ink-soft hover:text-ink" title="Görüntüle">👁</Link>
                          <Link href={`/admin/products/${p.id}/edit`} className="text-xs font-medium text-primary hover:underline" title="Düzenle">Düzenle</Link>
                          <Link href={`/admin/products/${p.id}/variants`} className="text-xs font-medium text-ink-soft hover:text-ink hover:underline" title="Seçenek ve varyantlar">Varyantlar</Link>
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

      {/* CSV yükleme modalı */}
      <Modal
        open={csvModal}
        onClose={() => setCsvModal(false)}
        title="Toplu Ürün Yükle (CSV)"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setCsvModal(false)}>Kapat</Button>
            <Button variant="primary" size="sm" loading={csvUploading} disabled={!csvFile} onClick={uploadCsv}>
              Yükle
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">
            CSV başlık satırı:{" "}
            <code className="rounded bg-surface px-1 py-0.5 text-xs font-mono text-ink">
              Title,Description,Price,Stock,BrandName,CategoryName,ImageUrl
            </code>
          </p>
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-base border-2 border-dashed border-line p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <span className="text-2xl">📄</span>
            <p className="text-sm font-medium text-ink">
              {csvFile ? csvFile.name : "CSV dosyası seç"}
            </p>
            <p className="text-xs text-ink-soft">Maksimum 10 MB</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => pickCsv(e.target.files?.[0] ?? null)}
            />
          </div>
          {csvResult && (
            <div className="rounded-base border border-line bg-surface p-4 space-y-2">
              <p className="text-sm font-semibold text-ink">
                {csvResult.succeeded} ürün eklendi{csvResult.failed > 0 && `, ${csvResult.failed} hata`}
              </p>
              {csvResult.errors?.length > 0 && (
                <ul className="max-h-40 overflow-y-auto space-y-1">
                  {csvResult.errors.map((e, i) => (
                    <li key={i} className="text-xs text-danger">
                      Satır {e.row}: {e.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </Modal>

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
