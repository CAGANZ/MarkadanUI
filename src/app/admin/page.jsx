// src/app/admin/page.jsx
import Link from "next/link";

const CARDS = [
  {
    href: "/admin/products",
    icon: "📦",
    title: "Ürün Yönetimi",
    desc: "Ürün ekleme, düzenleme ve silme",
    cta: "Ürünleri Görüntüle",
  },
  {
    href: "/admin/categories",
    icon: "📂",
    title: "Kategori Yönetimi",
    desc: "Kategori ekleme, düzenleme ve silme",
    cta: "Kategorileri Görüntüle",
  },
  {
    href: "/admin/brands",
    icon: "🏷️",
    title: "Marka Yönetimi",
    desc: "Marka ekleme, düzenleme ve silme",
    cta: "Markaları Görüntüle",
  },
  {
    href: "/admin/orders",
    icon: "📋",
    title: "Sipariş Yönetimi",
    desc: "Sipariş takibi ve durum güncelleme",
    cta: "Siparişleri Görüntüle",
  },
];

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Admin Paneli</h1>
        <p className="mt-1 text-sm text-ink-soft">Markadan yönetim paneli</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex flex-col rounded-base border border-line bg-surface-card shadow-sm transition hover:shadow-md hover:border-primary"
          >
            <div className="flex-1 p-5 space-y-3">
              <span className="text-3xl">{c.icon}</span>
              <div>
                <h3 className="font-bold text-ink">{c.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{c.desc}</p>
              </div>
            </div>
            <div className="rounded-b-base border-t border-line bg-primary-soft px-5 py-2.5">
              <span className="text-sm font-semibold text-primary group-hover:underline">
                {c.cta} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
