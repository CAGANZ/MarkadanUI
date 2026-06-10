// src/lib/client/api.js
// Tarayıcı → BFF fetch sarmalayıcısı.
// Hataları ApiError'a çevirir; bileşenler err.detail'i doğrudan gösterebilir.
import { toApiError } from "@/lib/api-error";

/**
 * @param {string} path  BFF yolu, ör. "/me/cart" → /api/me/cart
 * @param {object} opts  { method, body }
 * @returns {Promise<any>} JSON gövde (204'te null)
 * @throws {ApiError}
 */
export async function api(path, opts = {}) {
  const { method = "GET", body } = opts;

  const res = await fetch(`/api${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) throw toApiError(res.status, data);
  return data;
}
