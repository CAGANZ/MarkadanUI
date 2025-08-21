import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const base = (process.env.API_BASE_URL || "").replace(/\/$/, "");

  try {
    const r = await fetch(`${base}/categories`, { cache: "no-store" });

    if (!r.ok) {
      const errorText = await r.text();
      return new NextResponse(errorText, { status: r.status, headers: r.headers });
    }

    const data = await r.json();
    return NextResponse.json(data, { status: r.status });

  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
