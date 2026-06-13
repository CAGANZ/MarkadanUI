// src/app/api/me/checkout/confirm/route.js
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.json(); // { token }
  return passThrough(await backendFetch("/me/checkout/confirm", { method: "POST", body }));
}
