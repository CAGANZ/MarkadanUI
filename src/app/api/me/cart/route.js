// src/app/api/me/cart/route.js
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

// Aktif sepeti getir
export async function GET() {
  return passThrough(await backendFetch("/me/cart"));
}

// Sepeti tamamen boşalt
export async function DELETE() {
  return passThrough(await backendFetch("/me/cart", { method: "DELETE" }));
}
