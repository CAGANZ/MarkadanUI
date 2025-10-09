export const dynamic = "force-dynamic";

/** Admin: kategori detayı (modalda göstermek için) */
export async function GET(_req, { params }) {
  const id = params?.id;
  const upstream = await fetch(
    `${process.env.API_BASE_URL}/admin/categories/${id}`,
    { headers: { accept: "application/json" }, cache: "no-store" }
  );

  const body = await upstream.text().catch(() => "");
  return new Response(body, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

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
    const res = await fetch(url, {
      method: "DELETE",
      headers: { accept: "application/json" },
    });

    // ProblemDetails veya plain text her ikisini de forward edelim
    const text = await res.text().catch(() => "");
    const contentType = "application/json";

    if (!res.ok) {
      return new Response(text || JSON.stringify({ message: "Silinemedi" }), {
        status: res.status,
        headers: { "content-type": contentType },
      });
    }

    return new Response(text || JSON.stringify({ success: true }), {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch (e) {
    return new Response(JSON.stringify({ message: e.message || "Sunucu hatası" }), {
      status: 500,
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
