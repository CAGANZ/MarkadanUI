"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

export default function WishlistButton({ productId }) {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [itemId, setItemId] = useState(null); // wishlistItem id (null = favoride değil, undefined = yükleniyor)
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) { setLoaded(true); return; }
    api("/me/wishlist")
      .then((list) => {
        const found = list?.find((x) => x.productId === productId);
        setItemId(found?.id ?? null);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [user, productId]);

  const toggle = async () => {
    if (!user) {
      router.push(`/login?next=/products/${productId}`);
      return;
    }
    setBusy(true);
    try {
      if (itemId !== null) {
        await api(`/me/wishlist/items/${itemId}`, { method: "DELETE" });
        setItemId(null);
        toast.success("Favorilerden çıkarıldı");
      } else {
        const res = await api("/me/wishlist/items", { method: "POST", body: { productId } });
        setItemId(res?.id ?? -1);
        toast.success("Favorilere eklendi");
      }
    } catch (err) {
      if (err.status === 409) {
        toast.info("Bu ürün zaten favorilerinizde");
      } else {
        toast.error(err.detail || "İşlem başarısız");
      }
    } finally {
      setBusy(false);
    }
  };

  if (!loaded) return null;

  const inWishlist = itemId !== null;

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={inWishlist ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={`flex items-center justify-center gap-1.5 rounded-base border px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
        inWishlist
          ? "border-danger bg-danger-soft text-danger hover:bg-danger/10"
          : "border-line bg-surface-card text-ink-soft hover:border-ink hover:text-ink"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 transition-colors ${inWishlist ? "fill-danger stroke-danger" : "fill-none stroke-ink-soft"}`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {inWishlist ? "Favorimde" : "Favorilere Ekle"}
    </button>
  );
}
