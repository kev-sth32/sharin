import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("tripnaari_admin", "", { maxAge: 0, path: "/" });
  return res;
}

export async function GET() {
  const res = NextResponse.redirect(new URL("/admin24639/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  res.cookies.set("tripnaari_admin", "", { maxAge: 0, path: "/" });
  return res;
}
