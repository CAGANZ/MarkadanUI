// src/app/api/products/route.js
// Public ürün listesi proxy'si (filtre/arama/sayfalama querystring ile geçer).
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function GET(request) {
  const search = new URL(request.url).search || "";
  return passThrough(await backendFetch("/products", { auth: false, search }));
}
