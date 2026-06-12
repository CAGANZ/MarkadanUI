"use client";
import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

export default function EditBrandPage({ params }) {
  const { id } = use(params);
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await api(`/brands/${id}`);
        if (!cancelled) {
          setInitial(data);
          setForm({
            name: data?.name ?? "",
            description: data?.description ?? "",
            imageUrl: data?.imageUrl ?? "",
          });
        }
      } catch (e) {
        if (!cancelled) setError(e.detail || e.message || "Marka yüklenemedi");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const diffPayload = useMemo(() => {
    if (!initial) return null;
    const payload = {};
    for (const key of ["name", "description", "imageUrl"]) {
      const before = (initial[key] ?? "") || "";
      const after = (form[key] ?? "") || "";
      if (before !== after) payload[key] = after.trim().length === 0 ? null : after.trim();
    }
    return Object.keys(payload).length ? payload : null;
  }, [initial, form]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!diffPayload) { toast.info("Değişiklik bulunmuyor"); return; }
    setSaving(true);
    try {
      const res = await api(`/admin/brands/${id}`, { method: "PUT", body: diffPayload });
      const merged = { ...initial, ...(res || diffPayload) };
      setInitial(merged);
      setForm({ name: merged.name ?? "", description: merged.description ?? "", imageUrl: merged.imageUrl ?? "" });
      toast.success("Marka güncellendi");
    } catch (e) {
      toast.error(e.detail || "Güncelleme başarısız");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="rounded-base bg-danger-soft px-4 py-3 text-sm font-medium text-danger">{error}</p>
        <Link href="/admin/brands" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
          ‹ Markalara dön
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-ink-soft">
            <Link href="/admin" className="hover:text-ink">Admin</Link>
            <span>›</span>
            <Link href="/admin/brands" className="hover:text-ink">Markalar</Link>
            <span>›</span>
            <span className="text-ink font-medium">Düzenle</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Marka Düzenle</h1>
          <p className="mt-1 text-sm text-ink-soft">#{initial?.id} — {initial?.name}</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/brands">Geri</Link>
        </Button>
      </div>

      <div className="rounded-base border border-line bg-surface-card p-6 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-5">
          <Input label="Marka Adı *" name="name" required value={form.name} onChange={onChange} placeholder="Örn: Nike" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Açıklama</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={onChange}
              placeholder="Kısa açıklama (opsiyonel)"
              className="rounded-base border border-line bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary placeholder:text-ink-soft/60"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Görsel URL</label>
            <input
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={onChange}
              placeholder="https://…"
              className="rounded-base border border-line bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary w-full"
            />
            {form.imageUrl?.trim() && (
              <img
                src={form.imageUrl}
                alt="Önizleme"
                className="mt-1 h-20 w-20 rounded-base object-cover border border-line"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" size="lg" loading={saving} disabled={!diffPayload} className="flex-1">
              Değişiklikleri Kaydet
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/admin/brands">İptal</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
