"use client";

import { useEffect, useState } from "react";

export default function ConfirmDeleteModal({ open, id, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open || !id) {
      return;
    }

    setSuccess(false);
    setError("");
    setProduct(null);
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/products/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Ürün detayları alınamadı");
        const data = await res.json();
        if (!cancelled) setProduct(data);
      } catch (e) {
        if (!cancelled) setError(e.message || "Bir hata oluştu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, id]);

  const doDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      setError("");
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        let msg = "Silme işlemi başarısız oldu";
        try {
          msg = (await res.json())?.message || msg;
        } catch {}
        throw new Error(msg);
      }
      onDeleted?.(id);
      setSuccess(true);
    } catch (e) {
      setError(e.message || "Bir hata oluştu");
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-3">
          {success ? "Başarılı" : error ? "Bir Hata Oluştu" : "Silme Onayı"}
        </h3>

        {loading && (
          <p className="text-sm text-neutral-600">Ürün bilgileri getiriliyor…</p>
        )}

        {!loading && product && (
          <div className="mb-4 flex gap-4 items-start">
            <img
              src={product.imageUrl || "https://i.ibb.co/YjV2GG2/placeholder.png"}
              alt={product.title}
              className="h-24 w-24 flex-shrink-0 rounded-lg object-cover border"
            />
            <div className="text-sm">
              <div className="font-semibold text-neutral-900">{product.title}</div>
              <div className="mt-1 text-neutral-500">ID: {product.id}</div>
              <div className="mt-1 text-neutral-500">Fiyat: {product.price} TL</div>
              <div className="mt-1 text-neutral-500">Stok: {product.stock}</div>
              <div className="mt-1 text-neutral-500">
                {product.brandName || "-"} · {product.categoryName || "-"}
              </div>
            </div>
          </div>
        )}

        {!success && !error && !loading && !product && (
          <p className="text-sm text-neutral-600">Ürün bulunamadı.</p>
        )}
        
        {!success && !error && !loading && product && (
          <p className="text-sm text-neutral-700">
            Bu ürünü kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
        )}
        
        {error && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
            Ürün başarıyla silindi. Artık ürünler listesinde görünmeyecek.
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          {!success && !error ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                Vazgeç
              </button>
              <button
                onClick={doDelete}
                disabled={deleting || loading || !product}
                className="px-4 py-2 rounded-lg bg-red-600 text-sm text-white font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${
                success
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-neutral-600 hover:bg-neutral-700"
              }`}
            >
              Kapat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}