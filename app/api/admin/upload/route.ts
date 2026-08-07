import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function isAuthenticated(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  return cookie.includes("tripnaari_admin=authenticated");
}

export async function POST(req: Request) {
  // SECURITY: Check admin auth
  if (!isAuthenticated(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized — Admin login required" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No file" }, { status: 400 });
    }

    // SECURITY: Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Only JPG, PNG, WebP, GIF, PDF allowed" }, { status: 400 });
    }

    // SECURITY: Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File too large — max 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    // SECURITY: Sanitize filename
    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"];
    const safeExt = allowedExts.includes(ext) ? ext : ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${safeExt}`;
    const filepath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filepath, buffer);

    // Track upload
    const dataDir = path.join(process.cwd(), ".data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const galleryFile = path.join(dataDir, "gallery_uploads.json");
    let gallery: any[] = [];
    if (fs.existsSync(galleryFile)) {
      try { gallery = JSON.parse(fs.readFileSync(galleryFile, "utf-8")); } catch {}
    }
    gallery.push({ id: Date.now(), url: `/uploads/${filename}`, originalName: file.name, size: file.size, type: file.type, uploadedAt: new Date().toISOString() });
    fs.writeFileSync(galleryFile, JSON.stringify(gallery, null, 2));

    return NextResponse.json({ success: true, url: `/uploads/${filename}`, filename });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
