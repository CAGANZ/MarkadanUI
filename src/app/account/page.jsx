"use client";
// src/app/account/page.jsx
// Hesabım — profil özeti, sipariş/adres kısayolları, çıkış.
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

function Row({ href, title, desc }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-base border border-line bg-surface-card p-4 transition-shadow hover:shadow-md"
    >
      <div>
        <div className="font-semibold text-ink">{title}</div>
        <div className="text-sm text-ink-soft">{desc}</div>
      </div>
      <span aria-hidden className="text-xl text-ink-soft">›</span>
    </Link>
  );
}

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Oturum yoksa login'e gönder
  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/account");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const onLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink">
        Merhaba, {user.name} {user.surname}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">{user.email}</p>

      <div className="mt-6 flex flex-col gap-3">
        <Row href="/account/orders" title="Siparişlerim" desc="Geçmiş siparişlerinizi görüntüleyin ve takip edin" />
        <Row href="/account/addresses" title="Adreslerim" desc="Teslimat adreslerinizi yönetin" />
        <Row href="/account/wishlist" title="Favorilerim" desc="Beğendiğiniz ürünleri kaydedin" />
        <Row href="/cart" title="Sepetim" desc="Sepetinizdeki ürünleri görüntüleyin" />
        {user.isAdmin && (
          <Row href="/admin" title="Yönetim Paneli" desc="Ürün, kategori ve sipariş yönetimi" />
        )}
      </div>

      <div className="mt-8">
        <Button variant="secondary" onClick={onLogout}>
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
}
