"use client";
// src/app/admin/products/create/page.jsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const EMPTY = { title: "", price: "", stock: "", brandId: "", categoryId: "", imageUrl: "", description: "" };

export default function CreateProductPage() {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [listsLoading, setListsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [b, c] = await Promise.all([
          api("/brands"),
          api("/categories"),
        ]);
        if (!cancelled) {
          setBrands(Array.isArray(b) ? b : b?.items ?? []);
          setCategories(Array.isArray(c) ? c : c?.items ?? []);
        }
      } catch {
        // Listeler yüklenemezse boş bırak
      } finally {
        if (!cancelled) setListsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((s) => ({ ...s, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Ürün adı zorunludur";
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0)
      e.price = "Geçerli bir fiyat giriniz";
    if (form.stock !== "" && (isNaN(parseInt(form.stock, 10)) || parseInt(form.stock, 10) < 0))
      e.stock = "Stok 0 veya pozitif bir sayı olmalıdır";
    if (!form.brandId) e.brandId = "Marka seçiniz";
    if (!form.categoryId) e.categoryId = "Kategori seçiniz";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }

    setLoading(true);
    try {
      await api("/admin/products", {
        method: "POST",
        body: {
          title: form.title,
          description: form.description || null,
          price: parseFloat(form.price),
          stock: parseInt(form.stock || "0", 10),
          imageUrl: form.imageUrl || null,
          brandId: parseInt(form.brandId, 10),
          categoryId: parseInt(form.categoryId, 10),
        },
      });
      toast.success("Ürün oluşturuldu");
      router.push("/admin/products");
    } catch (err) {
      toast.error(err.detail || "Ürün oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  const selectCls =
    "rounded-base border border-line bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary disabled:opacity-50";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-ink-soft">
            <Link href="/admin" className="hover:text-ink">Admin</Link>
            <span>›</span>
            <Link href="/admin/products" className="hover:text-ink">Ürünler</Link>
            <span>›</span>
            <span className="text-ink font-medium">Yeni Ürün</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Yeni Ürün Ekle</h1>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/products">Geri</Link>
        </Button>
      </div>

      <div className="rounded-base border border-line bg-surface-card p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Ürün Adı *"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ürün adını girin"
            error={errors.title}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fiyat (TL) *"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              error={errors.price}
            />
            <Input
              label="Stok Adedi"
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
              placeholder="0"
              error={errors.stock}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Marka *</label>
            <select
              name="brandId"
              value={form.brandId}
              onChange={handleChange}
              disabled={listsLoading}
              className={`${selectCls} ${errors.brandId ? "border-danger" : ""}`}
            >
              <option value="">Seçiniz</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            {errors.brandId && <p className="text-xs font-medium text-danger">{errors.brandId}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Kategori *</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              disabled={listsLoading}
              className={`${selectCls} ${errors.categoryId ? "border-danger" : ""}`}
            >
              <option value="">Seçiniz</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-xs font-medium text-danger">{errors.categoryId}</p>}
          </div>

          <Input
            label="Görsel URL"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Ürün Açıklaması</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Ürün açıklamasını girin"
              className="rounded-base border border-line bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary placeholder:text-ink-soft/60"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" size="lg" loading={loading} disabled={listsLoading} className="flex-1">
              Ürünü Oluştur
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
