import { NextResponse } from "next/server";
import { createAdminToken, COOKIE_NAME } from "@/lib/auth";

// SECURITY: Simple in-memory rate limiting (per IP)
const attempts = new Map<string, { count: number; last: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min

function getClientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
         req.headers.get("x-real-ip") || 
         "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record) return false;
  if (now - record.last > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string, success: boolean) {
  if (success) {
    attempts.delete(ip);
    return;
  }
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec) attempts.set(ip, { count: 1, last: now });
  else attempts.set(ip, { count: rec.count + 1, last: now });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  
  if (isRateLimited(ip)) {
    return NextResponse.json({ 
      success: false, 
      error: "Too many failed attempts. Try again in 15 minutes." 
    }, { status: 429 });
  }

  try {
    const { password } = await req.json();
    
    if (!password || typeof password !== "string") {
      return NextResponse.json({ success: false, error: "Password required" }, { status: 400 });
    }

    // SECURITY: Trim and limit length
    const cleanPassword = password.trim().slice(0, 200);

    const correctPassword = process.env.ADMIN_PASSWORD || "Qwerty@2053";
    const isValid = cleanPassword === correctPassword;

    recordAttempt(ip, isValid);

    if (!isValid) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid password." 
      }, { status: 401 });
    }

    const token = await createAdminToken();
    const res = NextResponse.json({ success: true });
    
    const isSecure = req.headers.get("x-forwarded-proto") === "https" || req.url.startsWith("https:");

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true, // SECURITY: Not accessible via JS
      sameSite: "lax", // CSRF protection
      secure: isSecure,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    res.cookies.set("tripnaari_admin", "authenticated", {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecure,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    
    // SECURITY: Add security headers
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    
    return res;
  } catch (e) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}

