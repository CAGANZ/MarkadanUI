// src/app/api/auth/logout/route.js
// Oturum cookie'lerini temizler. Backend'de logout ucu yok;
// token'lar süresi dolunca geçersizleşir.
import { cookies } from "next/headers";
import { clearAuthCookies } from "@/lib/server/api";

export const runtime = "nodejs";

export async function POST() {
  const store = await cookies();
  clearAuthCookies(store);
  return new Response(null, { status: 204 });
}
