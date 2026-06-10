"use client";
// src/components/layout/MobileNav.jsx
// Mobil alt navigasyon — başparmak bölgesinde 4 ana sekme.
// Yükseklik: h-14 (56px). Sayfa altı sabit elemanlar bottom-14 üstüne konur.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

function Tab({ href, label, active, badge, icon }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium ${
        active ? "text-accent" : "text-ink-soft"
      }`}
    >
      <span aria-hidden className="text-xl leading-none">{icon}</span>
      {label}
      {badge > 0 && (
        <span className="absolute right-[22%] top-0.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { count } = useCart();

  // Admin sayfalarında müşteri navı gösterilmez
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex h-14 border-t border-line bg-surface-card/95 backdrop-blur sm:hidden"
      aria-label="Ana gezinme"
    >
      <Tab href="/" label="Ana Sayfa" icon="⌂" active={pathname === "/"} />
      <Tab
        href="/products"
        label="Ürünler"
        icon="◫"
        active={pathname.startsWith("/products")}
      />
      <Tab
        href="/cart"
        label="Sepet"
        icon="🛒"
        badge={count}
        active={pathname.startsWith("/cart")}
      />
      <Tab
        href={user ? "/account" : "/login"}
        label={user ? "Hesabım" : "Giriş"}
        icon="👤"
        active={pathname.startsWith("/account") || pathname.startsWith("/login")}
      />
    </nav>
  );
}
