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
  const [selectedStatus, setSelectedStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [confirmStatus, setConfirmStatus] = useState(false);
  const [busy, setBusy] = useState(false);

  const STATUS_FLOW = ["Ordered", "Preparing", "Shipped", "Delivered", "Cancelled"];

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
        body: {
          status: selectedStatus,
          ...(selectedStatus === "Shipped" && trackingNumber
            ? { trackingNumber, trackingUrl: trackingUrl || undefined }
            : {}),
        },
      });
      toast.success("Sipariş durumu güncellendi");
      setConfirmStatus(false);
      setSelectedStatus("");
      setOrder(await api(`/admin/orders/${id}`));
    } catch (err) {
      toast.error(err.detail || "Durum güncellenemedi");
      setConfirmStatus(false);
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

  const availableStatuses = STATUS_FLOW.filter((s) => s !== order.status);

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
                  {it.variantLabel && <span className="text-ink">{it.variantLabel} · </span>}
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

      {/* Mevcut kargo takip bilgisi */}
      {order.trackingNumber && (
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-ink">Kargo Takip</h2>
          <div className="flex items-center justify-between gap-3 rounded-base border border-line bg-surface-card p-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Takip No</p>
              <p className="mt-0.5 font-mono font-bold text-ink">{order.trackingNumber}</p>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  {order.trackingUrl}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Durum güncelleme */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-ink">Durum Güncelle</h2>
        <div className="space-y-3 rounded-base border border-line bg-surface-card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                if (e.target.value !== "Shipped") {
                  setTrackingNumber("");
                  setTrackingUrl("");
                }
              }}
              className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            >
              <option value="">— Durum seç —</option>
              {availableStatuses.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
            <Button
              variant={selectedStatus === "Cancelled" ? "danger" : "primary"}
              disabled={!selectedStatus}
              onClick={() => setConfirmStatus(true)}
            >
              Güncelle
            </Button>
          </div>
          {selectedStatus === "Shipped" && (
            <div className="space-y-2 border-t border-line pt-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-soft">Kargo Takip No *</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="YK123456789TR"
                  className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-soft">Kargo Takip URL (opsiyonel)</label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://gonderitakip.yurticikargo.com/track/..."
                  className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <Link href="/admin/orders" className="text-sm font-semibold text-accent hover:underline">
        ‹ Sipariş listesine dön
      </Link>

      {/* Durum değişikliği onayı */}
      <Modal
        open={confirmStatus}
        onClose={() => setConfirmStatus(false)}
        title="Durum Güncelle"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmStatus(false)}>
              Vazgeç
            </Button>
            <Button
              variant={selectedStatus === "Cancelled" ? "danger" : "primary"}
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
          <strong>{statusLabel(selectedStatus)}</strong> olarak değiştirilecek. Onaylıyor musunuz?
        </p>
      </Modal>
    </div>
  );
}
