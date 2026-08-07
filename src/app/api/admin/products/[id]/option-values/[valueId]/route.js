// src/app/api/admin/products/[id]/option-values/[valueId]/route.js
// Opsiyon değeri silme — varyantta kullanılıyorsa backend 409 döner.
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function DELETE(request, { params }) {
  const { id, valueId } = await params;
  return passThrough(
    await backendFetch(`/admin/products/${id}/option-values/${valueId}`, { method: "DELETE" })
  );
}
