"use client";
// src/app/account/wishlist/page.jsx
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/format";
import { MEDIA } from "@/lib/media";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [items, setItems] = useState(null);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/account/wishlist");
  }, [authLoading, user, router]);

  const load = useCallback(async () => {
    try {
      const data = await api("/me/wishlist");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.detail || "Favoriler yüklenemedi");
      setItems([]);
    }
  }, [toast]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const remove = async (itemId) => {
    setRemoving(itemId);
    try {
      await api(`/me/wishlist/items/${itemId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== itemId));
      toast.success("Favorilerden çıkarıldı");
    } catch (err) {
      toast.error(err.detail || "İşlem başarısız");
    } finally {
      setRemoving(null);
    }
  };

  if (authLoading || !user || items === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-4">
        <Skeleton className="h-8 w-44" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Favorilerim</h1>
          {items.length > 0 && (
            <p className="mt-1 text-sm text-ink-soft">{items.length} ürün</p>
          )}
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/account">‹ Hesabım</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-base border border-line bg-surface-card p-16 text-center">
          <p className="text-4xl mb-3">🤍</p>
          <p className="font-semibold text-ink mb-2">Henüz favori ürün eklemediniz</p>
          <p className="text-sm text-ink-soft mb-5">Beğendiğiniz ürünleri kalp ikonuna tıklayarak kaydedebilirsiniz.</p>
          <Button variant="primary" asChild>
            <Link href="/products">Ürünlere Göz At</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface-card"
            >
              <Link href={`/products/${item.productId}`} className="relative aspect-[3/4] w-full overflow-hidden bg-primary-soft">
                <Image
                  src={item.productImageUrl || MEDIA.product.src}
                  alt={item.productTitle}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <Link href={`/products/${item.productId}`} className="line-clamp-2 text-sm font-medium text-ink hover:text-primary transition-colors">
                  {item.productTitle}
                </Link>
                <p className="text-base font-bold text-ink">{formatPrice(item.productPrice)}</p>
                <button
                  onClick={() => remove(item.id)}
                  disabled={removing === item.id}
                  className="mt-auto text-xs font-medium text-danger hover:underline disabled:opacity-50 text-left"
                >
                  {removing === item.id ? "Çıkarılıyor…" : "Favoriden Çıkar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
