// src/app/api/me/orders/[id]/cancel/route.js
// Yalnızca "Ordered" durumundaki siparişler iptal edilebilir (409 dönerse gösterilir)
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function POST(_request, { params }) {
  const { id } = await params;
  return passThrough(await backendFetch(`/me/orders/${id}/cancel`, { method: "POST" }));
}
