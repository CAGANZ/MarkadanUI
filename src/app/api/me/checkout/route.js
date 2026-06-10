// src/app/api/me/checkout/route.js
// 409 senaryoları (sepet boş / fiyat değişti / stok yok) ProblemDetails
// olarak aynen geçer; client senaryo bazlı ele alır.
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.json(); // { addressId }
  return passThrough(await backendFetch("/me/checkout", { method: "POST", body }));
}
