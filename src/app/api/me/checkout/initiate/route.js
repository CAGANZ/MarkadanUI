// src/app/api/me/checkout/initiate/route.js
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.json(); // { addressId }
  return passThrough(await backendFetch("/me/checkout/initiate", { method: "POST", body }));
}
