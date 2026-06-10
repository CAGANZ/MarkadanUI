"use client";
// src/hooks/useAuth.jsx
// Oturum context'i. Token tarayıcıda YOK — yalnızca /api/auth/me'den
// gelen kullanıcı bilgisi tutulur. 401 = oturum yok demektir.
import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // MeDTO veya null
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const me = await api("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const login = useCallback(async (userNameOrEmail, password) => {
    const u = await api("/auth/login", {
      method: "POST",
      body: { userNameOrEmail, password },
    });
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (form) => {
    const u = await api("/auth/register", { method: "POST", body: form });
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, reload }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth, AuthProvider içinde kullanılmalı");
  return ctx;
}
