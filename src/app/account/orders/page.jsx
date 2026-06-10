"use client";
// src/app/account/orders/page.jsx
// Sipariş geçmişi — MRK-XXXXXXXX numarası müşteri hizmetleri referansıdır.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice, formatDate } from "@/lib/format";
import { statusLabel, statusBadgeClass } from "@/lib/order-status";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/account/orders");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    api("/me/orders")
      .then(setOrders)
      .catch((err) => {
        setError(err.detail || "Siparişler yüklenemedi");
        setOrders([]);
      });
  }, [user]);

  if (authLoading || !user || orders === null) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-ink">Siparişlerim</h1>

      {error && (
        <p role="alert" className="mb-4 rounded-base bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <div className="rounded-base border border-line bg-surface-card p-10 text-center">
          <p className="font-medium text-ink">Henüz siparişiniz yok.</p>
          <p className="mt-1 text-sm text-ink-soft">
            İlk siparişinizi vermek için ürünlere göz atın.
          </p>
          <Link href="/products">
            <Button className="mt-4">Alışverişe Başla</Button>
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/account/orders/${o.id}`}
                className="flex items-center justify-between gap-3 rounded-base border border-line bg-surface-card p-4 transition-shadow hover:shadow-md"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-ink">{o.orderNumber}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(o.status)}`}
                    >
                      {statusLabel(o.status)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-ink-soft">
                    {formatDate(o.orderedAtUtc)} · {o.itemCount} ürün
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-bold text-ink">{formatPrice(o.total)}</div>
                  <span aria-hidden className="text-ink-soft">›</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
