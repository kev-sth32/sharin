import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

async function isAuthenticated(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|; )\\s*${COOKIE_NAME}=([^;]*)`));
  const token = match ? decodeURIComponent(match[1]) : null;
  return token ? await verifyAdminToken(token) : false;
}

export async function GET(req: Request) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized — Admin only" }, { status: 401 });
  }
  try {
    const fp = path.join(process.cwd(), ".data", "leads.json");
    let leads: any[] = [];
    if (fs.existsSync(fp)) {
      leads = JSON.parse(fs.readFileSync(fp, "utf-8"));
    }
    return NextResponse.json({ count: leads.length, leads: leads.slice(-50).reverse() });
  } catch (e) {
    return NextResponse.json({ error: "Failed to read leads" }, { status: 500 });
  }
}
