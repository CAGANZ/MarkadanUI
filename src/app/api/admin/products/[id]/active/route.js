// src/app/api/admin/products/[id]/active/route.js
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  return passThrough(await backendFetch(`/admin/products/${id}/active`, { method: "PATCH", body }));
}
