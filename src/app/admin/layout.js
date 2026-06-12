// src/app/admin/layout.js
// Admin bölümü: isAdmin koruması + panel navigasyonu.
// Kişisel veridir; statik üretilmez.
import Link from "next/link";
import AdminGuard from "@/components/admin/AdminGuard";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/orders", label: "Siparişler" },
  { href: "/admin/products", label: "Ürünler" },
  { href: "/admin/categories", label: "Kategoriler" },
  { href: "/admin/brands", label: "Markalar" },
  { href: "/admin/settings", label: "Ayarlar" },
];

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      {/* Panel nav */}
      <div className="border-b border-line bg-surface-card">
        <nav
          className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6"
          aria-label="Yönetim paneli"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-base px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-primary-soft hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </AdminGuard>
  );
}
