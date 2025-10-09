// src/app/admin/products/create/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateProductPage() {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    stock: "",
    brandId: "",
    categoryId: "",
    imageUrl: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [listsLoading, setListsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [b, c] = await Promise.all([
          fetch("/api/brands", { cache: "no-store" }).then((r) => r.json()),
          fetch("/api/categories", { cache: "no-store" }).then((r) => r.json()),
        ]);
        const bList = Array.isArray(b) ? b : b?.items ?? [];
        const cList = Array.isArray(c) ? c : c?.items ?? [];
        if (!cancelled) {
          setBrands(bList);
          setCategories(cList);
        }
      } catch {
        if (!cancelled) {
          setBrands([]);
          setCategories([]);
        }
      } finally {
        if (!cancelled) setListsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    setFormData((s) => ({
      ...s,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock || "0", 10),
        imageUrl: formData.imageUrl || null,
        brandId: formData.brandId ? parseInt(formData.brandId, 10) : null,
        categoryId: formData.categoryId
          ? parseInt(formData.categoryId, 10)
          : null,
      };

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let msg = "Ürün oluşturulamadı";
        try {
          const err = await response.json();
          msg = err?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      await response.json();
      alert("Ürün başarıyla oluşturuldu!");
      router.push("/admin/products");
    } catch (err) {
      setError(err.message || "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <nav className="text-sm text-neutral-600 flex items-center gap-2 mb-4">
              <Link href="/admin" className="hover:underline">
                Admin
              </Link>
              <span>›</span>
              <Link href="/admin/products" className="hover:underline">
                Ürünler
              </Link>
              <span>›</span>
              <span className="text-neutral-900 font-semibold">Yeni Ürün</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-800">
              Yeni Ürün Ekle
            </h1>
            <p className="mt-2 text-sm md:text-base text-neutral-600">
              Yeni ürün bilgilerini girin
            </p>
          </div>
          <Link
            href="/admin/products"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-800 border border-neutral-200 hover:bg-neutral-50"
          >
            Geri
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="px-6 pb-16 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Ürün Adı */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Ürün Adı *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ürün adını girin"
              />
            </div>

            {/* Fiyat */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Fiyat (TL) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Stok */}
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Stok Adedi *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                required
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Marka */}
            <div>
              <label
                htmlFor="brandId"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Marka *
              </label>
              <select
                id="brandId"
                name="brandId"
                required
                value={formData.brandId}
                onChange={handleChange}
                disabled={listsLoading}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
              >
                <option value="">Seçiniz</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori */}
            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Kategori *
              </label>
              <select
                required
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={listsLoading}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
              >
                <option value="">Seçiniz</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Görsel URL */}
            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Görsel URL
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Açıklama */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Ürün Açıklaması
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ürün açıklamasını girin"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || listsLoading}
                className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Oluşturuluyor..." : "Ürünü Oluştur"}
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
