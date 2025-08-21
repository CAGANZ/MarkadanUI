import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(_req, { params }) {
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing brand ID" }, { status: 400 });
  }

  const base = (process.env.API_BASE_URL || "").replace(/\/$/, "");
  const url = `${base}/brands/${id}`;

  try {
    const r = await fetch(url, { cache: "no-store" });

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
