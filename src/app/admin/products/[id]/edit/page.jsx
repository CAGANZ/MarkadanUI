"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function EditProductPage() {
  // Next 15: client tarafında params almak için hook
  const params = useParams(); // { id: "3" }
  const id = params?.id;

  const [original, setOriginal] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    stock: "",
    brandId: "",
    categoryId: "",
    imageUrl: "",
    description: "",
  });

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [toast, setToast] = useState(null);
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2500);
  };

  // ürün + listeleri yükle
  useEffect(() => {
    let cancelled = false;
    if (!id) return;

    (async () => {
      try {
        setLoading(true);

        const [prodRes, bRes, cRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`, { cache: "no-store" }),
          fetch("/api/admin/brands", { cache: "no-store" }),
          fetch("/api/admin/categories", { cache: "no-store" }),
        ]);

        if (!prodRes.ok) throw new Error("Ürün bulunamadı");

        const productData = await prodRes.json();
        const bJson = await bRes.json();
        const cJson = await cRes.json();

        const bList = Array.isArray(bJson) ? bJson : (bJson?.items ?? bJson ?? []);
        const cList = Array.isArray(cJson) ? cJson : (cJson?.items ?? cJson ?? []);

        if (cancelled) return;

        setBrands(bList);
        setCategories(cList);
        setOriginal(productData);
        setFormData({
          title: productData.title ?? "",
          price: productData.price ?? "",
          stock: productData.stock ?? "",
          brandId: productData.brandId ?? "",
          categoryId: productData.categoryId ?? "",
          imageUrl: productData.imageUrl ?? "",
          description: productData.description ?? "",
        });
      } catch (e) {
        if (!cancelled) setError(e.message || "Yükleme hatası");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  // sadece değişen alanları gönder
  const diffPayload = useMemo(() => {
    if (!original) return null;

    const toNum = (v, kind) => {
      if (v === "" || v === null || v === undefined) return v;
      if (kind === "int") return Number.isNaN(parseInt(v, 10)) ? v : parseInt(v, 10);
      if (kind === "float") return Number.isNaN(parseFloat(v)) ? v : parseFloat(v);
      return v;
    };

    const current = {
      title: formData.title,
      description: formData.description || null,
      price: toNum(formData.price, "float"),
      stock: toNum(formData.stock, "int"),
      imageUrl: formData.imageUrl || null,
      brandId: formData.brandId === "" ? null : toNum(formData.brandId, "int"),
      categoryId: formData.categoryId === "" ? null : toNum(formData.categoryId, "int"),
    };

    const base = {
      title: original.title ?? null,
      description: original.description ?? null,
      price: original.price ?? null,
      stock: original.stock ?? null,
      imageUrl: original.imageUrl ?? null,
      brandId: original.brandId ?? null,
      categoryId: original.categoryId ?? null,
    };

    const body = {};
    for (const k of Object.keys(current)) {
      if (current[k] !== base[k]) body[k] = current[k];
    }
    return body;
  }, [formData, original]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!diffPayload || Object.keys(diffPayload).length === 0) {
        showToast("info", "Değişiklik yapılmadı");
        return;
      }

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diffPayload),
      });

      if (!res.ok) {
        let msg = "Ürün güncellenemedi";
        try { msg = (await res.json())?.message || msg; } catch {}
        throw new Error(msg);
      }

      const updated = await res.json();
      setOriginal(updated);
      setFormData({
        title: updated.title ?? "",
        price: updated.price ?? "",
        stock: updated.stock ?? "",
        brandId: updated.brandId ?? "",
        categoryId: updated.categoryId ?? "",
        imageUrl: updated.imageUrl ?? "",
        description: updated.description ?? "",
      });
      showToast("success", "Değişiklikler kaydedildi");
      // sayfada kalıyoruz
    } catch (err) {
      setError(err.message || "Bilinmeyen hata");
      showToast("error", err.message || "Hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Ürün yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/admin/products"
            className="rounded-lg bg-amber-600 px-4 py-2 text-white font-semibold hover:bg-amber-700"
          >
            Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-2 text-sm shadow ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-neutral-800 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="px-6 pt-10 pb-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <nav className="text-sm text-neutral-600 flex items-center gap-2 mb-4">
              <Link href="/admin" className="hover:underline">Admin</Link>
              <span>›</span>
              <Link href="/admin/products" className="hover:underline">Ürünler</Link>
              <span>›</span>
              <span className="text-neutral-900 font-semibold">Düzenle</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-800">
              Ürün Düzenle
            </h1>
            <p className="mt-2 text-sm md:text-base text-neutral-600">
              {original?.title} (ID: {id})
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/products/${id}`}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-800 border border-neutral-200 hover:bg-neutral-50"
            >
              Görüntüle
            </Link>
            <Link
              href="/admin/products"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-800 border border-neutral-200 hover:bg-neutral-50"
            >
              Geri
            </Link>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="px-6 pb-16 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ürün Adı */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
                Ürün Adı
              </label>
              <input
                id="title" name="title" type="text"
                value={formData.title} onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ürün adı"
              />
            </div>

            {/* Fiyat */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-2">
                Fiyat (TL)
              </label>
              <input
                id="price" name="price" type="number" min="0" step="0.01"
                value={formData.price} onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Stok */}
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-neutral-700 mb-2">
                Stok
              </label>
              <input
                id="stock" name="stock" type="number" min="0" step="1"
                value={formData.stock} onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Marka */}
            <div>
              <label htmlFor="brandId" className="block text-sm font-medium text-neutral-700 mb-2">
                Marka
              </label>
              <select
                id="brandId" name="brandId" value={formData.brandId} onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
              >
                <option value="">Seçiniz</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Kategori */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-neutral-700 mb-2">
                Kategori
              </label>
              <select
                id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
              >
                <option value="">Seçiniz</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Görsel URL + önizleme */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-700 mb-2">
                Görsel URL
              </label>
              <input
                id="imageUrl" name="imageUrl" type="url"
                value={formData.imageUrl} onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              {formData.imageUrl ? (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Önizleme"
                    className="h-24 w-24 object-cover rounded-lg border border-neutral-200"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
              ) : null}
            </div>

            {/* Açıklama */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                Açıklama
              </label>
              <textarea
                id="description" name="description" rows={4}
                value={formData.description} onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ürün açıklaması"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                onClick={handleSubmit}
                className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
              <Link
                href="/admin/products"
                className="px-6 py-3 rounded-lg font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                İptal
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
