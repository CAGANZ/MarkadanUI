import { NextResponse } from "next/server";
const API = process.env.API_BASE_URL;

export async function GET(req) {
  const qs = new URL(req.url).search || "";
  const r = await fetch(`${API}/products${qs}`, { cache: "no-store" });
  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}