"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function EditCategoryPage({ params }) {
    const categoryId = params.id;
  // Ekran durumları
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [notice, setNotice]   = useState(""); // başarı/uyarı mesajı

  // Veri durumları
  const [initial, setInitial] = useState(null); // backend’ten gelen orijinal
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });

  
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const r = await fetch(`/api/categories/${categoryId}`, { cache: "no-store" });
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || "Kategori bulunamadı");
        }
        const data = await r.json();
        if (!cancelled) {
          setInitial(data);
          setForm({
            name: data?.name ?? "",
            description: data?.description ?? "",
            imageUrl: data?.imageUrl ?? "",
          });
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Bir hata oluştu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [categoryId]);

  // Sadece değişen alanları toplayalım (partial update)
  const diffPayload = useMemo(() => {
    if (!initial) return null;

    const payload = {};
    const map = [
      ["name",        "name"],
      ["description", "description"],
      ["imageUrl",    "imageUrl"],
    ];

    for (const [key, fkey] of map) {
      const before = (initial?.[key] ?? "") || "";
      const after  = (form?.[fkey] ?? "") || "";
      if (before !== after) {
        // boş stringleri null’a çevir (backend null’ı “sil” gibi yorumluyor)
        payload[key] = after.trim().length === 0 ? null : after.trim();
      }
    }
    return Object.keys(payload).length ? payload : null;
  }, [initial, form]);

  const isDirty = !!diffPayload;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    // Değişiklik yoksa kaydetme
    if (!isDirty) {
      setNotice("Değişiklik bulunmuyor.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/categories/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diffPayload),
      });

      // 204/200 ikisini de başarı sayalım
      if (!res.ok) {
        // ProblemDetails veya text gelebilir — metni göstermek daha anlaşılır
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Güncelleme başarısız");
      }

      // Başarılı ise initial’ı, formu ve mesajı güncelle
      const maybeJson = await safeJson(res);
      const merged = {
        ...initial,
        ...(maybeJson || diffPayload), // 204 ise diff’i uygula, 200-json ise onu esas al
      };
      setInitial(merged);
      setForm({
        name: merged.name ?? "",
        description: merged.description ?? "",
        imageUrl: merged.imageUrl ?? "",
      });
      setNotice("Kategori başarıyla güncellendi.");
    } catch (e) {
      setError(e.message || "Güncelleme hatası");
    } finally {
      setSaving(false);
      // başarı mesajını bir süre sonra otomatik gizle
      if (!error) {
        setTimeout(() => setNotice(""), 2500);
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" />
          <p className="mt-4 text-neutral-600">Kategori yükleniyor…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 break-all">{error}</p>
          <Link
            href="/admin/categories"
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
      {/* Header */}
      <header className="px-6 pt-10 pb-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <nav className="text-sm text-neutral-600 flex items-center gap-2 mb-4">
              <Link href="/admin" className="hover:underline">Admin</Link>
              <span>›</span>
              <Link href="/admin/categories" className="hover:underline">Kategoriler</Link>
              <span>›</span>
              <span className="text-neutral-900 font-semibold">Düzenle</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-800">
              Kategori Düzenle
            </h1>
            <p className="mt-2 text-sm md:text-base text-neutral-600">
              ID: {initial?.id} — {initial?.name}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/categories"
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
          {/* Uyarılar */}
          {notice && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {notice}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-all">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            {/* İsim */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                Kategori Adı *
              </label>
              <input
                id="name"
                name="name"
                required
                value={form.name}
                onChange={onChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Örn: Elektronik"
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
                value={form.description}
                onChange={onChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Kısa bir açıklama (opsiyonel)"
              />
            </div>

            {/* Görsel URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-700 mb-2">
                Görsel URL
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={onChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="https://…"
              />
              {form.imageUrl?.trim() ? (
                <div className="mt-2">
                  <img
                    src={form.imageUrl}
                    alt="Önizleme"
                    className="h-20 w-20 rounded-lg object-cover border"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
              ) : null}
            </div>

            {/* Kaydet */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving || !isDirty}
                className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!isDirty ? "Değişiklik yok" : undefined}
              >
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
              <Link
                href="/admin/categories"
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

// 204 gibi gövdesiz yanıtları patlatmadan ele almak için küçük yardımcı
async function safeJson(res) {
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}
