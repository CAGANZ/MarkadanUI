"use client";
// src/components/ui/Modal.jsx
// Genel amaçlı modal — ESC ve dışarı tıklamayla kapanır.
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Mobilde alttan kayan sayfa (bottom sheet), masaüstünde ortalanmış kart */}
      <div
        className="w-full max-w-md rounded-t-2xl bg-surface-card p-5 shadow-xl sm:rounded-base"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="mb-3 text-lg font-bold text-ink">{title}</h2>}
        <div className="text-sm text-ink-soft">{children}</div>
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
