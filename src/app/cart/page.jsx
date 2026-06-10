"use client";
// src/app/cart/page.jsx
// Sepet — iş kuralları:
//  - hasPriceChanges: true iken checkout'a İZİN VERİLMEZ (backend notu);
//    önce değişiklikler gösterilir, kullanıcı onaylayınca sepet tazelenir.
//  - Tutarlar her zaman unitPriceSnapshot üzerinden hesaplanır.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/format";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import CartLine from "@/components/cart/CartLine";

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading, reload, updateItem, removeItem, clear } = useCart();
  const router = useRouter();
  const toast = useToast();

  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/cart");
  }, [authLoading, user, router]);

  const onQuantity = async (itemId, quantity) => {
    setBusy(true);
    try {
      await updateItem(itemId, Math.max(0, quantity)); // 0 → satır silinir
    } catch (err) {
      toast.error(err.detail || "Miktar güncellenemedi");
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async (itemId) => {
    setBusy(true);
    try {
      await removeItem(itemId);
      toast.info("Ürün sepetten çıkarıldı");
    } catch (err) {
      toast.error(err.detail || "Ürün çıkarılamadı");
    } finally {
      setBusy(false);
    }
  };

  const onClear = async () => {
    setBusy(true);
    try {
      await clear();
      setConfirmClear(false);
      toast.info("Sepet boşaltıldı");
    } catch (err) {
      toast.error(err.detail || "Sepet boşaltılamadı");
    } finally {
      setBusy(false);
    }
  };

  // Fiyat değişikliklerini onayla: sepeti tazele → backend snapshot'ları günceller
  const acceptPrices = async () => {
    setBusy(true);
    try {
      await reload();
      toast.success("Güncel fiyatlar onaylandı");
    } finally {
      setBusy(false);
    }
  };

  if (authLoading || !user || (loading && !cart)) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  const items = cart?.items ?? [];
  const hasPriceChanges = cart?.hasPriceChanges === true;

  // Boş sepet — satış fırsatı
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-ink">Sepetim</h1>
        <div className="rounded-base border border-line bg-surface-card p-10 text-center">
          <p className="text-lg font-medium text-ink">Sepetiniz şu an boş.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Yeni gelen ürünlere göz atın, beğendiklerinizi sepete ekleyin.
          </p>
          <Link href="/products?sort=newest">
            <Button className="mt-5">Yeni Gelenleri Keşfet</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Sepetim <span className="text-base font-normal text-ink-soft">({items.length} ürün)</span>
        </h1>
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          className="text-sm font-semibold text-ink-soft hover:text-danger"
        >
          Sepeti Boşalt
        </button>
      </div>

      {/* Fiyat değişikliği banner'ı — checkout kilidi */}
      {hasPriceChanges && (
        <div
          role="alert"
          className="mb-4 rounded-base border border-warning/40 bg-warning-soft p-4"
        >
          <p className="font-semibold text-warning">Bazı ürünlerin fiyatı güncellendi</p>
          <p className="mt-1 text-sm text-ink-soft">
            Aşağıda işaretli ürünlerin fiyatları değişti. Siparişe devam etmek için
            güncel fiyatları onaylamanız gerekiyor.
          </p>
          <Button
            variant="accent"
            size="sm"
            className="mt-3"
            loading={busy}
            onClick={acceptPrices}
          >
            Güncel Fiyatları Onayla
          </Button>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <CartLine
            key={item.id}
            item={item}
            onQuantity={onQuantity}
            onRemove={onRemove}
            busy={busy}
          />
        ))}
      </ul>

      {/* Özet + checkout */}
      <div className="mt-6 rounded-base border border-line bg-surface-card p-4">
        <div className="flex items-center justify-between text-lg">
          <span className="font-medium text-ink">Toplam</span>
          <span className="font-extrabold text-ink">{formatPrice(cart.total)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          Tutar, ürünleri sepete eklediğiniz andaki fiyatlar üzerinden hesaplanır.
        </p>
        <Button
          size="lg"
          className="mt-4 w-full"
          disabled={hasPriceChanges || busy}
          onClick={() => router.push("/checkout")}
        >
          {hasPriceChanges ? "Önce fiyat değişikliklerini onaylayın" : "Ödemeye Geç"}
        </Button>
      </div>

      {/* Sepeti boşaltma onayı */}
      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Sepeti Boşalt"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Vazgeç
            </Button>
            <Button variant="danger" loading={busy} onClick={onClear}>
              Boşalt
            </Button>
          </>
        }
      >
        <p>Sepetinizdeki tüm ürünler çıkarılacak. Emin misiniz?</p>
      </Modal>
    </div>
  );
}
