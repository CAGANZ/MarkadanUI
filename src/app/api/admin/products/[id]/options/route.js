// src/app/api/admin/products/[id]/options/route.js
// Ürün opsiyon (eksen) listesi + oluşturma — T5 varyant sistemi.
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { id } = await params;
  return passThrough(await backendFetch(`/admin/products/${id}/options`));
}

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  return passThrough(
    await backendFetch(`/admin/products/${id}/options`, { method: "POST", body })
  );
}
