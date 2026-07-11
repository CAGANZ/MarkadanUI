import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function POST() {
  return passThrough(await backendFetch("/me/cart/accept-prices", { method: "POST" }));
}
