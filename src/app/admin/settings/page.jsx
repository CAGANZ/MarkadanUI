"use client";
// src/app/admin/settings/page.jsx
import { useEffect, useState } from "react";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

const EMPTY = {
  storeName: "",
  logoUrl: "",
  description: "",
  whatsAppPhone: "",
  contactPhone: "",
  contactEmail: "",
  instagramUrl: "",
  facebookUrl: "",
  primaryColor: "",
  accentColor: "",
  metaDescription: "",
};

function ColorField({ label, name, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange({ target: { name, value: e.target.value } })}
          className="h-10 w-10 cursor-pointer rounded-base border border-line bg-surface-card p-0.5"
        />
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder="#RRGGBB"
          maxLength={7}
          className="flex-1 rounded-base border border-line bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary"
        />
      </div>
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

export default function AdminSettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const data = await api("/admin/settings");
        setForm({ ...EMPTY, ...data });
      } catch (err) {
        toast.error(err.detail || "Ayarlar yüklenemedi");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((s) => ({ ...s, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (form.primaryColor && !HEX_RE.test(form.primaryColor))
      e.primaryColor = "Geçerli 6 haneli hex girin (#RRGGBB)";
    if (form.accentColor && !HEX_RE.test(form.accentColor))
      e.accentColor = "Geçerli 6 haneli hex girin (#RRGGBB)";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSaving(true);
    try {
      await api("/admin/settings", { method: "PUT", body: form });
      toast.success("Ayarlar kaydedildi");
    } catch (err) {
      toast.error(err.detail || "Kaydetme başarısız");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Mağaza Ayarları</h1>
        <p className="mt-1 text-sm text-ink-soft">Mağaza kimliği, iletişim ve görsel tercihler</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mağaza Kimliği */}
        <section className="rounded-base border border-line bg-surface-card p-6 shadow-sm space-y-5">
          <h2 className="text-base font-semibold text-ink border-b border-line pb-3">Mağaza Kimliği</h2>
          <Input label="Mağaza Adı" name="storeName" value={form.storeName} onChange={handleChange} placeholder="Örn: Markadan Butik" />
          <Input label="Logo URL" name="logoUrl" value={form.logoUrl} onChange={handleChange} placeholder="https://..." />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Kısa Açıklama</label>
            <textarea
              name="description"
              rows={2}
              value={form.description}
              onChange={handleChange}
              placeholder="Mağaza slogan veya kısa tanıtım"
              className="rounded-base border border-line bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary placeholder:text-ink-soft/60"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">SEO Meta Açıklaması</label>
            <textarea
              name="metaDescription"
              rows={2}
              value={form.metaDescription}
              onChange={handleChange}
              placeholder="Arama motorlarında görünecek açıklama"
              className="rounded-base border border-line bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary placeholder:text-ink-soft/60"
            />
          </div>
        </section>

        {/* İletişim */}
        <section className="rounded-base border border-line bg-surface-card p-6 shadow-sm space-y-5">
          <h2 className="text-base font-semibold text-ink border-b border-line pb-3">İletişim</h2>
          <Input label="WhatsApp Hattı" name="whatsAppPhone" value={form.whatsAppPhone} onChange={handleChange} placeholder="905xxxxxxxxx (ülke koduyla, + olmadan)" />
          <Input label="Telefon" name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="0212 xxx xx xx" />
          <Input label="E-posta" name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} placeholder="info@magaza.com" />
          <Input label="Instagram URL" name="instagramUrl" value={form.instagramUrl} onChange={handleChange} placeholder="https://instagram.com/..." />
          <Input label="Facebook URL" name="facebookUrl" value={form.facebookUrl} onChange={handleChange} placeholder="https://facebook.com/..." />
        </section>

        {/* Tema Renkleri */}
        <section className="rounded-base border border-line bg-surface-card p-6 shadow-sm space-y-5">
          <h2 className="text-base font-semibold text-ink border-b border-line pb-3">Tema Renkleri</h2>
          <p className="text-xs text-ink-soft">Değişiklikler sonraki sayfa yüklemesinde geçerli olur.</p>
          <ColorField label="Ana Renk (Primary)" name="primaryColor" value={form.primaryColor} onChange={handleChange} error={errors.primaryColor} />
          <ColorField label="Vurgu Rengi (Accent)" name="accentColor" value={form.accentColor} onChange={handleChange} error={errors.accentColor} />
        </section>

        <Button type="submit" variant="primary" size="lg" loading={saving} className="w-full">
          Değişiklikleri Kaydet
        </Button>
      </form>
    </div>
  );
}
