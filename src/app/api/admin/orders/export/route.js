import { backendFetch } from "@/lib/server/api";

export const runtime = "nodejs";

export async function GET(request) {
  const { search } = new URL(request.url);
  const res = await backendFetch(`/admin/orders/export${search}`);
  const body = await res.arrayBuffer();
  return new Response(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "text/csv; charset=utf-8",
      "Content-Disposition": res.headers.get("Content-Disposition") || `attachment; filename="siparisler.csv"`,
    },
  });
}
