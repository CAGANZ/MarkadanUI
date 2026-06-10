// src/app/api/me/cart/items/route.js
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

// Ürün ekle / miktar artır — { productId, quantity }
export async function POST(request) {
  const body = await request.json();
  return passThrough(await backendFetch("/me/cart/items", { method: "POST", body }));
}
