// src/app/api/admin/orders/route.js
// Filtreli liste: ?status=&dateFrom=&dateTo=
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function GET(request) {
  const search = new URL(request.url).search || "";
  return passThrough(await backendFetch("/admin/orders", { search }));
}
