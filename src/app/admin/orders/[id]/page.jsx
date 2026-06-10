"use client";
// src/app/admin/orders/[id]/page.jsx
// Admin sipariş detayı — kullanıcı e-postası dahil; durum güncelleme.
// Backend kuralı: yalnızca Ordered ↔ Cancelled geçişleri; Active her zaman 409.
import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, formatDateTime } from "@/lib/format";
import { statusLabel, statusBadgeClass } from "@/lib/order-status";
import { MEDIA } from "@/lib/media";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";

export default function AdminOrderDetailPage({ params }) {
  const { id } = use(params);
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [confirmStatus, setConfirmStatus] = useState(null); // hedef durum
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/admin/orders/${id}`)
      .then(setOrder)
      .catch((err) => setError(err.detail || "Sipariş yüklenemedi"));
  }, [id]);

  const updateStatus = async () => {
    setBusy(true);
    try {
      await api(`/admin/orders/${id}/status`, {
        method: "PUT",
        body: { status: confirmStatus },
      });
      toast.success("Sipariş durumu güncellendi");
      setConfirmStatus(null);
      setOrder(await api(`/admin/orders/${id}`));
    } catch (err) {
      toast.error(err.detail || "Durum güncellenemedi");
      setConfirmStatus(null);
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p role="alert" className="rounded-base bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
        <Link href="/admin/orders" className="mt-4 inline-block text-sm font-semibold text-accent hover:underline">
          ‹ Sipariş listesine dön
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  // Mevcut durumdan diğer duruma geçiş
  const nextStatus = order.status === "Ordered" ? "Cancelled" : "Ordered";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Başlık */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-extrabold tracking-tight text-ink">
            {order.orderNumber}
          </h1>
          <p className="mt-0.5 text-sm text-ink-soft">
            {formatDateTime(order.orderedAtUtc)}
            {order.userEmail && <> · {order.userEmail}</>}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusBadgeClass(order.status)}`}>
          {statusLabel(order.status)}
        </span>
      </div>

      {/* Ürünler */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-ink">Ürünler</h2>
        <ul className="divide-y divide-line rounded-base border border-line bg-surface-card">
          {order.items?.map((it, i) => (
            <li key={i} className="flex items-center gap-3 p-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-base bg-primary-soft">
                <Image
                  src={it.imageUrl || MEDIA.product.src}
                  alt={it.title}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="line-clamp-1 text-sm font-medium text-ink">{it.title}</span>
                <span className="text-xs text-ink-soft">
                  {formatPrice(it.unitPriceSnapshot)} × {it.quantity}
                </span>
              </div>
              <span className="shrink-0 text-sm font-bold text-ink">{formatPrice(it.subtotal)}</span>
            </li>
          ))}
          <li className="flex items-center justify-between p-4">
            <span className="font-medium text-ink">Toplam</span>
            <span className="text-lg font-extrabold text-ink">{formatPrice(order.total)}</span>
          </li>
        </ul>
      </section>

      {/* Teslimat adresi */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-ink">Teslimat Adresi</h2>
        <div className="rounded-base border border-line bg-surface-card p-4 text-sm text-ink-soft">
          {order.shippingStreet}, {order.shippingState} / {order.shippingCity}{" "}
          {order.shippingPostalCode}, {order.shippingCountry}
        </div>
      </section>

      <div className="flex items-center justify-between">
        <Link href="/admin/orders" className="text-sm font-semibold text-accent hover:underline">
          ‹ Sipariş listesine dön
        </Link>
        <Button
          variant={nextStatus === "Cancelled" ? "danger" : "primary"}
          onClick={() => setConfirmStatus(nextStatus)}
        >
          {nextStatus === "Cancelled" ? "Siparişi İptal Et" : "Siparişi Aktifleştir"}
        </Button>
      </div>

      {/* Durum değişikliği onayı */}
      <Modal
        open={!!confirmStatus}
        onClose={() => setConfirmStatus(null)}
        title="Durum Güncelle"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmStatus(null)}>
              Vazgeç
            </Button>
            <Button
              variant={confirmStatus === "Cancelled" ? "danger" : "primary"}
              loading={busy}
              onClick={updateStatus}
            >
              Onayla
            </Button>
          </>
        }
      >
        <p>
          <strong className="font-mono">{order.orderNumber}</strong> numaralı siparişin durumu{" "}
          <strong>{statusLabel(order.status)}</strong> →{" "}
          <strong>{statusLabel(confirmStatus)}</strong> olarak değiştirilecek. Onaylıyor musunuz?
        </p>
      </Modal>
    </div>
  );
}
