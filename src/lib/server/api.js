// src/lib/server/api.js
// ============================================================
// BFF → Backend fetch katmanı (yalnızca sunucuda çalışır)
// - Token'lar httpOnly cookie'de tutulur, tarayıcıya hiç inmez
// - 401'de bir kez refresh dener (tek uçlu kilit — API her
//   refresh'te yeni çift verir, eski token geçersizleşir)
// ============================================================
import { cookies } from "next/headers";

const BASE = (process.env.API_BASE_URL || "").replace(/\/$/, "");

export const COOKIE_AT = "mk_at"; // access token
export const COOKIE_RT = "mk_rt"; // refresh token

const cookieBase = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

// LoginResultDTO'dan cookie'leri yazar
export function setAuthCookies(store, { accessToken, refreshToken, expiresAtUtc }) {
  const maxAge = Math.max(
    30,
    Math.floor((new Date(expiresAtUtc).getTime() - Date.now()) / 1000)
  );
  store.set(COOKIE_AT, accessToken, { ...cookieBase, maxAge });
  store.set(COOKIE_RT, refreshToken, { ...cookieBase, maxAge: 60 * 60 * 24 * 30 });
}

export function clearAuthCookies(store) {
  store.set(COOKIE_AT, "", { ...cookieBase, maxAge: 0 });
  store.set(COOKIE_RT, "", { ...cookieBase, maxAge: 0 });
}

// Refresh yarış koşulu kilidi: aynı anda gelen istekler tek refresh paylaşır
let refreshPromise = null;

function refreshTokens(refreshToken) {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * Backend'e istek atar.
 * @param {string} path        ör. "/me/cart"
 * @param {object} opts
 *   - method, body (obje — JSON'lanır), auth (varsayılan true), search (querystring)
 * @returns {Response}
 */
export async function backendFetch(path, opts = {}) {
  const { method = "GET", body, auth = true, search = "" } = opts;
  const store = await cookies();
  const at = store.get(COOKIE_AT)?.value;
  const rt = store.get(COOKIE_RT)?.value;

  const doFetch = (token) =>
    fetch(`${BASE}${path}${search}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

  let res = await doFetch(at);

  // Access token süresi dolduysa: bir kez refresh dene, isteği tekrarla
  if (res.status === 401 && auth && rt) {
    const fresh = await refreshTokens(rt);
    if (fresh?.accessToken) {
      try {
        setAuthCookies(store, fresh);
      } catch {
        // RSC içinde cookie yazılamaz — sessiz geç, istek yeni token'la sürer
      }
      res = await doFetch(fresh.accessToken);
    } else {
      // Refresh reddedildi (revoke senaryosu dahil) → oturumu temizle
      try {
        clearAuthCookies(store);
      } catch {
        // RSC içinde sessiz geç
      }
    }
  }

  return res;
}

// Backend yanıtını (ProblemDetails dahil) olduğu gibi client'a aktarır
export async function passThrough(res) {
  const text = await res.text();
  return new Response(text || null, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/json",
    },
  });
}
