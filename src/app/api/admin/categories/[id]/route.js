export const dynamic = "force-dynamic";

export async function DELETE(_req, { params }) {
  const id = params?.id;
  if (!id) {
    return new Response(JSON.stringify({ message: "id gerekli" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const url = `${process.env.API_BASE_URL}/admin/categories/${id}`;

  try {
    const upstream = await fetch(url, {
      method: "DELETE",
      headers: { accept: "application/json" },
    });

    // Başarılı: 204 ise gövde yok
    if (upstream.status === 204) {
      return new Response(null, { status: 204 });
    }

    const ct = upstream.headers.get("content-type") || "";
    const text = await upstream.text().catch(() => "");

    // JSON ise JSON olarak ilet; değilse düz ilet
    if (ct.includes("application/json")) {
      return new Response(text, {
        status: upstream.status,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(text, { status: upstream.status });
  } catch (e) {
    return new Response(JSON.stringify({ message: e.message || "Upstream error" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function PUT(req, { params }) {
  const id = params?.id;
  if (!id) {
    return new Response(JSON.stringify({ message: "id gerekli" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const base = (process.env.API_BASE_URL || "").replace(/\/$/, "");
  const url = `${base}/admin/categories/${id}`;

  let body = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  try {
    const upstream = await fetch(url, {
      method: "PUT",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: body ? JSON.stringify(body) : "{}",
      cache: "no-store",
    });

    // ProblemDetails veya boş gövde dönebilir; metni aynen geçir
    const text = await upstream.text().catch(() => "");
    const status = upstream.status || 200;
    const contentType =
      upstream.headers.get("content-type") || "application/json; charset=utf-8";

    return new Response(text, { status, headers: { "content-type": contentType } });
  } catch (e) {
    return new Response(JSON.stringify({ message: e.message || "Sunucu hatası" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
