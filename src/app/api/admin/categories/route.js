// src/app/api/admin/categories/route.js
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function GET() {
  return passThrough(await backendFetch("/categories", { auth: false }));
}

export async function POST(request) {
  const body = await request.json();
  return passThrough(await backendFetch("/admin/categories", { method: "POST", body }));
}
