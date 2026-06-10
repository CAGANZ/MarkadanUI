// src/app/api/brands/route.js
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function GET() {
  return passThrough(await backendFetch("/brands", { auth: false }));
}
