// src/app/user/page.jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function UserPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const base = process.env.NEXT_PUBLIC_BASE_URL || "";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Giriş yapmanız gerekiyor");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/auth/me`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Kullanıcı bilgileri alınamadı");
        }

        const userData = await res.json();
        setUser(userData);
      } catch (err) {
        setError(err.message || "Beklenmeyen bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [base]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="bg-[#FFF7E6] min-h-screen">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="rounded-3xl bg-white border border-neutral-200 shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-neutral-200 rounded mb-4"></div>
              <div className="h-4 bg-neutral-200 rounded mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FFF7E6] min-h-screen">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="rounded-3xl bg-white border border-neutral-200 shadow-sm p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Hata</h1>
              <p className="text-neutral-600 mb-6">{error}</p>
              <Link
                href="/login"
                className="inline-block rounded-lg px-4 py-2 font-semibold text-neutral-900 transition border border-amber-300 bg-amber-200 hover:bg-amber-300"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF7E6] min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="rounded-3xl bg-white border border-neutral-200 shadow-sm p-6">
          {/* Başlık ve Çıkış */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900">
              Hesabım
            </h1>
            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-neutral-700 transition border border-neutral-300 bg-neutral-100 hover:bg-neutral-200"
            >
              Çıkış Yap
            </button>
          </div>

          {/* Kullanıcı Bilgileri */}
          <div className="space-y-6">
            {/* Kişisel Bilgiler */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 border border-amber-200">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Kişisel Bilgiler</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-600">Ad</label>
                  <p className="text-neutral-900 font-semibold">{user?.name || "Belirtilmemiş"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600">Soyad</label>
                  <p className="text-neutral-900 font-semibold">{user?.surname || "Belirtilmemiş"}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-600">E-posta</label>
                  <p className="text-neutral-900 font-semibold">{user?.email || "Belirtilmemiş"}</p>
                </div>
              </div>
            </div>

            {/* Hesap Bilgileri */}
            <div className="rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 border border-neutral-200">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Hesap Bilgileri</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-600">Kullanıcı ID</label>
                  <p className="text-neutral-900 font-semibold">{user?.id || "Belirtilmemiş"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600">Roller</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user?.roles && user.roles.length > 0 ? (
                      user.roles.map((role, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-200 text-neutral-800"
                        >
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-neutral-500">Rol atanmamış</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600">Yetki Durumu</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    user?.isAdmin 
                      ? "bg-green-200 text-green-800" 
                      : "bg-blue-200 text-blue-800"
                  }`}>
                    {user?.isAdmin ? "Yönetici" : "Standart Kullanıcı"}
                  </span>
                </div>
              </div>
            </div>

            {/* Hızlı Erişim */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 border border-blue-200">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Hızlı Erişim</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <Link
                  href="/products"
                  className="flex items-center justify-center rounded-lg px-4 py-3 bg-white border border-blue-200 text-blue-800 font-semibold hover:bg-blue-50 transition"
                >
                  Ürünleri Gör
                </Link>
                <Link
                  href="/categories"
                  className="flex items-center justify-center rounded-lg px-4 py-3 bg-white border border-blue-200 text-blue-800 font-semibold hover:bg-blue-50 transition"
                >
                  Kategoriler
                </Link>
                <Link
                  href="/brands"
                  className="flex items-center justify-center rounded-lg px-4 py-3 bg-white border border-blue-200 text-blue-800 font-semibold hover:bg-blue-50 transition"
                >
                  Markalar
                </Link>
                <Link
                  href="/"
                  className="flex items-center justify-center rounded-lg px-4 py-3 bg-white border border-blue-200 text-blue-800 font-semibold hover:bg-blue-50 transition"
                >
                  Ana Sayfa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


