// src/app/api/auth/register/route.js
// POST /auth/register → kayıt başarılıysa otomatik giriş yapılmış olur
// (backend LoginResultDTO döner), token'lar cookie'ye yazılır.
import { cookies } from "next/headers";
import { backendFetch, setAuthCookies, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.json();
  const res = await backendFetch("/auth/register", { method: "POST", body, auth: false });

  if (!res.ok) return passThrough(res);

  const data = await res.json(); // LoginResultDTO
  const store = await cookies();
  setAuthCookies(store, data);

  const { accessToken, refreshToken, expiresAtUtc, ...user } = data;
  return Response.json(user);
}
