// src/app/admin/page.jsx
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-800">
              Admin Paneli
            </h1>
            <p className="mt-2 text-sm md:text-base text-neutral-600 max-w-2xl">
              Markadan yönetim paneli - Ürün, kategori ve marka yönetimi
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-800 border border-neutral-200 hover:bg-neutral-50"
          >
            Ana Sayfa
          </Link>
        </div>
      </header>

      {/* Dashboard Cards */}
      <main className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Ürün Yönetimi */}
          <Link
            href="/admin/products"
            className="group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200 transition hover:shadow-xl hover:scale-[1.02]"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                  Yönet →
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Ürün Yönetimi</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Ürün ekleme, düzenleme ve silme işlemleri
                </p>
              </div>
            </div>
            <div className="mt-auto bg-blue-50 px-6 py-3">
              <div className="text-sm font-semibold text-blue-800">
                Ürünleri Görüntüle
              </div>
            </div>
          </Link>

          {/* Kategori Yönetimi */}
          <Link
            href="/admin/categories"
            className="group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200 transition hover:shadow-xl hover:scale-[1.02]"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-2xl">📂</span>
                </div>
                <span className="text-sm font-semibold text-green-600 group-hover:text-green-700">
                  Yönet →
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Kategori Yönetimi</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Kategori ekleme, düzenleme ve silme işlemleri
                </p>
              </div>
            </div>
            <div className="mt-auto bg-green-50 px-6 py-3">
              <div className="text-sm font-semibold text-green-800">
                Kategorileri Görüntüle
              </div>
            </div>
          </Link>

          {/* Marka Yönetimi */}
          <Link
            href="/admin/brands"
            className="group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200 transition hover:shadow-xl hover:scale-[1.02]"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-2xl">🏷️</span>
                </div>
                <span className="text-sm font-semibold text-purple-600 group-hover:text-purple-700">
                  Yönet →
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Marka Yönetimi</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Marka ekleme, düzenleme ve silme işlemleri
                </p>
              </div>
            </div>
            <div className="mt-auto bg-purple-50 px-6 py-3">
              <div className="text-sm font-semibold text-purple-800">
                Markaları Görüntüle
              </div>
            </div>
          </Link>

          {/* Kullanıcı Yönetimi */}
          <Link
            href="/admin/users"
            className="group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200 transition hover:shadow-xl hover:scale-[1.02]"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <span className="text-sm font-semibold text-orange-600 group-hover:text-orange-700">
                  Yönet →
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Kullanıcı Yönetimi</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Kullanıcı ekleme, düzenleme ve silme işlemleri
                </p>
              </div>
            </div>
            <div className="mt-auto bg-orange-50 px-6 py-3">
              <div className="text-sm font-semibold text-orange-800">
                Kullanıcıları Görüntüle
              </div>
            </div>
          </Link>

          {/* İstatistikler */}
          <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <span className="text-sm font-semibold text-gray-600">
                  Yakında
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">İstatistikler</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Satış raporları ve analitik veriler
                </p>
              </div>
            </div>
            <div className="mt-auto bg-gray-50 px-6 py-3">
              <div className="text-sm font-semibold text-gray-800">
                Geliştiriliyor...
              </div>
            </div>
          </div>

          {/* Ayarlar */}
          <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl">⚙️</span>
                </div>
                <span className="text-sm font-semibold text-gray-600">
                  Yakında
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Sistem Ayarları</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Genel sistem konfigürasyonu
                </p>
              </div>
            </div>
            <div className="mt-auto bg-gray-50 px-6 py-3">
              <div className="text-sm font-semibold text-gray-800">
                Geliştiriliyor...
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
