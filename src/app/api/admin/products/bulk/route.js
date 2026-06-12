// src/app/api/admin/products/bulk/route.js
// multipart/form-data doğrudan backend'e iletilir (Content-Type header'ı tarayıcıdan gelir)
import { cookies } from "next/headers";
import { COOKIE_AT } from "@/lib/server/api";
import { passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

const BASE = (process.env.API_BASE_URL || "").replace(/\/$/, "");

export async function POST(request) {
  const store = await cookies();
  const at = store.get(COOKIE_AT)?.value;

  const formData = await request.formData();

  const res = await fetch(`${BASE}/admin/products/bulk`, {
    method: "POST",
    headers: at ? { Authorization: `Bearer ${at}` } : {},
    body: formData,
    cache: "no-store",
  });

  return passThrough(res);
}
