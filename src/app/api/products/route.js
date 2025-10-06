import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req) {
  const base = (process.env.API_BASE_URL || "").replace(/\/$/, "");
  const qs = new URL(req.url).search || "";

  try {
    const r = await fetch(`${base}/products${qs}`, { cache: "no-store" });

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

export async function POST(req) {
  const base = (process.env.API_BASE_URL || "").replace(/\/$/, "");
  
  try {
    const body = await req.json();
    
    const response = await fetch(`${base}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(errorText, {
        status: response.status,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}