"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const EMPTY = { name: "", description: "", imageUrl: "" };

export default function CreateCategoryPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((s) => ({ ...s, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Kategori adı zorunludur";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true);
    try {
      await api("/admin/categories", {
        method: "POST",
        body: {
          name: form.name.trim(),
          description: form.description.trim() || null,
          imageUrl: form.imageUrl.trim() || null,
        },
      });
      toast.success("Kategori oluşturuldu");
      router.push("/admin/categories");
    } catch (err) {
      toast.error(err.detail || "Kategori oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-ink-soft">
            <Link href="/admin" className="hover:text-ink">Admin</Link>
            <span>›</span>
            <Link href="/admin/categories" className="hover:text-ink">Kategoriler</Link>
            <span>›</span>
            <span className="text-ink font-medium">Yeni Kategori</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Yeni Kategori Ekle</h1>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/categories">Geri</Link>
        </Button>
      </div>

      <div className="rounded-base border border-line bg-surface-card p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Kategori Adı *"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Örn: Kadın Giyim"
            error={errors.name}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Açıklama</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Kategori hakkında kısa açıklama (opsiyonel)"
              className="rounded-base border border-line bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary placeholder:text-ink-soft/60"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Görsel URL</label>
            <input
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
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
            <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1">
              Kategoriyi Oluştur
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/admin/categories">İptal</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
