import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import sharp from "sharp";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function extractCleanFileBuffer(rawBuffer: Buffer): Buffer {
  // Check if buffer contains PDF magic header %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
  const pdfHeaderIndex = rawBuffer.indexOf(Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]));
  if (pdfHeaderIndex !== -1) {
    const eofIndex = rawBuffer.lastIndexOf(Buffer.from([0x25, 0x25, 0x45, 0x4f, 0x46]));
    if (eofIndex !== -1 && eofIndex > pdfHeaderIndex) {
      let endPos = eofIndex + 5;
      while (endPos < rawBuffer.length && (rawBuffer[endPos] === 13 || rawBuffer[endPos] === 10 || rawBuffer[endPos] === 32)) {
        endPos++;
      }
      return rawBuffer.subarray(pdfHeaderIndex, endPos);
    }
    return rawBuffer.subarray(pdfHeaderIndex);
  }

  // Check if buffer starts with multipart header (\r\n\r\n = 13, 10, 13, 10)
  const crlfIndex = rawBuffer.indexOf(Buffer.from([13, 10, 13, 10]));
  if (crlfIndex !== -1 && crlfIndex < 1000) {
    const contentStart = crlfIndex + 4;
    const boundaryMarker = rawBuffer.indexOf(Buffer.from([13, 10, 45, 45]), contentStart);
    if (boundaryMarker !== -1) {
      return rawBuffer.subarray(contentStart, boundaryMarker);
    }
    return rawBuffer.subarray(contentStart);
  }

  return rawBuffer;
}

