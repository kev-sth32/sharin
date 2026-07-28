import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function isAuthenticated(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  return cookie.includes("tripnaari_admin=authenticated");
}

export async function GET(req: Request) {
  if (!isAuthenticated(req)) {
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
