import { NextResponse } from "next/server";

const PROTECTED = ["/account", "/admin"];

export function middleware(request) {
  const token = request.cookies.get("mk_at")?.value;
  const { pathname } = request.nextUrl;

  // Admin BFF route'ları: kimliksiz çağrıyı erken 401 ile kes (defense-in-depth).
  // ROL kontrolü backend'in işidir; bu yalnızca token varlığı kontrolü.
  if (pathname.startsWith("/api/admin")) {
    if (!token) return NextResponse.json({ detail: "Oturum gerekli" }, { status: 401 });
    return NextResponse.next();
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/api/admin/:path*"],
};
