// src/components/CategoryDropdown.jsx
"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export default function CategoryDropdown({ categories = [] }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef(null);

  // Dış tıklamayla dropdown’ı kapat
  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      const panel = document.getElementById("cat-dd-panel");
      if (panel && panel.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Dropdown’un buton altına hizalanması için konum ölçümü
  const measure = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setCoords({ top: r.bottom + 8, left: r.left, width: r.width });
  };

  useLayoutEffect(() => {
    measure();
  }, []);

  useEffect(() => {
    if (!open) return;
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open]);

  return (
    <>
      {/* Tüm Kategoriler butonu */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-900 hover:bg-[#FFE9BF]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        ☰ Tüm Kategoriler
      </button>

      {/* Dropdown panel — Portal ile document.body içerisine */}
      {open &&
        createPortal(
          <div
            id="cat-dd-panel"
            role="menu"
            className="fixed z-[9999] max-h-96 overflow-auto rounded-xl border border-neutral-200 bg-white p-2 shadow-xl"
            style={{
              top: coords.top,
              left: coords.left,
              width: Math.max(coords.width, 256),
            }}
          >
            <ul className="space-y-1">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/products?categoryId=${c.id}`}
                    className="block rounded-md px-3 py-2 text-sm text-neutral-800 hover:bg-[#FFF1C9] hover:text-neutral-900"
                    onClick={() => setOpen(false)}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>            
          </div>,
          document.body
        )}
    </>
  );
}
