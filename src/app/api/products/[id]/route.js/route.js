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
