// src/app/api/me/cart/items/[id]/route.js
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

// Miktar değiştir — { quantity } (0 → satır silinir)
export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  return passThrough(
    await backendFetch(`/me/cart/items/${id}`, { method: "PUT", body })
  );
}

// Satırı sepetten çıkar
export async function DELETE(_request, { params }) {
  const { id } = await params;
  return passThrough(await backendFetch(`/me/cart/items/${id}`, { method: "DELETE" }));
}
