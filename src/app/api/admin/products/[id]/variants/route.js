// src/app/api/admin/products/[id]/variants/route.js
// Varyant listesi + oluşturma.
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { id } = await params;
  return passThrough(await backendFetch(`/admin/products/${id}/variants`));
}

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  return passThrough(
    await backendFetch(`/admin/products/${id}/variants`, { method: "POST", body })
  );
}
