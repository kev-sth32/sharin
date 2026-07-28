import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { deleteGalleryImage } from "@/lib/admin-store";

function isAuthenticated(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  return cookie.includes("tripnaari_admin=authenticated");
}

export async function GET(req: Request) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const dataDir = path.join(process.cwd(), ".data");
    const fp = path.join(dataDir, "gallery_uploads.json");
    let images: any[] = [];
    if (fs.existsSync(fp)) {
      images = JSON.parse(fs.readFileSync(fp, "utf-8"));
    }
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const scanned = files.map(f=>{
        try {
          return { url: `/uploads/${f}`, originalName: f, uploadedAt: fs.statSync(path.join(uploadsDir, f)).mtime.toISOString() };
        } catch { return null; }
      }).filter(Boolean);
      const urls = new Set(images.map((i:any)=>i.url));
      scanned.forEach(s=>{ if(s && !urls.has(s.url)) images.push(s); });
    }
    return NextResponse.json({ images: images.reverse() });
  } catch (e: any) {
    return NextResponse.json({ images: [], error: e.message });
  }
}

export async function DELETE(req: Request) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const { url } = await req.json();
  // SECURITY: Only allow deletion within /uploads/
  if (!url || !url.startsWith("/uploads/")) {
    return NextResponse.json({ success: false, error: "Invalid path" }, { status: 400 });
  }
  const res = await deleteGalleryImage(url);
  return NextResponse.json(res);
}
