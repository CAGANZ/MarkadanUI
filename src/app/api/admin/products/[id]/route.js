// src/app/api/admin/products/[id]/route.js
export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const url = `${process.env.API_BASE_URL}/admin/products/${params.id}`;
  const res = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
  if (!res.ok) return new Response(await res.text(), { status: res.status });
  return Response.json(await res.json());
}

export async function PUT(req, { params }) {
  const url = `${process.env.API_BASE_URL}/admin/products/${params.id}`;
  const body = await req.json(); // sadece gelen alanlar forward edilecek
  const res = await fetch(url, {
    method: "PUT",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) return new Response(await res.text(), { status: res.status });
  return Response.json(await res.json());
}

export async function DELETE(_req, { params }) {
  const url = `${process.env.API_BASE_URL}/admin/products/${params.id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return new Response(await res.text(), { status: res.status });
  // çoğu API boş döner; biz sade bir json dönelim
  return Response.json({ ok: true });
}
