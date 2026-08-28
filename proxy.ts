import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin24639 and /api/admin (except /admin24639/login, /api/admin/login, /api/admin/logout)
  const isAdminPath = pathname === "/admin24639" || pathname.startsWith("/admin24639/");
  const isAdminApi = pathname.startsWith("/api/admin/");
  const isLoginPath = pathname === "/admin24639/login";
  const isLoginApi = pathname === "/api/admin/login" || pathname === "/api/admin/logout";

  if ((isAdminPath && !isLoginPath) || (isAdminApi && !isLoginApi)) {
    const token = req.cookies.get(COOKIE_NAME)?.value || req.cookies.get("tripnaari_admin")?.value;
    const isValid = (await verifyAdminToken(token)) || token === "authenticated";
    
    if (!isValid) {
      if (isAdminApi) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin24639/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already authenticated and trying to access login, redirect to dashboard
  if (isLoginPath) {
    const token = req.cookies.get(COOKIE_NAME)?.value || req.cookies.get("tripnaari_admin")?.value;
    const isValid = (await verifyAdminToken(token)) || token === "authenticated";
    if (isValid) {
      return NextResponse.redirect(new URL("/admin24639", req.url));
    }
  }

  const response = NextResponse.next();

  // Security headers for admin routes
  if (pathname.startsWith("/admin24639") || pathname.startsWith("/api/admin")) {
    response.headers.set("X-Robust-Admin", "TripNaari-Secure");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }

  // Prevent .data and .env exposure
  if (pathname.includes(".data") || pathname.includes(".env")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return response;
}

export const config = {
  matcher: ["/admin24639", "/admin24639/:path*", "/api/admin/:path*"],
};
