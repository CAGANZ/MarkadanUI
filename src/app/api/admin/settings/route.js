import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function GET() {
  return passThrough(await backendFetch("/admin/settings"));
}

export async function PUT(request) {
  const body = await request.json();
  return passThrough(
    await backendFetch("/admin/settings", { method: "PUT", body })
  );
}
