"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const EMPTY = {
  code: "",
  description: "",
  type: "Percentage",
  value: "",
  minOrderAmount: "",
  usageLimit: "",
  expiresAt: "",
  isActive: true,
};

export default function CouponForm({ initial, couponId }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(initial ?? EMPTY);
  const [busy, setBusy] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = {
        ...form,
        value: Number(form.value),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };
      if (couponId) {
        await api(`/admin/coupons/${couponId}`, { method: "PUT", body });
        toast.success("Kupon güncellendi");
      } else {
        await api("/admin/coupons", { method: "POST", body });
        toast.success("Kupon oluşturuldu");
      }
      router.push("/admin/coupons");
    } catch (err) {
      toast.error(err.detail || "İşlem başarısız");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-5 px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink">
        {couponId ? "Kuponu Düzenle" : "Yeni Kupon"}
      </h1>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Kod *</label>
        <Input
          value={form.code}
          onChange={(e) => set("code", e.target.value.toUpperCase())}
          placeholder="HOSGELDIN10"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Açıklama *</label>
        <Input
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="İlk alışverişe indirim"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink">Tür *</label>
        <div className="flex gap-6">
          {["Percentage", "FixedAmount"].map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="type"
                value={t}
                checked={form.type === t}
                onChange={() => set("type", t)}
                className="accent-primary"
              />
              {t === "Percentage" ? "Yüzde (%)" : "Sabit (TL)"}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">
          Değer * {form.type === "Percentage" ? "(%)" : "(TL)"}
        </label>
        <Input
          type="number"
          min="0"
          value={form.value}
          onChange={(e) => set("value", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Min Sipariş Tutarı (TL)</label>
        <Input
          type="number"
          min="0"
          value={form.minOrderAmount}
          onChange={(e) => set("minOrderAmount", e.target.value)}
          placeholder="Boş = sınır yok"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Kullanım Limiti</label>
        <Input
          type="number"
          min="0"
          value={form.usageLimit}
          onChange={(e) => set("usageLimit", e.target.value)}
          placeholder="Boş = limitsiz"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Son Geçerlilik Tarihi</label>
        <Input
          type="date"
          value={form.expiresAt ? form.expiresAt.split("T")[0] : ""}
          onChange={(e) => set("expiresAt", e.target.value)}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
          className="size-4 accent-primary"
        />
        <span className="text-sm font-medium text-ink">Aktif</span>
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={busy}>
          {couponId ? "Kaydet" : "Oluştur"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/coupons")}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}
