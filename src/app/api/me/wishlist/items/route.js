import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.json();
  return passThrough(await backendFetch("/me/wishlist/items", { method: "POST", body }));
}
