// src/app/api/admin/brands/route.js
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

// Admin marka listesi (admin ekranlarının select'leri de buradan beslenir)
export async function GET() {
  return passThrough(await backendFetch("/brands", { auth: false }));
}

export async function POST(request) {
  const body = await request.json();
  return passThrough(await backendFetch("/admin/brands", { method: "POST", body }));
}
