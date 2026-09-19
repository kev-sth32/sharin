import { NextResponse } from "next/server";
import { createAdminToken, COOKIE_NAME } from "@/lib/auth";
import fs from "fs";
import path from "path";

// SECURITY: File-based rate limiting — persists across server restarts / cold starts
const RATE_LIMIT_FILE = path.join(process.cwd(), ".data", "rate_limits.json");
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min

function readRateLimits(): Record<string, { count: number; last: number }> {
  try {
    const dataDir = path.join(process.cwd(), ".data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(RATE_LIMIT_FILE)) return {};
    return JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, "utf-8"));
  } catch { return {}; }
}

function writeRateLimits(data: Record<string, { count: number; last: number }>) {
  try {
    const tmp = `${RATE_LIMIT_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data));
    fs.renameSync(tmp, RATE_LIMIT_FILE);
  } catch {}
}

function getClientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
         req.headers.get("x-real-ip") || 
         "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limits = readRateLimits();
  const record = limits[ip];
  if (!record) return false;
  if (now - record.last > WINDOW_MS) {
    delete limits[ip];
    writeRateLimits(limits);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string, success: boolean) {
  if (success) {
    const limits = readRateLimits();
    delete limits[ip];
    writeRateLimits(limits);
    return;
  }
  const now = Date.now();
  const limits = readRateLimits();
  const rec = limits[ip];
  limits[ip] = rec ? { count: rec.count + 1, last: now } : { count: 1, last: now };
  writeRateLimits(limits);
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

    const correctPassword = process.env.ADMIN_PASSWORD;
    if (!correctPassword) {
      console.error("[TripNaari] ADMIN_PASSWORD env var is not set. Login is disabled.");
      return NextResponse.json({ success: false, error: "Admin login is not configured. Contact the site administrator." }, { status: 503 });
    }
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

