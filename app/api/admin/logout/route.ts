import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  res.cookies.set("tripnaari_admin", "", { maxAge: 0, path: "/" });
  return res;
}

export async function GET() {
  const res = NextResponse.redirect(new URL("/admin24639/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  res.cookies.set("tripnaari_admin", "", { maxAge: 0, path: "/" });
  return res;
}

