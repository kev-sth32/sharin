"use client";
import { useState } from "react";

export default function ImageUpload({ onUploaded, label = "Upload Photo" }: { onUploaded: (url: string) => void; label?: string }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // local preview
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (data.success) {
      onUploaded(data.url);
      // keep preview as uploaded url
      setPreview(data.url);
    } else {
      alert("Upload failed: " + data.error);
    }
  }

  const isVideo = (url: string) => /\.(mp4|webm|ogg)($|\?)/i.test(url);

  return (
    <div className="rounded-xl border border-dashed border-[#F1D9D0] bg-[#FFF8F0] p-4">
      <label className="text-[11px] font-bold uppercase tracking-widest text-[#13253D]/60">{label}</label>
      <div className="mt-2 flex items-center gap-4">
        {preview && (
          isVideo(preview) ? (
            <video src={preview} className="w-20 h-20 rounded-xl object-cover border" muted />
          ) : (
            <img src={preview} alt="preview" className="w-20 h-20 rounded-xl object-cover border" />
          )
        )}
        <div>
          <input type="file" accept="image/*" onChange={handleFile} className="text-xs" />
          {uploading && <div className="text-xs mt-1 text-[#FF4A7D]">Uploading…</div>}
          <div className="text-[10px] text-[#3D4A5E]/70 mt-1">Images only (Max size: 20MB). Saved to /public/uploads → usable in hero slide, gallery</div>
        </div>
      </div>
    </div>
  );
}
