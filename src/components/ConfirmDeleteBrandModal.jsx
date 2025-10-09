"use client";

import { useEffect, useState } from "react";

export default function ConfirmDeleteBrandModal({ open, id, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [item, setItem] = useState(null);

  useEffect(() => {
    let cancel = false;
    if (!open || !id) return;
    (async () => {
      try {
        setLoading(true);
        setError("");
        // public GET ile önizleme (admin GET yok)
        const res = await fetch(`/api/brands/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Marka bilgisi alınamadı");
        const data = await res.json();
        if (!cancel) setItem(data);
      } catch (e) {
        if (!cancel) setError(e.message || "Hata");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [open, id]);

  const doDelete = async () => {
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
      if (!res.ok) {
        let msg = "Silme başarısız";
        try { msg = (await res.json())?.message || msg; } catch {}
        throw new Error(msg);
      }
      onDeleted?.(id);
      onClose?.();
    } catch (e) {
      setError(e.message || "Hata");
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-xl border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Markayı Sil</h3>
          <p className="text-sm text-neutral-600">Lütfen son kez kontrol edin.</p>
        </div>
        <div className="p-6">
          {loading ? (
            <div>Yükleniyor...</div>
          ) : error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : item ? (
            <div className="flex gap-4">
              <img
                src={item.imageUrl || "https://via.placeholder.com/96x96?text=M"}
                alt={item.name}
                className="h-20 w-20 rounded-lg object-cover border"
              />
              <div className="text-sm">
                <div className="font-semibold">{item.name}</div>
                <div className="text-neutral-600 mt-1">ID: {item.id}</div>
                {item.description && (
                  <p className="text-neutral-500 mt-2 line-clamp-3">{item.description}</p>
                )}
              </div>
            </div>
          ) : (
            <div>Bulunamadı.</div>
          )}
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">Vazgeç</button>
          <button
            onClick={doDelete}
            disabled={deleting || loading || !item}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Siliniyor..." : "Evet, Sil"}
          </button>
        </div>
      </div>
    </div>
  );
}
