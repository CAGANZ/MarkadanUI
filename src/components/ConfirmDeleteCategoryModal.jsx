"use client";

import { useEffect, useState } from "react";

export default function ConfirmDeleteCategoryModal({
  open,
  id,
  onClose,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState(null);
  // error state'ini nesne olarak tutmaya devam ediyoruz, ancak başlangıç değeri null.
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setError(null);
    setSuccess(false);
    setItem(null);

    if (!open || !id) return;

    let cancelled = false;
    (async () => {
      try {
        // Not: Burada /api/categories/{id} yerine /api/admin/categories/{id} kullanmam gerekebilir
        const res = await fetch(`/api/categories/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Kategori bulunamadı.");
        const data = await res.json();
        if (!cancelled) setItem(data);
      } catch (e) {
        if (!cancelled) setError("Kategori bilgisi getirilemedi.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, id]);

  function closeAndReset() {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setItem(null);
    onClose?.();
  }

  async function handleDelete() {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (res.status === 204) {
        setSuccess(true);
        onDeleted?.(id);
        return;
      }

      if (!res.ok) {
        const status = res.status;
        let title = `İşlem Başarısız (Hata Kodu: ${status})`;
        let detail = "Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.";

        const rawText = await res.text().catch(() => "");
        let parsedJson = null;

        try {
          if (rawText) {
            parsedJson = JSON.parse(rawText);
          }
        } catch (e) {}

        if (status === 409) {
          title = `İşlem Başarısız (Hata Kodu: 409)`;
          detail =
            "Silmek istediğiniz kategori herhangi bir ürüne bağlı olduğu için kategoriyi silemezsiniz.";
        } else {
          if (parsedJson) {
            title = parsedJson?.title || title;
            detail = parsedJson?.detail || detail;
          } else {
            detail = rawText || detail;
          }
        }

        setError({ title, detail, status });
        return;
      }
    } catch (e) {
      setError({
        title: "Bağlantı Hatası",
        detail: e?.message || "Beklenmeyen bir hata oluştu.",
        status: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const showActionButtons = !success && !error;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-3">
          {error ? error.title : "Kategoriyi Sil"}
        </h3>
        {item ? (
          <div className="mb-4 flex gap-3 items-center">
            {item.imageUrl ? (
              <img
                src={item.imageUrl || "https://ibb.co/FLtkpjHf"}
                alt={item.name}
                className="h-12 w-12 rounded-lg object-cover border"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg border flex items-center justify-center text-neutral-400">
                —
              </div>
            )}
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-neutral-500">ID: {item.id}</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-600 mb-4">
            Seçili kategori bilgisi getiriliyor…
          </p>
        )}
        {!success && !error && (
          <p className="text-sm text-neutral-700">
            Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri
            alınamaz.
          </p>
        )}
        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error.detail}
          </p>
        )}

        {success && (
          <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
            Kategori başarıyla silindi.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          {!success && !error ? (
            <>
              <button
                onClick={closeAndReset}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </>
          ) : (
            <button
              onClick={closeAndReset}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                success
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-neutral-600 hover:bg-neutral-700"
              }`}
            >
              Tamam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
