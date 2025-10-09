

export const dynamic = "force-dynamic";

export async function GET() {
  const upstream = await fetch(`${process.env.API_BASE_URL}/brands`, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  const body = await upstream.text().catch(() => "");
  return new Response(body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}


export async function DELETE(_req, { params }) {
  const url = `${process.env.API_BASE_URL}/admin/brands/${params.id}`;
  const res = await fetch(url, { method: "DELETE", headers: { accept: "application/json" }, cache: "no-store" });
  if (!res.ok) return new Response(await res.text(), { status: res.status });
  return Response.json({ ok: true });
}