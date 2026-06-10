// src/app/api/products/[id]/route.js
// Public ürün detayı (auth gerekmez). Yazma işlemleri /api/admin/products altındadır.
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { id } = await params;
  return passThrough(await backendFetch(`/products/${id}`, { auth: false }));
}
