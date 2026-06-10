"use client";
// src/components/layout/HeaderActions.jsx
// Header sağ blok: hesap + sepet (rozetli). Masaüstünde görünür;
// mobilde aynı işlevi MobileNav üstlenir.
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

export default function HeaderActions() {
  const { user, loading } = useAuth();
  const { count } = useCart();

  return (
    <nav className="hidden items-center gap-4 text-sm sm:flex" aria-label="Hesap ve sepet">
      {loading ? (
        <span className="h-4 w-16 animate-pulse rounded bg-line" aria-hidden />
      ) : user ? (
        <Link href="/account" className="font-medium text-ink hover:text-accent">
          {user.name ? `Merhaba, ${user.name}` : "Hesabım"}
        </Link>
      ) : (
        <Link href="/login" className="font-medium text-ink hover:text-accent">
          Giriş Yap
        </Link>
      )}

      <Link
        href="/cart"
        className="relative font-medium text-ink hover:text-accent"
        aria-label={`Sepetim${count > 0 ? `, ${count} ürün` : ""}`}
      >
        Sepetim
        {count > 0 && (
          <span className="absolute -right-3.5 -top-2 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Link>
    </nav>
  );
}
