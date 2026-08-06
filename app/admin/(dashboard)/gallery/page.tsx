"use client";
import { useEffect, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { getHomepageGalleryAdmin, saveHomepageGallery } from "@/lib/admin-store";

export default function GalleryAdmin() {
  const [images, setImages] = useState<any[]>([]);
  const [homepageImages, setHomepageImages] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  useEffect(() => {
    // Load general media uploads
    fetch("/api/admin/gallery")
      .then((r) => r.json())
      .then((d) => {
        if (d.images) setImages(d.images);
      })
      .catch(() => {});

    // Load homepage gallery images
    getHomepageGalleryAdmin().then((data) => {
      setHomepageImages(data);
    });
  }, [refresh]);

  async function updateHomepageGallery(newList: any[]) {
    setSaving(true);
    try {
      await saveHomepageGallery(newList);
      setHomepageImages(newList);
    } catch (e) {
      console.error(e);
      alert("Failed to save homepage gallery changes");
    } finally {
      setSaving(false);
    }
  }

  async function deleteImage(url: string) {
    if (!confirm("Are you sure you want to delete this photo from your uploads?")) return;
    setDeletingUrl(url);
    try {
      await fetch("/api/admin/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      // Also remove from homepage gallery if it exists there
      const existsInHome = homepageImages.some((img) => img.src === url);
      if (existsInHome) {
        const filtered = homepageImages.filter((img) => img.src !== url);
        await updateHomepageGallery(filtered);
      }
      setRefresh((x) => x + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingUrl(null);
    }
  }

  function moveImage(index: number, direction: "up" | "down") {
    const newList = [...homepageImages];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    
    // Swap
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    
    updateHomepageGallery(newList);
  }

  function removeImage(index: number) {
    if (!confirm("Remove this image from the homepage gallery? (This will not delete the image file from your uploads)")) return;
    const newList = homepageImages.filter((_, i) => i !== index);
    updateHomepageGallery(newList);
  }

  function handleAltChange(index: number, alt: string) {
    const newList = [...homepageImages];
    newList[index] = { ...newList[index], alt };
    updateHomepageGallery(newList);
  }

  function addImageUrl(url: string, alt: string = "") {
    if (!url) return;
    // Check if already in homepage gallery
    if (homepageImages.some((img) => img.src === url)) {
      alert("This image is already in the homepage gallery!");
      return;
    }
    const newList = [...homepageImages, { src: url, alt }];
    updateHomepageGallery(newList);
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#13253D]">Gallery Manager</h1>
          <p className="text-xs text-[#3D4A5E] mt-1">
            Manage your homepage gallery images, upload new trip hero files, and organize media layouts.
          </p>
        </div>
        {saving ? (
          <span className="text-xs text-[#FF4A7D] font-semibold bg-[#FFF0F4] border border-[#FF4A7D]/20 px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#FF4A7D] animate-ping"></span>
            Saving to homepage…
          </span>
        ) : (
          <span className="text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            All changes saved
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Homepage Gallery Editor */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-[#F1D9D0] pb-3">
              <h2 className="font-semibold text-lg text-[#13253D]">Homepage Gallery Section</h2>
              <span className="text-xs font-semibold bg-[#FFF8F0] border border-[#F1D9D0] text-[#13253D] px-2.5 py-1 rounded-full">
                {homepageImages.length} Photos
              </span>
            </div>
            
            <p className="text-xs text-[#3D4A5E] mb-4 leading-relaxed">
              These images are displayed live in the <strong>"Moments That Capture Our Journey"</strong> section on the homepage. Reorder them using the arrows to adjust their layout grid structure.
            </p>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {homepageImages.length === 0 && (
                <div className="text-sm text-[#3D4A5E] py-8 text-center border-2 border-dashed border-[#F1D9D0] rounded-xl bg-[#FFF8F0]/30">
                  No images in the homepage gallery. Upload below or add from the media library on the right!
                </div>
              )}
              {homepageImages.map((img, i) => (
                <div 
                  key={i} 
                  className="flex gap-4 p-3 rounded-xl border border-[#F1D9D0] bg-[#FFF8F0]/30 items-center justify-between group hover:border-[#FF4A7D]/40 transition"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img 
                      src={img.src} 
                      alt={img.alt || "Gallery Image"} 
                      className="w-16 h-16 rounded-lg object-cover border border-[#F1D9D0] shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-[#3D4A5E] truncate mb-1">
                        URL: <code className="bg-white/80 px-1 py-0.5 rounded border border-black/5">{img.src}</code>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Alt text / Photo description"
                        value={img.alt || ""} 
                        onChange={(e) => handleAltChange(i, e.target.value)}
                        className="w-full text-xs bg-white border border-[#F1D9D0] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#FF4A7D]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <button 
                      onClick={() => moveImage(i, "up")}
                      disabled={i === 0}
                      title="Move Up"
                      className="w-7 h-7 rounded-lg border border-[#F1D9D0] hover:bg-white text-xs disabled:opacity-30 disabled:hover:bg-transparent grid place-items-center transition"
                    >
                      ▲
                    </button>
                    <button 
                      onClick={() => moveImage(i, "down")}
                      disabled={i === homepageImages.length - 1}
                      title="Move Down"
                      className="w-7 h-7 rounded-lg border border-[#F1D9D0] hover:bg-white text-xs disabled:opacity-30 disabled:hover:bg-transparent grid place-items-center transition"
                    >
                      ▼
                    </button>
                    <button 
                      onClick={() => removeImage(i)}
                      title="Remove from Homepage"
                      className="w-7 h-7 rounded-lg border border-[#FF4A7D]/20 text-[#FF4A7D] hover:bg-[#FFF0F4] text-xs grid place-items-center transition ml-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#F1D9D0] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#13253D]/70">Add Directly to Homepage Gallery</h3>
              
              <ImageUpload 
                label="Upload & Add Photo" 
                onUploaded={(url) => {
                  addImageUrl(url, "Moments Capture Our Journey");
                  setRefresh((x) => x + 1);
                }} 
              />

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Or paste any image URL..." 
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 text-xs bg-[#FFF8F0] border border-[#F1D9D0] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FF4A7D]"
                />
                <button 
                  onClick={() => {
                    if (customUrl) {
                      addImageUrl(customUrl, "Homepage gallery photo");
                      setCustomUrl("");
                    }
                  }}
                  className="rounded-xl bg-[#13253D] text-white px-4 py-2 text-xs font-semibold hover:bg-[#FF4A7D] transition shrink-0"
                >
                  Add URL
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: General Media Library */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6 shadow-sm">
            <h2 className="font-semibold text-lg text-[#13253D] border-b border-[#F1D9D0] pb-3 mb-4">Media Upload Library</h2>
            <p className="text-xs text-[#3D4A5E] mb-4">
              A general-purpose repository of your uploaded images. Copy their URLs to use in Trips, Destination settings, Blog posts, or Testimonials.
            </p>

            <ImageUpload 
              label="Upload new file to Library" 
              onUploaded={() => setRefresh((x) => x + 1)} 
            />

            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#13253D]/70 mb-3">All Uploaded Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {images.length === 0 && (
                  <div className="col-span-3 text-sm text-[#3D4A5E] py-8 text-center bg-[#FFF8F0]/20 rounded-xl border border-dashed border-[#F1D9D0]">
                    No general uploads yet. Use the upload field above.
                  </div>
                )}
                {images.map((img: any, i: number) => {
                  const isInHomepage = homepageImages.some((h) => h.src === img.url);
                  return (
                    <div key={i} className="rounded-xl border border-[#F1D9D0] overflow-hidden bg-[#FFF8F0]/10 flex flex-col group justify-between hover:border-[#FF4A7D]/40 transition">
                      <div className="relative">
                        <img 
                          src={img.url} 
                          alt={img.originalName || "upload"} 
                          className="aspect-square w-full object-cover border-b border-[#F1D9D0]" 
                        />
                        {isInHomepage && (
                          <span className="absolute top-1.5 right-1.5 bg-[#FF4A7D] text-white text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shadow-sm">
                            Homepage
                          </span>
                        )}
                      </div>
                      <div className="p-2 flex flex-col gap-1.5">
                        <div className="text-[9px] truncate text-[#3D4A5E] bg-[#FFF8F0] px-1 py-0.5 rounded border border-black/5">{img.url}</div>
                        <div className="flex gap-1 flex-col">
                          <button 
                            onClick={() => { 
                              navigator.clipboard.writeText(img.url); 
                              setCopiedIndex(i); 
                              setTimeout(() => setCopiedIndex(null), 1500); 
                            }} 
                            disabled={copiedIndex === i}
                            className="w-full rounded-lg bg-[#13253D] text-white text-[10px] py-1 font-medium hover:bg-[#1f375a] transition"
                          >
                            {copiedIndex === i ? "Copied!" : "Copy URL"}
                          </button>
                          
                          {!isInHomepage ? (
                            <button 
                              onClick={() => addImageUrl(img.url, "Homepage gallery photo")}
                              className="w-full rounded-lg bg-white border border-[#F1D9D0] text-[#13253D] text-[10px] py-1 font-medium hover:bg-[#FFF8F0] transition"
                            >
                              Add to Homepage
                            </button>
                          ) : (
                            <button 
                              disabled
                              className="w-full rounded-lg bg-green-50 border border-green-200 text-green-700 text-[10px] py-1 font-medium cursor-not-allowed opacity-80"
                            >
                              Added
                            </button>
                          )}

                          <button 
                            onClick={() => deleteImage(img.url)} 
                            disabled={deletingUrl === img.url}
                            className="w-full rounded-lg bg-red-50 border border-red-200 text-red-600 text-[9px] py-0.5 mt-0.5 font-medium hover:bg-red-100 transition flex items-center justify-center gap-1"
                          >
                            {deletingUrl === img.url ? (
                              <span className="w-2.5 h-2.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                            ) : "Delete File"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
