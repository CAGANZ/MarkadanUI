"use client";
// src/app/admin/orders/page.jsx
// Admin sipariş listesi — durum ve tarih aralığı filtreli.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, formatDate } from "@/lib/format";
import { statusLabel, statusBadgeClass } from "@/lib/order-status";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

const STATUS_FILTERS = [
  { value: "", label: "Tümü" },
  { value: "Ordered", label: "Sipariş Alındı" },
  { value: "Cancelled", label: "İptal Edildi" },
];

export default function AdminOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState(null);
  const [filters, setFilters] = useState({ status: "", dateFrom: "", dateTo: "" });

  const load = useCallback(async () => {
    setOrders(null);
    const qs = new URLSearchParams();
    if (filters.status) qs.set("status", filters.status);
    if (filters.dateFrom) qs.set("dateFrom", new Date(filters.dateFrom).toISOString());
    if (filters.dateTo) qs.set("dateTo", new Date(filters.dateTo).toISOString());
    const s = qs.toString();
    try {
      setOrders(await api(`/admin/orders${s ? `?${s}` : ""}`));
    } catch (err) {
      toast.error(err.detail || "Siparişler yüklenemedi");
      setOrders([]);
    }
  }, [filters, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const inputCls =
    "rounded-base border border-line bg-surface-card px-3 py-2 text-sm text-ink outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-ink">Sipariş Yönetimi</h1>

      {/* Filtreler */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">Durum</label>
          <select
            className={inputCls}
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">Başlangıç</label>
          <input
            type="date"
            className={inputCls}
            value={filters.dateFrom}
            onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">Bitiş</label>
          <input
            type="date"
            className={inputCls}
            value={filters.dateTo}
            onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
          />
        </div>
        {(filters.status || filters.dateFrom || filters.dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({ status: "", dateFrom: "", dateTo: "" })}
          >
            Temizle
          </Button>
        )}
      </div>

      {/* Liste */}
      {orders === null ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-base border border-line bg-surface-card p-10 text-center">
          <p className="font-medium text-ink">Bu filtrelerle eşleşen sipariş yok.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between gap-3 rounded-base border border-line bg-surface-card p-4 transition-shadow hover:shadow-md"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-ink">{o.orderNumber}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(o.status)}`}>
                      {statusLabel(o.status)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-ink-soft">
                    {formatDate(o.orderedAtUtc)} · {o.itemCount} ürün
                  </div>
                </div>
                <div className="shrink-0 font-bold text-ink">{formatPrice(o.total)}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