async function isAuthenticated(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|; )\\s*${COOKIE_NAME}=([^;]*)`));
  const token = match ? decodeURIComponent(match[1]) : null;
  if (token && (await verifyAdminToken(token))) return true;
  return cookieHeader.includes("tripnaari_admin=authenticated");
}

export async function POST(req: Request) {
  // SECURITY: Check admin auth
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ success: false, error: "Unauthorized — Admin login required" }, { status: 401 });
  }

  const reqClone = req.clone();

  try {
    let fileName = "";
    let fileType = "";
    let inputBuffer: Buffer;
    let inputSize = 0;

    try {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file || typeof file === "string") {
        throw new Error("No file field provided in FormData");
      }
      fileName = file.name || "upload";
      fileType = file.type || "";
      const inputBytes = await file.arrayBuffer();
      inputBuffer = Buffer.from(inputBytes);
      inputSize = file.size || inputBuffer.length;
    } catch (formDataError: any) {
      console.warn("[TripNaari Upload Route] req.formData() failed, attempting raw body fallback:", formDataError?.message || formDataError);
      
      const headerFilename = req.headers.get("x-filename") || req.headers.get("x-file-name");
      fileName = headerFilename ? decodeURIComponent(headerFilename) : "uploaded-file.pdf";
      fileType = req.headers.get("content-type") || "";

      const rawBytes = await reqClone.arrayBuffer();
      if (!rawBytes || rawBytes.byteLength === 0) {
        return NextResponse.json({ success: false, error: "Failed to parse body as FormData and raw request body is empty" }, { status: 400 });
      }
      inputBuffer = extractCleanFileBuffer(Buffer.from(rawBytes));
      inputSize = inputBuffer.length;
    }

    const fileExt = path.extname(fileName).toLowerCase();
    const isPdf = fileType.includes("pdf") || fileExt === ".pdf";
    const isImage = fileType.startsWith("image/") || [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(fileExt);

    // SECURITY: Validate file type by MIME or Extension
    if (!isPdf && !isImage) {
      return NextResponse.json({ success: false, error: "Only JPG, PNG, WebP, GIF, and PDF files are allowed" }, { status: 400 });
    }

    // SECURITY: Validate file size (100MB input limit)
    if (inputSize > 100 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File too large — max 100MB" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    let finalBuffer: Buffer = inputBuffer;
    let finalExt = fileExt || (isPdf ? ".pdf" : ".jpg");
    let isCompressed = false;

    // PROCESS PDF OR IMAGE
    if (isPdf) {
      finalExt = ".pdf";
      finalBuffer = inputBuffer;
      isCompressed = false;

      // Attempt Ghostscript automatic PDF compression if PDF > 2MB
      if (inputBuffer.length > 2 * 1024 * 1024) {
        try {
          const dataDir = path.join(process.cwd(), ".data");
          if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

          const tmpInputPath = path.join(dataDir, `temp-in-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.pdf`);
          const tmpOutputPath = path.join(dataDir, `temp-out-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.pdf`);

          fs.writeFileSync(tmpInputPath, inputBuffer);

          execSync(`gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${tmpOutputPath}" "${tmpInputPath}"`, {
            timeout: 30000,
          });

          if (fs.existsSync(tmpOutputPath)) {
            const compressedPdfBuf = fs.readFileSync(tmpOutputPath);
            if (compressedPdfBuf.length > 0 && compressedPdfBuf.length < inputBuffer.length) {
              finalBuffer = compressedPdfBuf;
              isCompressed = true;
              console.log(`[TripNaari Upload] Ghostscript compressed PDF ${fileName}: ${inputBuffer.length} -> ${finalBuffer.length} bytes`);
            }
            try { fs.unlinkSync(tmpOutputPath); } catch {}
          }
          try { fs.unlinkSync(tmpInputPath); } catch {}
        } catch (gsErr) {
          console.warn("[TripNaari Upload] Ghostscript compression fallback to raw PDF buffer:", gsErr);
          finalBuffer = inputBuffer;
        }
      } else {
        console.log(`[TripNaari Upload] Processed small PDF upload: ${fileName} (${inputSize} bytes)`);
      }
    } else if (isImage) {
      try {
        const imagePipeline = sharp(inputBuffer, { animated: true });

        // 1. Resize if image dimensions exceed 2400px (both width and height constrained to 2400)
        imagePipeline.resize({
          width: 2400,
          height: 2400,
          fit: "inside",
          withoutEnlargement: true,
        });

        // 2. Format specific optimization
        if (fileType === "image/png" || fileExt === ".png") {
          finalBuffer = await imagePipeline
            .png({ quality: 80, compressionLevel: 8, palette: true })
            .toBuffer();
          finalExt = ".png";
        } else if (fileType === "image/webp" || fileExt === ".webp") {
          finalBuffer = await imagePipeline
            .webp({ quality: 80, effort: 4 })
            .toBuffer();
          finalExt = ".webp";
        } else if (fileType === "image/gif" || fileExt === ".gif") {
          finalBuffer = await imagePipeline.toBuffer();
          finalExt = ".gif";
        } else {
          finalBuffer = await imagePipeline
            .jpeg({ quality: 80, progressive: true, mozjpeg: true })
            .toBuffer();
          finalExt = ".jpeg";
        }

        isCompressed = true;
        console.log(`[TripNaari Upload Compressor] Compressed image ${fileName}: ${inputSize} -> ${finalBuffer.length} bytes`);
      } catch (sharpError) {
        console.warn("[TripNaari Upload] Sharp compression fallback to raw buffer:", sharpError);
        finalBuffer = inputBuffer;
      }
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${finalExt}`;
    const filepath = path.join(uploadsDir, filename);
    
    // Atomic write to upload folder
    const tempFilepath = `${filepath}.tmp`;
    fs.writeFileSync(tempFilepath, finalBuffer);
    fs.renameSync(tempFilepath, filepath);

    // Track upload in gallery_uploads.json
    const dataDir = path.join(process.cwd(), ".data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const galleryFile = path.join(dataDir, "gallery_uploads.json");
    let gallery: any[] = [];
    if (fs.existsSync(galleryFile)) {
      try { gallery = JSON.parse(fs.readFileSync(galleryFile, "utf-8")); } catch {}
    }
    
    gallery.push({
      id: Date.now(),
      url: `/uploads/${filename}`,
      originalName: fileName,
      originalSize: inputSize,
      compressedSize: finalBuffer.length,
      savedBytes: inputSize > finalBuffer.length ? inputSize - finalBuffer.length : 0,
      type: fileType || (isPdf ? "application/pdf" : "image/jpeg"),
      uploadedAt: new Date().toISOString()
    });

    const tempGalleryFile = `${galleryFile}.tmp`;
    fs.writeFileSync(tempGalleryFile, JSON.stringify(gallery, null, 2));
    fs.renameSync(tempGalleryFile, galleryFile);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      filename,
      originalSize: inputSize,
      compressedSize: finalBuffer.length,
      isCompressed
    });
  } catch (e: any) {
    console.error("[TripNaari Upload Error]", e);
    return NextResponse.json({ success: false, error: e.message || "Upload failed" }, { status: 500 });
  }
}
