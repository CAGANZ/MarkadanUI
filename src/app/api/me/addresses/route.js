// src/app/api/me/addresses/route.js
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function GET() {
  return passThrough(await backendFetch("/me/addresses"));
}

export async function POST(request) {
  const body = await request.json();
  return passThrough(await backendFetch("/me/addresses", { method: "POST", body }));
}
