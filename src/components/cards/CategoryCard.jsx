import Link from "next/link";
import { getCategoryImageById } from "@/lib/catalogMedia";

export default function CategoryCard({ id, name, href }) {
  const to = href || `/categories/${id}`;
  const img = getCategoryImageById(id); // ← ID tabanlı ortak kaynak

  return (
    <Link
      href={to}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200 transition hover:shadow-xl hover:scale-[1.02]"
    >
      <div className="relative aspect-[4/3] w-full">
        <img
          src={img}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        <h3 className="absolute bottom-3 left-3 text-lg font-bold text-white drop-shadow-md">
          {name}
        </h3>
      </div>

      <div className="mt-auto flex items-center justify-center bg-[#FFE2A7] text-neutral-900 text-sm font-bold px-3 py-2 transition group-hover:bg-[#FFD88A]">
        Ürünleri gör →
      </div>
    </Link>
  );
}
