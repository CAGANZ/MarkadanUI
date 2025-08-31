// src/components/HScrollProducts.jsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * HScrollProducts
 * - Görünürde her zaman 4 kart (yarım kart yok)
 * - Oklar her tıklamada 4 kart kaydırır
 * - Oklar büyük ve biraz dışarıda
 */
export default function HScrollProducts({ items = [] }) {
  const rowRef = useRef(null);
  const wrapRef = useRef(null);
  const [cardW, setCardW] = useState(280); // px
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const GAP = 24; // Tailwind 'gap-6' = 1.5rem = 24px
  const VISIBLE = 4;

  // Fiyat basit: "TL"
  const priceText = (n) => `${n} TL`;

  // container genişliğine göre 4 karta böl -> kart genişliğini hesapla
  const measure = () => {
    const el = rowRef.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;

    const wrapWidth = wrap.clientWidth; // içerideki max-w-7xl değil; gerçek render genişliği
    // 4 kart + 3 aralık
    const w = Math.floor((wrapWidth - GAP * (VISIBLE - 1)) / VISIBLE);
    // minimum/maximum sınırlar (gerekirse oynamak istersin)
    const clamped = Math.max(240, Math.min(w, 360));
    setCardW(clamped);

    // Kaydırılabilirlik kontrolü
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  // scroll/resize’da buton state’lerini güncelle
  const updateCanScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    measure();
    const el = rowRef.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;

    el.addEventListener("scroll", updateCanScroll, { passive: true });
    const ro = new ResizeObserver(() => measure());
    ro.observe(wrap);

    return () => {
      el.removeEventListener("scroll", updateCanScroll);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Her ok tıklamasında 4 kart + 3 gap kadar kaydır
  const scrollStep = useMemo(() => cardW * VISIBLE + GAP * (VISIBLE - 1), [cardW]);

  const scrollByX = (x) => {
    rowRef.current?.scrollBy({ left: x, behavior: "smooth" });
  };

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-neutral-200 p-6 text-neutral-700">
        Gösterilecek ürün bulunamadı.
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      {/* sol fade */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-[#FFF7E6] to-transparent" />
      {/* sağ fade */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-[#FFF7E6] to-transparent" />

      {/* Sol ok (biraz büyük ve daha dışarıda) */}
      <button
        type="button"
        onClick={() => scrollByX(-scrollStep)}
        disabled={!canLeft}
        className={[
          "absolute -left-6 top-1/2 -translate-y-1/2 z-10 rounded-full",
          "w-12 h-12 text-2xl leading-none",
          "flex items-center justify-center",
          "shadow-lg transition",
          canLeft ? "bg-amber-200/90 hover:bg-amber-300"
                  : "bg-neutral-200/70 cursor-not-allowed",
        ].join(" ")}
        aria-label="Sola kaydır"
      >
        ‹
      </button>

      {/* Sağ ok (biraz büyük ve daha dışarıda) */}
      <button
        type="button"
        onClick={() => scrollByX(scrollStep)}
        disabled={!canRight}
        className={[
          "absolute -right-6 top-1/2 -translate-y-1/2 z-10 rounded-full",
          "w-12 h-12 text-2xl leading-none",
          "flex items-center justify-center",
          "shadow-lg transition",
          canRight ? "bg-amber-200/90 hover:bg-amber-300"
                   : "bg-neutral-200/70 cursor-not-allowed",
        ].join(" ")}
        aria-label="Sağa kaydır"
      >
        ›
      </button>

      {/* Row: tam 4 kart sığacak şekilde hesaplanmış genişlikler */}
      <div
        ref={rowRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((p) => {
          const imageUrl = p.imageUrl || "https://picsum.photos/400/300";
          return (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="snap-start flex-shrink-0 group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200 transition hover:shadow-xl hover:scale-[1.02]"
              style={{ width: `${cardW}px` }}
            >
              {/* Görsel */}
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={imageUrl}
                  alt={p.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
              </div>

              {/* Bilgi */}
              <div className="flex flex-col justify-between flex-grow p-4">
                <h3 className="text-lg font-extrabold text-neutral-600 line-clamp-1">
                  {p.title}
                </h3>
                <div className="text-sm text-neutral-700">
                  <span className="font-semibold">{p.brandName}</span> •{" "}
                  <span>{p.categoryName}</span>
                </div>
                <div className="text-base font-extrabold text-neutral-900">
                  {priceText(p.price)}
                </div>
              </div>

              {/* Footer CTA */}
              <div className="mt-auto flex items-center justify-center bg-[#FFE2A7] text-neutral-900 text-sm font-bold px-3 py-2 transition group-hover:bg-[#FFD88A]">
                Detayları gör
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
