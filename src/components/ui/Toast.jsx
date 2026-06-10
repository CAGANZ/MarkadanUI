"use client";
// src/components/ui/Toast.jsx
// Mikro geri bildirim: sepete eklendi, kaydedildi, hata...
// Kullanım: const toast = useToast(); toast.success("Sepete eklendi");
import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

const STYLES = {
  success: "bg-success text-white",
  error: "bg-danger text-white",
  info: "bg-ink text-white",
};

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);

  const push = useCallback((type, message) => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const value = {
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Mobilde başparmak bölgesinin üstünde, masaüstünde sağ altta */}
      <div className="pointer-events-none fixed inset-x-4 bottom-20 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto max-w-sm rounded-base px-4 py-3 text-sm font-medium shadow-lg ${STYLES[t.type]}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast, ToastProvider içinde kullanılmalı");
  return ctx;
}
