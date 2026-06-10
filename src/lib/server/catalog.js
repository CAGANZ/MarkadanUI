// src/lib/server/catalog.js
// Public katalog verisi — RSC'lerden doğrudan backend'e gider.
// revalidate: 60 → rate limit'i (60 istek/dk) korur, LCP hızlanır.
const BASE = (process.env.API_BASE_URL || "").replace(/\/$/, "");

async function catalogFetch(path) {
  // API_BASE_URL tanımsızsa geçersiz fetch build'i asabilir — hızlı düş
  if (!BASE) return null;
  try {
    const r = await fetch(`${BASE}${path}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000), // backend yanıt vermiyorsa bekletme
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null; // backend kapalıysa sayfa yine render olur
  }
}

// { total, page, pageSize, items } veya null
export function getProducts(params = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  const s = qs.toString();
  return catalogFetch(`/products${s ? `?${s}` : ""}`);
}

export const getProduct = (id) => catalogFetch(`/products/${id}`);
export const getBrands = () => catalogFetch("/brands");
export const getBrand = (id) => catalogFetch(`/brands/${id}`);
export const getCategories = () => catalogFetch("/categories");
export const getCategory = (id) => catalogFetch(`/categories/${id}`);
