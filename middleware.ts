import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// CHANGE: RENAME FUNCTION NAME FROM proxy TO middleware
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin and /api/admin (except /admin/login and /api/admin/login)
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname.startsWith("/api/admin/");
  const isLoginPath = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login" || pathname === "/api/admin/logout";

  if ((isAdminPath && !isLoginPath) || (isAdminApi && !isLoginApi)) {
    const auth = req.cookies.get("tripnaari_admin")?.value;
    if (auth !== "authenticated") {
      if (isAdminApi) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already authenticated and trying to access login, redirect to dashboard
  if (isLoginPath) {
    const auth = req.cookies.get("tripnaari_admin")?.value;
    if (auth === "authenticated") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // Security headers for all admin
  const response = NextResponse.next();
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    response.headers.set("X-Robust-Admin", "TripNaari-Secure");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }
  
  // Prevent .data exposure
  if (pathname.includes(".data") || pathname.includes(".env")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
