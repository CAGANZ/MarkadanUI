// src/components/HorizontalScroller.jsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Generic yatay scroller
 * - Her zaman VISIBLE kadar kartı eksiksiz gösterir (default 4)
 * - Oklar tıklandığında bir "sayfa" (VISIBLE adet) kaydırır
 * - Oklar iri ve biraz dışarıda konumlandırılmıştır
 * - Çocukları kendi sabit genişlikli wrapper'ına alır
 */
export default function HorizontalScroller({
  children,
  visible = 4,
  gapPx = 24,            // Tailwind gap-6 = 24px
  minCardPx = 240,
  maxCardPx = 360,
  bgFadeColor = "#FFF7E6" // sayfanın krem zeminine uyum
}) {
  const rowRef = useRef(null);
  const wrapRef = useRef(null);
  const [cardW, setCardW] = useState(280);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const measure = () => {
    const el = rowRef.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;

    const wrapWidth = wrap.clientWidth;
    const w = Math.floor((wrapWidth - gapPx * (visible - 1)) / visible);
    const clamped = Math.max(minCardPx, Math.min(w, maxCardPx));
    setCardW(clamped);

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  const onScrollChange = () => {
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
    el.addEventListener("scroll", onScrollChange, { passive: true });
    const ro = new ResizeObserver(() => measure());
    ro.observe(wrap);
    return () => {
      el.removeEventListener("scroll", onScrollChange);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollStep = useMemo(
    () => cardW * visible + gapPx * (visible - 1),
    [cardW, visible, gapPx]
  );

  const scrollByX = (x) => rowRef.current?.scrollBy({ left: x, behavior: "smooth" });

  // children -> wrapped children (sabit genişlik)
  const wrapped = Array.isArray(children) ? children : [children];

  return (
    <div ref={wrapRef} className="relative">
      {/* sol/sağ fade maskeleri */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-10"
        style={{ background: `linear-gradient(90deg, ${bgFadeColor} 0%, transparent 100%)` }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-10"
        style={{ background: `linear-gradient(270deg, ${bgFadeColor} 0%, transparent 100%)` }}
      />

      {/* Sol ok */}
      <button
        type="button"
        onClick={() => scrollByX(-scrollStep)}
        disabled={!canLeft}
        className={[
          "absolute -left-6 top-1/2 -translate-y-1/2 z-10 rounded-full",
          "w-12 h-12 text-2xl leading-none flex items-center justify-center",
          "shadow-lg transition",
          canLeft ? "bg-amber-300 hover:bg-amber-500" : "bg-neutral-200/70 cursor-not-allowed",
        ].join(" ")}
        aria-label="Sola kaydır"
      >
        ‹
      </button>

      {/* Sağ ok */}
      <button
        type="button"
        onClick={() => scrollByX(scrollStep)}
        disabled={!canRight}
        className={[
          "absolute -right-6 top-1/2 -translate-y-1/2 z-10 rounded-full",
          "w-12 h-12 text-2xl leading-none flex items-center justify-center",
          "shadow-lg transition",
          canRight ? "bg-amber-200/90 hover:bg-amber-300" : "bg-neutral-200/70 cursor-not-allowed",
        ].join(" ")}
        aria-label="Sağa kaydır"
      >
        ›
      </button>

      {/* Satır */}
      <div
        ref={rowRef}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2"
        style={{ gap: `${gapPx}px`, scrollbarWidth: "none" }}
      >
        {wrapped.filter(Boolean).map((child, i) => (
          <div
            key={i}
            className="snap-start flex-shrink-0"
            style={{ width: `${cardW}px` }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
