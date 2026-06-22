import { backendFetch, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.text();
  return passThrough(
    await backendFetch("/me/cart/coupon", { method: "POST", body: JSON.parse(body) })
  );
}

export async function DELETE() {
  return passThrough(await backendFetch("/me/cart/coupon", { method: "DELETE" }));
}
