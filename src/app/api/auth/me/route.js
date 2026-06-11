// src/app/api/auth/me/route.js
// GET /auth/me — geçerli kullanıcıyı döner.
// Backend /auth/me isAdmin dönmediği için JWT'den role claim'i okuyarak ekliyoruz.
import { cookies } from "next/headers";
import { backendFetch, COOKIE_AT } from "@/lib/server/api";

export const runtime = "nodejs";

function isAdminFromToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    return role === "Admin" || (Array.isArray(role) && role.includes("Admin"));
  } catch {
    return false;
  }
}

export async function GET() {
  const res = await backendFetch("/auth/me");
  if (!res.ok) return res;

  const data = await res.json();
  const store = await cookies();
  const token = store.get(COOKIE_AT)?.value ?? "";
  const isAdmin = isAdminFromToken(token);

  return Response.json({ ...data, isAdmin });
}
