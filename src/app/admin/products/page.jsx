"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { useDebounce } from "@/hooks/useDebounce"; // YENİ
import Pagination from "@/components/Pagination"; // YENİ

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest"); // YENİ: Sıralama state'i
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedQ = useDebounce(q, 500); // YENİ: Arama gecikmesi için

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    // debouncedQ, sort ve page değiştiğinde verileri çek
    fetchProducts({ page, pageSize, q: debouncedQ, sort });
  }, [page, pageSize, debouncedQ, sort]); // YENİ: Bağımlılıklar güncellendi

  const fetchProducts = async ({ page, pageSize, q, sort }) => {
    try {
      setLoading(true);
      const sp = new URLSearchParams();
      sp.set("page", String(page));
      sp.set("pageSize", String(pageSize));
      if (q?.trim()) sp.set("q", q.trim());
      if (sort) sp.set("sort", sort); // YENİ: sort parametresi eklendi

      const response = await fetch(`/api/admin/products?${sp.toString()}`);
      if (!response.ok) throw new Error("Ürünler yüklenemedi");

      const data = await response.json();
      setProducts(data.items ?? []);
      setTotal(data.total ?? 0);
      setPage(data.page ?? page);
      setPageSize(data.pageSize ?? pageSize);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Arama inputu değiştiğinde sayfa numarasını 1'e sıfırla
  const handleSearchChange = (e) => {
    setQ(e.target.value);
    setPage(1);
  }
  
  // Sıralama değiştiğinde sayfa numarasını 1'e sıfırla
  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  }

  const openDelete = (id) => {
    setConfirmId(id);
    setShowConfirm(true);
  };

  const handleDeleted = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Ürünler yükleniyor...</p>
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
            onClick={() => fetchProducts({ page, pageSize, q: debouncedQ, sort })}
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
      <header className="px-6 pt-10 pb-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <nav className="text-sm text-neutral-600 flex items-center gap-2 mb-4">
              <Link href="/admin" className="hover:underline">Admin</Link>
              <span>›</span>
              <span className="text-neutral-900 font-semibold">Ürün Yönetimi</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-800">
              Ürün Yönetimi
            </h1>
            <p className="mt-2 text-sm md:text-base text-neutral-600">
              Ürün ekleme, düzenleme ve silme işlemleri
            </p>
          </div>

          <div className="flex items-center gap-3">
             <Link
              href="/admin/products/create"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Yeni Ürün Ekle
            </Link>
          </div>
        </div>
      </header>
      
      <main className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-auto">
                <h2 className="text-lg font-semibold text-neutral-900">Ürünler ({total})</h2>
                <p className="text-sm text-neutral-500">Sayfa {page} / {Math.max(1, Math.ceil(total / pageSize))}</p>
            </div>
            {/* YENİ: ARAMA VE SIRALAMA ALANI */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <input
                  name="q"
                  value={q}
                  onChange={handleSearchChange}
                  placeholder="Ürün, marka, kategori ara..."
                  className="rounded-lg border border-neutral-300 pl-4 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-full"
                />
                {q && (
                  <button onClick={() => { setQ(''); setPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800">
                    ✕
                  </button>
                )}
              </div>
              <select 
                value={sort}
                onChange={handleSortChange}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-auto"
              >
                  <option value="newest">Önerilen Sıralama</option>
                  <option value="name_asc">İsim: A-Z</option>
                  <option value="name_desc">İsim: Z-A</option>
                  <option value="price_asc">Fiyat: Artan</option>
                  <option value="price_desc">Fiyat: Azalan</option>
              </select>
            </div>
          </div>
          <div className="px-6 py-4 border-b border-neutral-200">
            {/* YENİ: SAYFALAMA BİLEŞENİ (ÜST) */}
            <Pagination currentPage={page} total={total} pageSize={pageSize} onPageChange={setPage} />
          </div>

          {products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Aramayla eşleşen ürün bulunamadı</h3>
              <p className="text-neutral-600 mb-6">Farklı bir anahtar kelimeyle tekrar deneyin veya filtrenizi temizleyin.</p>
              <button
                onClick={() => { setQ(''); setSort('newest'); setPage(1); }}
                className="inline-block rounded-lg bg-amber-600 px-6 py-3 text-white font-semibold hover:bg-amber-700"
              >
                Filtreyi Temizle
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Ürün</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Marka</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Fiyat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.imageUrl || "https://via.placeholder.com/48x48?text=Ürün"}
                              alt={product.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">{product.title}</div>
                            <div className="text-sm text-neutral-500">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{product.categoryName || "Kategori yok"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{product.brandName || "Marka yok"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-neutral-900">{product.price} TL</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link href={`/products/${product.id}`} className="text-blue-600 hover:text-blue-900" title="Görüntüle">👁️</Link>
                          <Link href={`/admin/products/${product.id}/edit`} className="text-amber-600 hover:text-amber-900" title="Düzenle">✏️</Link>
                          <button
                            onClick={() => openDelete(product.id)}
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
           {/* YENİ: SAYFALAMA BİLEŞENİ (ALT) */}
           {products.length > 0 && (
             <div className="px-6 py-4 border-t border-neutral-200">
                <Pagination currentPage={page} total={total} pageSize={pageSize} onPageChange={setPage} />
             </div>
           )}
        </div>
      </main>
      
      <ConfirmDeleteModal
        open={showConfirm}
        id={confirmId}
        onClose={() => setShowConfirm(false)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}