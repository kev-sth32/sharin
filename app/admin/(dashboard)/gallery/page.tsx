"use client";
import { useEffect, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";

export default function GalleryAdmin() {
  const [images, setImages] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(()=>{
    fetch("/api/admin/gallery").then(r=>r.json()).then(d=>{ if(d.images) setImages(d.images); }).catch(()=>{});
    // Also load from local .data if API not exist -> use uploads folder listing via fetch
  }, [refresh]);

  async function deleteImage(url: string) {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    setDeletingUrl(url);
    try {
      await fetch("/api/admin/gallery", { method: "DELETE", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ url }) });
      setRefresh(x=>x+1);
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingUrl(null);
    }
  }

  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Gallery — Upload, Change, Delete Photos</h1>
      <p className="text-xs text-[#3D4A5E] mt-1">Upload hero images for trips/destinations. All uploads saved to <code>/public/uploads</code> and tracked in <code>.data/gallery_uploads.json</code>. Use URL in trip edit form.</p>

      <div className="mt-6 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6 sticky top-6">
            <h3 className="font-semibold">Upload New Photos</h3>
            <div className="mt-4 space-y-4">
              <ImageUpload label="Trip Hero / Destination Hero" onUploaded={(url)=>{ setRefresh(x=>x+1); alert(`Uploaded! URL: ${url} — copy and paste into trip heroImage field`); }} />
              <ImageUpload label="Gallery Photo 1" onUploaded={()=>setRefresh(x=>x+1)} />
              <ImageUpload label="Gallery Photo 2" onUploaded={()=>setRefresh(x=>x+1)} />
            </div>
            <div className="mt-6 rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] p-3 text-[11px] text-[#3D4A5E] leading-relaxed">
              <strong>How to use:</strong><br/>
              1. Upload → get URL like <code>/uploads/123-abc.jpg</code><br/>
              2. Go to Trips → Edit → paste URL into Hero Image field → Save<br/>
              3. Photo instantly live on public site<br/><br/>
              In production, swap upload API to S3 presigned URL (code in <code>app/api/admin/upload/route.ts</code>).
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6">
            <h3 className="font-semibold">All Uploaded Photos — Click to copy URL, change anywhere</h3>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.length===0 && <div className="col-span-3 text-sm text-[#3D4A5E]">No uploads yet. Upload from left panel. For demo, shows uploads saved in .data/gallery_uploads.json.</div>}
              {images.map((img: any, i: number)=>(
                <div key={i} className="rounded-xl border border-[#F1D9D0] overflow-hidden group">
                  <img src={img.url} alt={img.originalName||"upload"} className="aspect-square w-full object-cover" />
                  <div className="p-2">
                    <div className="text-[10px] truncate text-[#3D4A5E]">{img.url}</div>
                    <div className="mt-2 flex gap-2">
                      <button 
                        onClick={() => { 
                          navigator.clipboard.writeText(img.url); 
                          setCopiedIndex(i); 
                          setTimeout(() => setCopiedIndex(null), 1500); 
                        }} 
                        disabled={copiedIndex === i}
                        className="flex-1 rounded-full bg-[#13253D] text-white text-[10px] py-1"
                      >
                        {copiedIndex === i ? "Copied!" : "Copy URL"}
                      </button>
                      <button 
                        onClick={() => deleteImage(img.url)} 
                        disabled={deletingUrl === img.url}
                        className="flex-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] py-1 flex items-center justify-center gap-1"
                      >
                        {deletingUrl === img.url ? (
                          <span className="w-2.5 h-2.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                        ) : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#FFF0F4] border border-[#FF4A7D]/20 p-6">
            <h3 className="font-semibold text-[#FF4A7D]">Other Content You Can Change</h3>
            <ul className="mt-3 space-y-1 text-xs text-[#5B2063] list-disc pl-4">
              <li><strong>Trip hero image, gallery, price, highlights, policy</strong> → /admin/trips → Edit Full Content + Photos</li>
              <li><strong>Destination hero, tagline, description, region</strong> → /admin/destinations → Edit</li>
              <li><strong>Trip leaders photo, bio, specialties</strong> → /admin/leaders → edit (create form available now)</li>
              <li><strong>Testimonials</strong> → approve, add new with photo URL</li>
              <li><strong>Blogs</strong> → create with hero image upload</li>
              <li><strong>Leads</strong> → status, notes, follow-up date, WhatsApp</li>
              <li>All content stored in .data/*.json for demo, PostgreSQL ready via Drizzle</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
