"use client";
import { useState } from "react";
import { uploadFileWithProgress } from "@/lib/upload-with-progress";

export default function ImageUpload({ onUploaded, label = "Upload Photo" }: { onUploaded: (url: string) => void; label?: string }) {
  const [uploading, setUploading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [preview, setPreview] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed size is 100MB.`);
      return;
    }
    
    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    setProgressPercent(5);
    setStatusText("Preparing file...");

    const res = await uploadFileWithProgress(file, (info) => {
      setProgressPercent(info.percent);
      setStatusText(info.statusText);
    });

    setUploading(false);

    if (res.success && res.url) {
      onUploaded(res.url);
      setPreview(res.url);
    } else {
      alert("Upload failed: " + (res.error || "Server error"));
    }

    URL.revokeObjectURL(objectUrl);
  }

  const isVideo = (url: string) => /\.(mp4|webm|ogg)($|\?)/i.test(url);
  const isPdf = (url: string) => /\.pdf($|\?)/i.test(url);

  return (
    <div className="rounded-xl border border-dashed border-[#F1D9D0] bg-[#FFF8F0] p-4">
      <label className="text-[11px] font-bold uppercase tracking-widest text-[#13253D]/60">{label}</label>
      <div className="mt-2 flex items-center gap-4">
        {preview && (
          isPdf(preview) ? (
            <div className="w-20 h-20 rounded-xl border bg-red-50 flex flex-col items-center justify-center p-1 text-center shrink-0">
              <span className="text-xs font-bold text-red-600">PDF</span>
              <a href={preview} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-600 underline mt-1 truncate max-w-full">
                View PDF
              </a>
            </div>
          ) : isVideo(preview) ? (
            <video src={preview} className="w-20 h-20 rounded-xl object-cover border shrink-0" muted />
          ) : (
            <img src={preview} alt="preview" className="w-20 h-20 rounded-xl object-cover border shrink-0" />
          )
        )}
        <div className="flex-1">
          <input
            type="file"
            accept="image/*,application/pdf,video/*"
            onChange={(e) => {
              handleFile(e);
              e.target.value = "";
            }}
            className="text-xs"
          />
          
          {uploading && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#13253D]">
                <span className="truncate pr-2 text-[#FF4A7D]">{statusText}</span>
                <span className="font-mono text-[10px] bg-[#FF4A7D]/10 text-[#FF4A7D] px-1.5 py-0.5 rounded-md font-bold">
                  {progressPercent}%
                </span>
              </div>
              <div className="h-2 w-full bg-[#E5D7D0] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#FF4A7D] via-[#FF758C] to-[#FFC107] rounded-full transition-all duration-300 ease-out shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="text-[10px] text-[#3D4A5E]/70 mt-1">Auto-compressed images & PDF support (Max size: 100MB). Saved to /public/uploads</div>
        </div>
      </div>
    </div>
  );
}
