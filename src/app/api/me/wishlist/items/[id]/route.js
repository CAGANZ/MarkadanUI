import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function DELETE(request, { params }) {
  const { id } = await params;
  return passThrough(await backendFetch(`/me/wishlist/items/${id}`, { method: "DELETE" }));
}
