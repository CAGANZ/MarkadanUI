// src/app/api/admin/products/[id]/options/[optionId]/values/route.js
// Opsiyona değer ekleme ("M", "Kırmızı" vb.).
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  const { id, optionId } = await params;
  const body = await request.json();
  return passThrough(
    await backendFetch(`/admin/products/${id}/options/${optionId}/values`, {
      method: "POST",
      body,
    })
  );
}
