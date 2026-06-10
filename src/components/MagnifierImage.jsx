"use client";
import { useRef, useState } from "react";

/**
 * Basit büyüteç: hover sırasında görseli 2x yakınlaştırır,
 * imleci takip eden "lens" efekti verir (sınırlı, performans dostu).
 */
export default function MagnifierImage({ src, alt, className, zoom = 2 }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hover, setHover] = useState(false);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={onMove}
      className={`relative overflow-hidden rounded-2xl bg-white shadow-md border border-neutral-200 ${className || ""}`}
      style={{ aspectRatio: "4 / 3" }}
    >
      {/* Normal görüntü */}
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${hover ? "opacity-0" : "opacity-100"}`}
        loading="lazy"
      />

      {/* Yakınlaştırılmış arka plan */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 ${hover ? "opacity-100" : "opacity-0"}`}
        style={{
          backgroundImage: `url(${src})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${zoom * 100}% ${zoom * 100}%`,
          backgroundPosition: `${pos.x}% ${pos.y}%`,
        }}
      />

      {/* Lens göstergesi */}
      {hover && (
        <div
          className="pointer-events-none absolute h-24 w-24 rounded-full border-2 border-white/70 shadow-[0_0_0_2px_rgba(0,0,0,0.2)]"
          style={{
            left: `calc(${pos.x}% - 3rem)`,
            top: `calc(${pos.y}% - 3rem)`,
          }}
        />
      )}
    </div>
  );
}
