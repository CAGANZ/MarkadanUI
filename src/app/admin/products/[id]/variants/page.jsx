"use client";
// src/app/admin/products/[id]/variants/page.jsx
// Opsiyon (eksen) ve varyant yönetimi — T5.
// Model: eksen (Beden) → değerler (S/M/L) → varyant (her eksenden bir değer).
// Backend kuralları 409 ile döner (aynı isimli eksen, aynı kombinasyon,
// kullanımdaki eksen/değer silme, sepette olan varyantı silme) — mesaj
// doğrudan kullanıcıya gösterilir.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/format";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import { optionCombinations, variantLabel } from "@/lib/variants";

const inputCls =
  "rounded-base border border-line bg-surface-card px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary placeholder:text-ink-soft/60";

const emptyVariantForm = { sku: "", price: "", stock: "0", imageUrl: "", isActive: true };

export default function ProductVariantsPage() {
  const { id } = useParams();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [options, setOptions] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Eksen ekleme
  const [optionName, setOptionName] = useState("");
  const [optionValues, setOptionValues] = useState("");
  // Eksene değer ekleme: optionId → metin
  const [valueDraft, setValueDraft] = useState({});

  // Varyant formu (yeni kayıt) — seçim: optionId → optionValueId
  const [selection, setSelection] = useState({});
  const [form, setForm] = useState(emptyVariantForm);
  // Satır içi düzenleme
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyVariantForm);

  const [confirm, setConfirm] = useState(null); // { kind, id, label }

  const loadOptions = useCallback(async () => {
    const data = await api(`/admin/products/${id}/options`);
    setOptions(Array.isArray(data) ? data : (data?.items ?? []));
  }, [id]);

  const loadVariants = useCallback(async () => {
    const data = await api(`/admin/products/${id}/variants`);
    setVariants(Array.isArray(data) ? data : (data?.items ?? []));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [prod, opts, vars] = await Promise.all([
          api(`/admin/products/${id}`),
          api(`/admin/products/${id}/options`),
          api(`/admin/products/${id}/variants`),
        ]);
        if (cancelled) return;
        setProduct(prod);
        setOptions(Array.isArray(opts) ? opts : (opts?.items ?? []));
        setVariants(Array.isArray(vars) ? vars : (vars?.items ?? []));
      } catch (e) {
        if (!cancelled) setError(e.detail || e.message || "Yükleme hatası");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const labelOf = useCallback((variant) => variantLabel({ options }, variant), [options]);

  // Henüz varyantı olmayan kombinasyonlar
  const missingCombos = useMemo(() => {
    if (options.length === 0 || options.some((o) => (o.values?.length ?? 0) === 0)) return [];
    const key = (ids) => [...ids].sort((a, b) => a - b).join("-");
    const existing = new Set(variants.map((v) => key(v.optionValueIds ?? [])));
    return optionCombinations(options).filter((combo) => !existing.has(key(combo)));
  }, [options, variants]);

  const toPayload = (f, optionValueIds) => ({
    sku: f.sku.trim() || null,
    price: f.price === "" ? null : parseFloat(f.price),
    stock: f.stock === "" ? 0 : parseInt(f.stock, 10),
    imageUrl: f.imageUrl.trim() || null,
    isActive: f.isActive,
    optionValueIds,
  });

  // ── Eksen işlemleri ────────────────────────────────────────────────────────
  const addOption = async () => {
    if (!optionName.trim()) return;
    setBusy(true);
    try {
      const values = optionValues
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .map((value, i) => ({ value, sortOrder: i }));
      await api(`/admin/products/${id}/options`, {
        method: "POST",
        body: { name: optionName.trim(), sortOrder: options.length, values },
      });
      setOptionName("");
      setOptionValues("");
      await loadOptions();
      toast.success("Seçenek eklendi");
    } catch (err) {
      toast.error(err.detail || "Seçenek eklenemedi");
    } finally {
      setBusy(false);
    }
  };

  const addValue = async (optionId) => {
    const value = (valueDraft[optionId] ?? "").trim();
    if (!value) return;
    setBusy(true);
    try {
      const option = options.find((o) => o.id === optionId);
      await api(`/admin/products/${id}/options/${optionId}/values`, {
        method: "POST",
        body: { value, sortOrder: option?.values?.length ?? 0 },
      });
      setValueDraft((s) => ({ ...s, [optionId]: "" }));
      await loadOptions();
    } catch (err) {
      toast.error(err.detail || "Değer eklenemedi");
    } finally {
      setBusy(false);
    }
  };

  const doConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.kind === "option") {
        await api(`/admin/products/${id}/options/${confirm.id}`, { method: "DELETE" });
        await loadOptions();
        toast.info("Seçenek silindi");
      } else if (confirm.kind === "value") {
        await api(`/admin/products/${id}/option-values/${confirm.id}`, { method: "DELETE" });
        await loadOptions();
        toast.info("Değer silindi");
      } else {
        await api(`/admin/products/${id}/variants/${confirm.id}`, { method: "DELETE" });
        await loadVariants();
        toast.info("Varyant silindi");
      }
      setConfirm(null);
    } catch (err) {
      toast.error(err.detail || "Silme başarısız");
    } finally {
      setBusy(false);
    }
  };

  // ── Varyant işlemleri ──────────────────────────────────────────────────────
  const createVariant = async () => {
    const optionValueIds = options.map((o) => selection[o.id]);
    if (optionValueIds.some((v) => v == null)) {
      toast.error("Her seçenek için bir değer seçin");
      return;
    }
    setBusy(true);
    try {
      await api(`/admin/products/${id}/variants`, {
        method: "POST",
        body: toPayload(form, optionValueIds),
      });
      setForm(emptyVariantForm);
      setSelection({});
      await loadVariants();
      toast.success("Varyant eklendi");
    } catch (err) {
      toast.error(err.detail || "Varyant eklenemedi");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (v) => {
    setEditingId(v.id);
    setEditForm({
      sku: v.sku ?? "",
      price: v.price ?? "",
      stock: String(v.stock ?? 0),
      imageUrl: v.imageUrl ?? "",
      isActive: v.isActive !== false,
    });
  };

  const saveEdit = async (v) => {
    setBusy(true);
    try {
      await api(`/admin/products/${id}/variants/${v.id}`, {
        method: "PUT",
        body: toPayload(editForm, v.optionValueIds ?? []),
      });
      setEditingId(null);
      await loadVariants();
      toast.success("Varyant güncellendi");
    } catch (err) {
      toast.error(err.detail || "Güncelleme başarısız");
    } finally {
      setBusy(false);
    }
  };

  // Eksik kombinasyonları stok 0 ile açar — sonra tek tek stok girilir
  const generateMissing = async () => {
    setBusy(true);
    let ok = 0;
    let fail = 0;
    for (const combo of missingCombos) {
      try {
        await api(`/admin/products/${id}/variants`, {
          method: "POST",
          body: { sku: null, price: null, stock: 0, imageUrl: null, isActive: true, optionValueIds: combo },
        });
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    await loadVariants();
    setBusy(false);
    toast[fail ? "info" : "success"](
      `${ok} varyant oluşturuldu${fail ? `, ${fail} hata` : ""}`
    );
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="rounded-base bg-danger-soft px-4 py-3 text-sm font-medium text-danger">{error}</p>
        <Link href="/admin/products" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
          ‹ Ürünlere dön
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-ink-soft">
            <Link href="/admin" className="hover:text-ink">Admin</Link>
            <span>›</span>
            <Link href="/admin/products" className="hover:text-ink">Ürünler</Link>
            <span>›</span>
            <span className="font-medium text-ink">Varyantlar</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Seçenek ve Varyantlar</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {product?.title} (#{id}) — varyant tanımlanmazsa ürün, kendi stok ve fiyatıyla satılır.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/products/${id}/edit`}>Ürünü Düzenle</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/products">Geri</Link>
          </Button>
        </div>
      </div>

      {/* ── Eksenler ─────────────────────────────────────────────────────── */}
      <section className="mb-6 rounded-base border border-line bg-surface-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Seçenekler</h2>
        <p className="mb-4 mt-1 text-sm text-ink-soft">
          Örn. Beden → S, M, L · Renk → Siyah, Kırmızı
        </p>

        {options.length === 0 ? (
          <p className="mb-4 rounded-base bg-surface px-4 py-3 text-sm text-ink-soft">
            Henüz seçenek yok. Aşağıdan ilk ekseni ekleyin.
          </p>
        ) : (
          <ul className="mb-4 space-y-3">
            {options.map((option) => (
              <li key={option.id} className="rounded-base border border-line p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-ink">{option.name}</span>
                  <button
                    type="button"
                    onClick={() => setConfirm({ kind: "option", id: option.id, label: option.name })}
                    className="text-xs font-medium text-danger hover:underline"
                  >
                    Ekseni sil
                  </button>
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {(option.values ?? []).map((v) => (
                    <span
                      key={v.id}
                      className="inline-flex items-center gap-1.5 rounded-base border border-line bg-surface px-2.5 py-1 text-sm text-ink"
                    >
                      {v.value}
                      <button
                        type="button"
                        onClick={() => setConfirm({ kind: "value", id: v.id, label: `${option.name}: ${v.value}` })}
                        aria-label={`${v.value} değerini sil`}
                        className="text-ink-soft hover:text-danger"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {(option.values?.length ?? 0) === 0 && (
                    <span className="text-xs text-ink-soft">Değer yok</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    value={valueDraft[option.id] ?? ""}
                    onChange={(e) => setValueDraft((s) => ({ ...s, [option.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addValue(option.id)}
                    placeholder="Yeni değer"
                    className={`${inputCls} w-48`}
                  />
                  <Button size="sm" variant="secondary" onClick={() => addValue(option.id)} disabled={busy}>
                    Değer Ekle
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-end gap-3 border-t border-line pt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Eksen adı</label>
            <input
              value={optionName}
              onChange={(e) => setOptionName(e.target.value)}
              placeholder="Beden"
              className={`${inputCls} w-40`}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Değerler (virgülle)</label>
            <input
              value={optionValues}
              onChange={(e) => setOptionValues(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addOption()}
              placeholder="S, M, L"
              className={`${inputCls} w-full`}
            />
          </div>
          <Button size="md" onClick={addOption} loading={busy} disabled={!optionName.trim()}>
            Eksen Ekle
          </Button>
        </div>
      </section>

      {/* ── Varyantlar ───────────────────────────────────────────────────── */}
      <section className="rounded-base border border-line bg-surface-card p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Varyantlar</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Fiyat boş bırakılırsa ürün fiyatı ({formatPrice(product?.price ?? 0)}) geçerlidir.
            </p>
          </div>
          {missingCombos.length > 0 && (
            <Button size="sm" variant="secondary" onClick={generateMissing} loading={busy}>
              Eksik {missingCombos.length} kombinasyonu oluştur
            </Button>
          )}
        </div>

        {options.length === 0 ? (
          <p className="rounded-base bg-surface px-4 py-3 text-sm text-ink-soft">
            Varyant tanımlamak için önce en az bir seçenek ekseni ekleyin.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    {["Kombinasyon", "SKU", "Fiyat", "Stok", "Durum", "İşlemler"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {variants.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm text-ink-soft">
                        Henüz varyant yok.
                      </td>
                    </tr>
                  )}
                  {variants.map((v) =>
                    editingId === v.id ? (
                      <tr key={v.id} className="bg-surface">
                        <td className="px-4 py-3 text-sm font-medium text-ink">{labelOf(v)}</td>
                        <td className="px-4 py-3">
                          <input
                            value={editForm.sku}
                            onChange={(e) => setEditForm((s) => ({ ...s, sku: e.target.value }))}
                            className={`${inputCls} w-28`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editForm.price}
                            onChange={(e) => setEditForm((s) => ({ ...s, price: e.target.value }))}
                            placeholder="Ürün fiyatı"
                            className={`${inputCls} w-28`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={editForm.stock}
                            onChange={(e) => setEditForm((s) => ({ ...s, stock: e.target.value }))}
                            className={`${inputCls} w-20`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <label className="flex items-center gap-2 text-sm text-ink">
                            <input
                              type="checkbox"
                              checked={editForm.isActive}
                              onChange={(e) => setEditForm((s) => ({ ...s, isActive: e.target.checked }))}
                            />
                            Aktif
                          </label>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={() => saveEdit(v)} loading={busy}>
                              Kaydet
                            </Button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="text-xs font-medium text-ink-soft hover:text-ink"
                            >
                              Vazgeç
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={v.id} className="hover:bg-surface">
                        <td className="px-4 py-3 text-sm font-medium text-ink">{labelOf(v)}</td>
                        <td className="px-4 py-3 text-sm text-ink-soft">{v.sku || "—"}</td>
                        <td className="px-4 py-3 text-sm text-ink">
                          {v.price == null ? (
                            <span className="text-ink-soft">Ürün fiyatı</span>
                          ) : (
                            formatPrice(v.price)
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-ink">
                          {v.stock === 0 ? <span className="text-danger">0</span> : v.stock}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                              v.isActive !== false
                                ? "bg-success/10 text-success"
                                : "bg-surface text-ink-soft"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                v.isActive !== false ? "bg-success" : "bg-ink-soft"
                              }`}
                            />
                            {v.isActive !== false ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => startEdit(v)}
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              Düzenle
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirm({ kind: "variant", id: v.id, label: labelOf(v) })}
                              className="text-xs font-medium text-danger hover:underline"
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Yeni varyant */}
            <div className="mt-5 border-t border-line pt-5">
              <h3 className="mb-3 text-sm font-semibold text-ink">Yeni Varyant</h3>
              <div className="flex flex-wrap items-end gap-3">
                {options.map((o) => (
                  <div key={o.id} className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-ink-soft">{o.name}</label>
                    <select
                      value={selection[o.id] ?? ""}
                      onChange={(e) =>
                        setSelection((s) => ({
                          ...s,
                          [o.id]: e.target.value === "" ? undefined : Number(e.target.value),
                        }))
                      }
                      className={`${inputCls} w-32`}
                    >
                      <option value="">Seçiniz</option>
                      {(o.values ?? []).map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.value}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-ink-soft">SKU</label>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
                    placeholder="opsiyonel"
                    className={`${inputCls} w-32`}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-ink-soft">Fiyat</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                    placeholder="Ürün fiyatı"
                    className={`${inputCls} w-32`}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-ink-soft">Stok</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) => setForm((s) => ({ ...s, stock: e.target.value }))}
                    className={`${inputCls} w-24`}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-xs font-medium text-ink-soft">Görsel URL</label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm((s) => ({ ...s, imageUrl: e.target.value }))}
                    placeholder="opsiyonel"
                    className={`${inputCls} w-full min-w-40`}
                  />
                </div>
                <Button onClick={createVariant} loading={busy}>
                  Varyant Ekle
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.kind === "variant" ? "Varyantı sil" : "Seçeneği sil"}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirm(null)}>
              Vazgeç
            </Button>
            <Button variant="danger" size="sm" loading={busy} onClick={doConfirm}>
              Evet, Sil
            </Button>
          </>
        }
      >
        <p>
          <strong>{confirm?.label}</strong> silinecek. Sepette veya siparişte kullanılıyorsa
          backend silmeyi reddeder — bu durumda varyantı pasife alın.
        </p>
      </Modal>
    </div>
  );
}
