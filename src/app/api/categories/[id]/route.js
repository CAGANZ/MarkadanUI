// src/app/api/categories/[id]/route.js
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { id } = await params;
  return passThrough(await backendFetch(`/categories/${id}`, { auth: false }));
}
