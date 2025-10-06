import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(_req, { params }) {
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const base = (process.env.API_BASE_URL || "").replace(/\/$/, "");
  const url = `${base}/products/${id}`;

  try {
    // .NET'e isteği ilet
    const r = await fetch(url, { cache: "no-store" });

    // Hata durumunu kontrol et ve .NET'ten gelen yanıtı olduğu gibi ilet
    if (!r.ok) {
      const errorText = await r.text();
      return new NextResponse(errorText, { status: r.status, headers: r.headers });
    }

    // Başarılı durumda, veriyi JSON olarak oku ve JSON olarak geri dön
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });

  } catch (error) {
    // Beklenmeyen bir hata olursa (örneğin .NET API'si kapalıysa)
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const base = (process.env.API_BASE_URL || "").replace(/\/$/, "");
  const url = `${base}/products/${id}`;

  try {
    const body = await req.json();
    
    const response = await fetch(url, {
      method: "PUT",
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

export async function DELETE(_req, { params }) {
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const base = (process.env.API_BASE_URL || "").replace(/\/$/, "");
  const url = `${base}/products/${id}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
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

    // DELETE işlemi genellikle boş response döner
    return new NextResponse(null, { status: response.status });

  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}