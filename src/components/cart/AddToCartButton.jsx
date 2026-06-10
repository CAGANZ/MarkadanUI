"use client";
// src/components/cart/AddToCartButton.jsx
// Ürün detayındaki birincil aksiyon. Giriş yoksa login'e yönlendirir
// (dönüş adresi korunur). Başarıda toast + header rozeti güncellenir.
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/ui/Toast";

export default function AddToCartButton({ productId, className = "" }) {
  const { user, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setBusy(true);
    try {
      await addItem(productId, 1);
      toast.success("Ürün sepetinize eklendi");
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
      disabled={authLoading}
      onClick={onClick}
      className={`w-full ${className}`}
    >
      Sepete Ekle
    </Button>
  );
}
