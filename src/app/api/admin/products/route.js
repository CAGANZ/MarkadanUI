// src/app/api/admin/products/route.js
// Admin ürün listesi (stok dahil) + yeni ürün. Token cookie'den Bearer'a çevrilir.
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function GET(request) {
  const search = new URL(request.url).search || "";
  return passThrough(await backendFetch("/admin/products", { search }));
}

export async function POST(request) {
  const body = await request.json();
  return passThrough(await backendFetch("/admin/products", { method: "POST", body }));
}
