"use client";
// src/app/admin/products/[id]/edit/page.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

export default function EditProductPage() {
  const { id } = useParams();
  const toast = useToast();

  const [original, setOriginal] = useState(null);
  const [form, setForm] = useState({
    title: "", price: "", stock: "", brandId: "", categoryId: "", imageUrl: "", description: "",
  });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [prod, bJson, cJson] = await Promise.all([
          api(`/admin/products/${id}`),
          api("/admin/brands"),
          api("/admin/categories"),
        ]);
        if (cancelled) return;
        setBrands(Array.isArray(bJson) ? bJson : bJson?.items ?? []);
        setCategories(Array.isArray(cJson) ? cJson : cJson?.items ?? []);
        setOriginal(prod);
        setForm({
          title: prod.title ?? "",
          price: prod.price ?? "",
          stock: prod.stock ?? "",
          brandId: prod.brandId ?? "",
          categoryId: prod.categoryId ?? "",
          imageUrl: prod.imageUrl ?? "",
          description: prod.description ?? "",
        });
      } catch (e) {
        if (!cancelled) setError(e.detail || e.message || "Yükleme hatası");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const diffPayload = useMemo(() => {
    if (!original) return null;
    const toNum = (v, kind) => {
      if (v === "" || v == null) return v;
      return kind === "int" ? parseInt(v, 10) : parseFloat(v);
    };
    const current = {
      title: form.title,
      description: form.description || null,
      price: toNum(form.price, "float"),
      stock: toNum(form.stock, "int"),
      imageUrl: form.imageUrl || null,
      brandId: form.brandId === "" ? null : toNum(form.brandId, "int"),
      categoryId: form.categoryId === "" ? null : toNum(form.categoryId, "int"),
    };
    const base = {
      title: original.title ?? null,
      description: original.description ?? null,
      price: original.price ?? null,
      stock: original.stock ?? null,
      imageUrl: original.imageUrl ?? null,
      brandId: original.brandId ?? null,
      categoryId: original.categoryId ?? null,
    };
    const body = {};
    for (const k of Object.keys(current)) {
      if (current[k] !== base[k]) body[k] = current[k];
    }
    return body;
  }, [form, original]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diffPayload || Object.keys(diffPayload).length === 0) {
      toast.info("Değişiklik yapılmadı");
      return;
    }
    setSaving(true);
    try {
      const updated = await api(`/admin/products/${id}`, {
        method: "PUT",
        body: diffPayload,
      });
      setOriginal(updated);
      setForm({
        title: updated.title ?? "",
        price: updated.price ?? "",
        stock: updated.stock ?? "",
        brandId: updated.brandId ?? "",
        categoryId: updated.categoryId ?? "",
        imageUrl: updated.imageUrl ?? "",
        description: updated.description ?? "",
      });
      toast.success("Değişiklikler kaydedildi");
    } catch (err) {
      toast.error(err.detail || "Güncelleme başarısız");
    } finally {
      setSaving(false);
    }
  };

  const selectCls =
    "rounded-base border border-line bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary";

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="rounded-base bg-danger-soft px-4 py-3 text-sm font-medium text-danger">{error}</p>
        <Link href="/admin/products" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
          ‹ Ürünlere dön
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
            <Link href="/admin/products" className="hover:text-ink">Ürünler</Link>
            <span>›</span>
            <span className="text-ink font-medium">Düzenle</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Ürün Düzenle</h1>
          <p className="mt-1 text-sm text-ink-soft">{original?.title} (#{id})</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/admin/products/${id}/variants`}>Varyantlar</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/products/${id}`}>Görüntüle</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/products">Geri</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-base border border-line bg-surface-card p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Ürün Adı" name="title" value={form.title} onChange={handleChange} placeholder="Ürün adı" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Fiyat (TL)" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" />
            <Input label="Stok" name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} placeholder="0" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Marka</label>
            <select name="brandId" value={form.brandId} onChange={handleChange} className={selectCls}>
              <option value="">Seçiniz</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Kategori</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} className={selectCls}>
              <option value="">Seçiniz</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Görsel URL</label>
            <input
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={`${selectCls} w-full`}
            />
            {form.imageUrl ? (
              <img
                src={form.imageUrl}
                alt="Önizleme"
                className="mt-1 h-20 w-20 rounded-base object-cover border border-line"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Açıklama</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Ürün açıklaması"
              className="rounded-base border border-line bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary placeholder:text-ink-soft/60"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={saving}
              disabled={!diffPayload || Object.keys(diffPayload).length === 0}
              className="flex-1"
            >
              Değişiklikleri Kaydet
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/admin/products">İptal</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
