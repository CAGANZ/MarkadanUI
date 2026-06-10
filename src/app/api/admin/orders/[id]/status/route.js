// src/app/api/admin/orders/[id]/status/route.js
// { status: "Ordered" | "Cancelled" } — Active'e geçiş backend'de her zaman 409
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  return passThrough(
    await backendFetch(`/admin/orders/${id}/status`, { method: "PUT", body })
  );
}
