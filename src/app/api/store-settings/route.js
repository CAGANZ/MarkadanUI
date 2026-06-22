import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function GET() {
  return passThrough(await backendFetch("/store-settings", { auth: false }));
}
