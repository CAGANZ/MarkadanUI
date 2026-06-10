// src/app/api/auth/me/route.js
// GET /auth/me — geçerli kullanıcıyı döner.
// backendFetch 401'de otomatik refresh dener; yine 401 ise
// oturum gerçekten bitmiştir → client login'e yönlendirir.
import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function GET() {
  const res = await backendFetch("/auth/me");
  return passThrough(res);
}
