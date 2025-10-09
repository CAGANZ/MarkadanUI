export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();
  const url = `${process.env.API_BASE_URL}/admin/products${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return new Response(JSON.stringify({ error: true, status: res.status, message: text }), {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  }

  const data = await res.json();
  return Response.json(data); // { total, page, pageSize, items: [...] }
}

export async function POST(req) {
  const url = `${process.env.API_BASE_URL}/admin/products`;
  const body = await req.json(); // {title, description, price, stock, imageUrl, brandId, categoryId}
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) return new Response(await res.text(), { status: res.status });
  return Response.json(await res.json());
}