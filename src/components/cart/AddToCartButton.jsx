"use client";
// src/components/cart/AddToCartButton.jsx
// Ürün detayındaki birincil aksiyon. Giriş yoksa login'e yönlendirir
// (dönüş adresi korunur). Başarıda toast + header rozeti güncellenir.
// Varyantlı üründe VariantProvider context'inden seçilen varyantı okur;
// seçim tamamlanmadan (veya stok yokken) buton kilitlidir.
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/ui/Toast";
import { useVariant } from "@/components/catalog/VariantProvider";

export default function AddToCartButton({ productId, className = "" }) {
  const { user, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const variantCtx = useVariant();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  const variantMode = variantCtx?.variantMode === true;
  const variant = variantCtx?.variant ?? null;
  const soldOut = variantMode
    ? variant
      ? (variant.stock ?? 0) === 0
      : (variantCtx?.stock ?? 0) === 0
    : false;
  const blocked = variantMode && (!variant || soldOut);

  const label = soldOut
    ? "Tükendi"
    : variantMode && !variant
      ? "Seçenekleri belirleyin"
      : "Sepete Ekle";

  const onClick = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setBusy(true);
    try {
      await addItem(productId, 1, variant?.id);
      toast.success(
        variantCtx?.label
          ? `Ürün sepetinize eklendi (${variantCtx.label})`
          : "Ürün sepetinize eklendi"
      );
    } catch (err) {
      toast.error(err.detail || "Ürün sepete eklenemedi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      size="lg"
      loading={busy}
      disabled={authLoading || blocked}
      onClick={onClick}
      className={`w-full ${className}`}
    >
      {label}
    </Button>
  );
}
