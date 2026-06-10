"use client";
// src/app/providers.jsx
// Client context'leri tek noktada toplar (layout RSC kalır).
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { ToastProvider } from "@/components/ui/Toast";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>{children}</ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
