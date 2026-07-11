"use client";
// src/hooks/useCart.jsx
// Sepet context'i. Giriş yoksa sepet null'dur; sepete ekleme
// denemesi login'e yönlendirilir (bileşen tarafında).
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/client/api";
import { useAuth } from "@/hooks/useAuth";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null); // CartDTO veya null
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      setCart(await api("/me/cart"));
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Ürün ekle / miktar artır — başarılıysa sepeti tazeler
  const addItem = useCallback(
    async (productId, quantity = 1) => {
      await api("/me/cart/items", { method: "POST", body: { productId, quantity } });
      await reload();
    },
    [reload]
  );

  // Miktar değiştir (0 → satır silinir)
  const updateItem = useCallback(
    async (itemId, quantity) => {
      await api(`/me/cart/items/${itemId}`, { method: "PUT", body: { quantity } });
      await reload();
    },
    [reload]
  );

  const removeItem = useCallback(
    async (itemId) => {
      await api(`/me/cart/items/${itemId}`, { method: "DELETE" });
      await reload();
    },
    [reload]
  );

  const clear = useCallback(async () => {
    await api("/me/cart", { method: "DELETE" });
    await reload();
  }, [reload]);

  // Fiyat değişikliklerini onayla: tüm satırların snapshot fiyatını güncel fiyata eşitler.
  const acceptPriceChanges = useCallback(async () => {
    setCart(await api("/me/cart/accept-prices", { method: "POST" }));
  }, []);

  const applyCoupon = useCallback(
    async (code) => {
      const data = await api("/me/cart/coupon", { method: "POST", body: { code } });
      setCart(data);
    },
    []
  );

  const removeCoupon = useCallback(async () => {
    const data = await api("/me/cart/coupon", { method: "DELETE" });
    setCart(data);
  }, []);

  const count = cart?.items?.reduce((acc, it) => acc + it.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        count,
        loading,
        reload,
        addItem,
        updateItem,
        removeItem,
        clear,
        acceptPriceChanges,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart, CartProvider içinde kullanılmalı");
  return ctx;
}
