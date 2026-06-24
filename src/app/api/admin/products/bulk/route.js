// src/app/api/admin/products/bulk/route.js
// CSV toplu ürün yükleme proxy'si. Backend rol/parse kontrolü ASIL otoritedir;
// buradaki kapılar defense-in-depth (boyut / uzantı / auth ön-kontrolü).
import { cookies } from "next/headers";
import { COOKIE_AT, passThrough } from "@/lib/server/api";

export const runtime = "nodejs";

const BASE = (process.env.API_BASE_URL || "").replace(/\/$/, "");
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  "text/csv",
  "application/vnd.ms-excel",
  "application/csv",
  "text/plain",
  "application/octet-stream", // bazı tarayıcılar .csv'yi böyle gönderir
]);

function err(detail, status) {
  return Response.json({ detail }, { status });
}

export async function POST(request) {
  const store = await cookies();
  const at = store.get(COOKIE_AT)?.value;
  if (!at) return err("Oturum gerekli", 401);

  // Gövdeyi belleğe almadan önce boyut ön-kontrolü (DoS koruması)
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared && declared > MAX_BYTES) {
    return err("Dosya çok büyük (maksimum 10 MB)", 413);
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return err("Geçersiz form verisi", 400);
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") return err("Dosya bulunamadı", 400);
  if (file.size > MAX_BYTES) return err("Dosya çok büyük (maksimum 10 MB)", 413);
  if (file.size === 0) return err("Dosya boş", 400);

  const name = (file.name || "").toLowerCase();
  const type = (file.type || "").toLowerCase();
  if (!name.endsWith(".csv")) return err("Yalnızca .csv dosyaları kabul edilir", 415);
  if (type && !ALLOWED_TYPES.has(type)) return err("Geçersiz dosya tipi", 415);

  const res = await fetch(`${BASE}/admin/products/bulk`, {
    method: "POST",
    headers: { Authorization: `Bearer ${at}` },
    body: formData,
    cache: "no-store",
  });

  return passThrough(res);
}
