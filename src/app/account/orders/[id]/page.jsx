"use client";
// src/app/account/orders/[id]/page.jsx
// Sipariş detayı — checkout sonrası ?new=1 ile kutlama başlığı gösterir.
// Adres snapshot'tır: kullanıcı adresi silse bile sipariş kaydı bozulmaz.
// İptal yalnızca "Ordered" durumunda mümkündür.
import { Suspense, use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/client/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, formatDateTime } from "@/lib/format";
import { statusLabel, statusBadgeClass, canCustomerCancel } from "@/lib/order-status";
import { MEDIA } from "@/lib/media";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";

function OrderDetail({ id }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);

  const isNew = sp.get("new") === "1";

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/login?next=/account/orders/${id}`);
  }, [authLoading, user, router, id]);

  useEffect(() => {
    if (!user) return;
    api(`/me/orders/${id}`)
      .then(setOrder)
      .catch((err) => setError(err.detail || "Sipariş yüklenemedi"));
  }, [user, id]);

  const cancelOrder = async () => {
    setBusy(true);
    try {
      await api(`/me/orders/${id}/cancel`, { method: "POST" });
      toast.success("Siparişiniz iptal edildi");
      setConfirmCancel(false);
      setOrder(await api(`/me/orders/${id}`));
    } catch (err) {
      toast.error(err.detail || "Sipariş iptal edilemedi");
      setConfirmCancel(false);
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p role="alert" className="rounded-base bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
        <Link href="/account/orders" className="mt-4 inline-block text-sm font-semibold text-accent hover:underline">
          ‹ Siparişlerime dön
        </Link>
      </div>
    );
  }

  if (authLoading || !user || !order) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  const copyOrderNumber = () => {
    navigator.clipboard?.writeText(order.orderNumber);
    toast.info("Sipariş numarası kopyalandı");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Yeni sipariş kutlaması */}
      {isNew && (
        <div className="mb-6 rounded-base border border-success/30 bg-success-soft p-5 text-center">
          <p className="text-lg font-bold text-success">Siparişiniz alındı 🎉</p>
          <p className="mt-1 text-sm text-ink-soft">
            Sipariş numaranızı not alın — müşteri hizmetleri için referansınızdır.
          </p>
        </div>
      )}

      {/* Başlık + durum */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={copyOrderNumber}
            title="Kopyalamak için tıklayın"
            className="font-mono text-xl font-extrabold tracking-tight text-ink hover:text-accent"
          >
            {order.orderNumber}
          </button>
          <p className="mt-0.5 text-sm text-ink-soft">{formatDateTime(order.orderedAtUtc)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusBadgeClass(order.status)}`}>
          {statusLabel(order.status)}
        </span>
      </div>

      {/* Ürünler — snapshot fiyatlarla */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-ink">Ürünler</h2>
        <ul className="divide-y divide-line rounded-base border border-line bg-surface-card">
          {order.items?.map((it, i) => (
            <li key={i} className="flex items-center gap-3 p-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-base bg-primary-soft">
                <Image
                  src={it.imageUrl || MEDIA.product.src}
                  alt={it.title}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${it.productId}`}
                  className="line-clamp-1 text-sm font-medium text-ink hover:underline"
                >
                  {it.title}
                </Link>
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

      {/* Teslimat adresi (snapshot) */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-ink">Teslimat Adresi</h2>
        <div className="rounded-base border border-line bg-surface-card p-4 text-sm text-ink-soft">
          {order.shippingStreet}, {order.shippingState} / {order.shippingCity}{" "}
          {order.shippingPostalCode}, {order.shippingCountry}
          <p className="mt-2 text-xs">
            Bu adres sipariş anında kaydedilmiştir; adres defterinizdeki değişikliklerden etkilenmez.
          </p>
        </div>
      </section>

      {/* Kargo takip */}
      {(order.status === "Shipped" || order.status === "Delivered") && order.trackingNumber && (
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-ink">Kargo Takip</h2>
          <div className="flex items-center justify-between gap-3 rounded-base border border-line bg-surface-card p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Takip No</p>
              <p className="mt-0.5 font-mono text-sm font-bold text-ink">{order.trackingNumber}</p>
            </div>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-base bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Kargonuzu Takip Edin →
              </a>
            )}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between">
        <Link href="/account/orders" className="text-sm font-semibold text-accent hover:underline">
          ‹ Siparişlerime dön
        </Link>
        <div className="flex flex-col items-end gap-1">
          {canCustomerCancel(order.status) && (
            <Button variant="danger" onClick={() => setConfirmCancel(true)}>
              Siparişi İptal Et
            </Button>
          )}
          {order.status === "Shipped" && (
            <p className="text-xs text-ink-soft">Kargo çıktıktan sonra iptal edilemez.</p>
          )}
        </div>
      </div>

      {/* İptal onayı */}
      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Siparişi İptal Et"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmCancel(false)}>
              Vazgeç
            </Button>
            <Button variant="danger" loading={busy} onClick={cancelOrder}>
              İptal Et
            </Button>
          </>
        }
      >
        <p>
          <strong className="font-mono">{order.orderNumber}</strong> numaralı siparişinizi iptal
          etmek istediğinize emin misiniz?
        </p>
        {(order.status === "Ordered" || order.status === "Preparing") && (
          <p className="mt-2 text-sm text-ink-soft">
            Siparişiniz iptal edilecek ve ödemeniz iade edilecektir.
          </p>
        )}
        {order.status === "PaymentPending" && (
          <p className="mt-2 text-sm text-ink-soft">Siparişiniz iptal edilecektir.</p>
        )}
      </Modal>
    </div>
  );
}

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  return (
    <Suspense>
      <OrderDetail id={id} />
    </Suspense>
  );
}
