"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime } from "@/lib/format";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";

export default function AdminCouponsPage() {
  const toast = useToast();
  const [coupons, setCoupons] = useState(null);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    api("/admin/coupons")
      .then(setCoupons)
      .catch((err) => setError(err.detail || "Kuponlar yüklenemedi"));

  useEffect(() => { load(); }, []);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api(`/admin/coupons/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Kupon silindi");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.detail || "Kupon silinemedi");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await api(`/admin/coupons/${coupon.id}`, {
        method: "PUT",
        body: { ...coupon, isActive: !coupon.isActive },
      });
      load();
    } catch (err) {
      toast.error(err.detail || "Güncelleme başarısız");
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p role="alert" className="rounded-base bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      </div>
    );
  }

  if (!coupons) {
    return (
      <div className="mx-auto max-w-5xl space-y-3 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Kuponlar</h1>
        <Link href="/admin/coupons/create">
          <Button>+ Yeni Kupon</Button>
        </Link>
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-base border border-line bg-surface-card p-10 text-center text-ink-soft">
          Henüz kupon oluşturulmamış.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-base border border-line bg-surface-card">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">
                <th className="px-4 py-3">Kod</th>
                <th className="px-4 py-3">Tür / Değer</th>
                <th className="px-4 py-3">Min Tutar</th>
                <th className="px-4 py-3">Kullanım</th>
                <th className="px-4 py-3">Son Tarih</th>
                <th className="px-4 py-3">Aktif</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-surface">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-ink">{c.code}</span>
                    {c.description && (
                      <p className="text-xs text-ink-soft">{c.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {c.type === "Percentage" ? `%${c.value}` : `${c.value} TL`}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {c.minOrderAmount ? `${c.minOrderAmount} TL` : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {c.usageCount ?? 0}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {c.expiresAt ? formatDateTime(c.expiresAt).split(" ")[0] : "Süresiz"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(c)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        c.isActive ? "bg-success-soft text-success" : "bg-line text-ink-soft"
                      }`}
                    >
                      {c.isActive ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/coupons/${c.id}/edit`}
                        className="text-xs font-semibold text-accent hover:underline"
                      >
                        Düzenle
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
                        className="text-xs font-semibold text-danger hover:underline"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Kuponu Sil"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Vazgeç</Button>
            <Button variant="danger" loading={busy} onClick={confirmDelete}>Sil</Button>
          </>
        }
      >
        <p>
          <strong className="font-mono">{deleteTarget?.code}</strong> kuponu silinecek. Emin misiniz?
        </p>
      </Modal>
    </div>
  );
}
