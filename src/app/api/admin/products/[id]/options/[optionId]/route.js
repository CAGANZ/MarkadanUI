// src/app/api/admin/products/[id]/options/[optionId]/route.js
// Opsiyon silme — varyantta kullanılıyorsa backend 409 döner, gövde aynen aktarılır.
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function DELETE(request, { params }) {
  const { id, optionId } = await params;
  return passThrough(
    await backendFetch(`/admin/products/${id}/options/${optionId}`, { method: "DELETE" })
  );
}
