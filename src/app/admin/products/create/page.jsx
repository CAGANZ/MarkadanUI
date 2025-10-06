// src/app/admin/products/create/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateProductPage() {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    brandId: "",
    categoryId: "",
    imageUrl: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ürün oluşturulamadı");
      }

      const newProduct = await response.json();
      alert("Ürün başarıyla oluşturuldu!");
      router.push(`/admin/products`);
    } catch (err) {
      setError(err.message);
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
              <Link href="/admin" className="hover:underline">Admin</Link>
              <span>›</span>
              <Link href="/admin/products" className="hover:underline">Ürünler</Link>
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
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
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
              <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-2">
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

            {/* Marka */}
            <div>
              <label htmlFor="brandId" className="block text-sm font-medium text-neutral-700 mb-2">
                Marka ID
              </label>
              <input
                type="text"
                id="brandId"
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Marka ID'sini girin"
              />
            </div>

            {/* Kategori */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-neutral-700 mb-2">
                Kategori ID
              </label>
              <input
                type="text"
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Kategori ID'sini girin"
              />
            </div>

            {/* Görsel URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-700 mb-2">
                Görsel URL
              </label>
              <input
                type="url"
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
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                Açıklama
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

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
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
