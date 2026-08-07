// src/app/api/admin/products/[id]/variants/[variantId]/route.js
// Varyant tam güncelleme / silme — sepette veya siparişte kullanılıyorsa backend 409 döner.
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  const { id, variantId } = await params;
  const body = await request.json();
  return passThrough(
    await backendFetch(`/admin/products/${id}/variants/${variantId}`, { method: "PUT", body })
  );
}

export async function DELETE(request, { params }) {
  const { id, variantId } = await params;
  return passThrough(
    await backendFetch(`/admin/products/${id}/variants/${variantId}`, { method: "DELETE" })
  );
}
