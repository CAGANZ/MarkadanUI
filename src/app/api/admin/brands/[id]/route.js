// src/app/api/admin/brands/[id]/route.js
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  return passThrough(await backendFetch(`/admin/brands/${id}`, { method: "PUT", body }));
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  return passThrough(await backendFetch(`/admin/brands/${id}`, { method: "DELETE" }));
}
