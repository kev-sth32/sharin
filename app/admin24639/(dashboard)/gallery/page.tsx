"use client";
import { useEffect, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { getHomepageGalleryAdmin, saveHomepageGallery } from "@/lib/admin-store";
import {
  GripVertical,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  Search,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Sparkles,
  FileImage,
  CheckCircle,
  X,
  Info
} from "lucide-react";

export default function GalleryAdmin() {
  const [images, setImages] = useState<any[]>([]);
  const [homepageImages, setHomepageImages] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "unused">("all");

  // Local Alt text state to prevent keystroke API lag
  const [localAlts, setLocalAlts] = useState<Record<number, string>>({});

  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  // Sync localAlts whenever homepageImages loads/reloads
  useEffect(() => {
    setLocalAlts({});
  }, [homepageImages]);

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
    if (!confirm("Are you sure you want to delete this photo from your uploads? This will delete the actual file and remove it from the homepage gallery if present.")) return;
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
    if (!confirm("Remove this image from the homepage gallery? (This will not delete the file from your library)")) return;
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

  // Clipboard copy
  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  // Native Drag & Drop Handlers
  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  // Drag over
  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
  }

  // Drop
  function handleDrop(index: number) {
    if (draggedIndex === null || draggedIndex === index) return;
    const newList = [...homepageImages];
    const item = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, item);
    updateHomepageGallery(newList);
    setDraggedIndex(null);
  }

  // Filtered general library images
  const filteredImages = images.filter((img: any) => {
    const isInHomepage = homepageImages.some((h) => h.src === img.url);
    
    if (filterTab === "active" && !isInHomepage) return false;
    if (filterTab === "unused" && isInHomepage) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = img.originalName?.toLowerCase().includes(q);
      const urlMatch = img.url?.toLowerCase().includes(q);
      return nameMatch || urlMatch;
    }

    return true;
  });

  const unusedCount = images.filter(
    (img) => !homepageImages.some((h) => h.src === img.url)
  ).length;

  return (
    <div className="max-w-[1500px] mx-auto space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#F1D9D0] rounded-2xl p-4 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF4A7D]/10 text-[#FF4A7D] flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-[#13253D]">Gallery & Media Workspace</h1>
          </div>
          <p className="text-xs text-[#3D4A5E] mt-1.5 leading-relaxed max-w-xl">
            Configure your homepage live gallery banner, manage all media file uploads, and grab URLs for use across Trips, Blogs, and Testimonials.
          </p>
        </div>
        <div className="shrink-0 flex items-center">
          {saving ? (
            <span className="text-xs text-[#FF4A7D] font-bold bg-[#FFF0F4] border border-[#FF4A7D]/20 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-pulse shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF4A7D] animate-ping"></span>
              Auto-saving...
            </span>
          ) : (
            <span className="text-xs text-green-700 font-bold bg-green-50 border border-green-150 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
              <Check className="w-4 h-4 text-green-500 stroke-[3]" />
              Synced & Live
            </span>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#F1D9D0] rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:border-[#FF4A7D]/35 transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#FFF0F4] text-[#FF4A7D] flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-[#3D4A5E] font-bold uppercase tracking-wider">Homepage Banner</div>
            <div className="text-2xl font-bold text-[#13253D] flex items-baseline gap-1.5 mt-0.5">
              {homepageImages.length}
              <span className="text-xs font-semibold text-[#3D4A5E]/80 ml-1">Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#F1D9D0] rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:border-[#FF4A7D]/35 transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#FFF8F0] text-[#FF8A2B] flex items-center justify-center shrink-0">
            <FileImage className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-[#3D4A5E] font-bold uppercase tracking-wider">Media Library</div>
            <div className="text-2xl font-bold text-[#13253D] flex items-baseline gap-1.5 mt-0.5">
              {images.length}
              <span className="text-xs font-semibold text-[#3D4A5E]/80 ml-1">Files</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#F1D9D0] rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:border-[#FF4A7D]/35 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <LinkIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-[#3D4A5E] font-bold uppercase tracking-wider">Unused Uploads</div>
            <div className="text-2xl font-bold text-[#13253D] flex items-baseline gap-1.5 mt-0.5">
              {unusedCount}
              <span className="text-xs font-semibold text-[#3D4A5E]/80 ml-1">Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Homepage Gallery Editor (6/12 width) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="rounded-2xl bg-white border border-[#F1D9D0] p-4 sm:p-6 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F1D9D0] pb-3 gap-2">
              <div>
                <h2 className="font-semibold text-lg text-[#13253D] flex items-center gap-1.5">
                  Homepage Slider Setup
                </h2>
                <p className="text-[11px] text-[#3D4A5E] mt-0.5">
                  Manage photos on the homepage. Drag to reorder.
                </p>
              </div>
              <span className="text-xs font-bold bg-[#FFF8F0] border border-[#F1D9D0] text-[#13253D] px-3 py-1 rounded-full w-fit">
                {homepageImages.length} Slots Filled
              </span>
            </div>

            {/* Info Message Box */}
            <div className="text-xs text-[#3D4A5E] bg-[#FFF8F0]/40 rounded-xl border border-[#F1D9D0] p-3.5 leading-relaxed flex gap-2.5 items-start">
              <Info className="w-4 h-4 text-[#FF8A2B] shrink-0 mt-0.5" />
              <div>
                These images render live inside the <strong className="text-[#13253D]">"Moments That Capture Our Journey"</strong> section. We recommend <strong>6 to 8</strong> images for optimal loading speeds. Drag using the grip handle <GripVertical className="inline w-3 h-3 mx-0.5 text-gray-400" /> to sort.
              </div>
            </div>

            {/* Scrollable Gallery list */}
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {homepageImages.length === 0 ? (
                <div className="text-xs text-[#3D4A5E] py-12 text-center border-2 border-dashed border-[#F1D9D0] rounded-xl bg-[#FFF8F0]/20 flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="w-8 h-8 text-[#3D4A5E]/40" />
                  <span>No images in the homepage slider.</span>
                  <span className="text-[10px] text-gray-400">Upload a photo below or select one from the library!</span>
                </div>
              ) : (
                homepageImages.map((img, i) => {
                  const currentAlt = localAlts[i] !== undefined ? localAlts[i] : (img.alt || "");
                  return (
                    <div 
                      key={i}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragEnd={() => setDraggedIndex(null)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDrop={() => handleDrop(i)}
                      className={`flex flex-col sm:flex-row gap-3 p-3 rounded-xl border border-[#F1D9D0] bg-white transition-all duration-200 ${
                        draggedIndex === i ? "opacity-30 border-dashed border-[#FF4A7D] bg-slate-50 scale-95" : "hover:border-[#FF4A7D]/40 shadow-sm"
                      }`}
                    >
                      {/* Left Block: Grip, Preview, URL, and Desktop Alt Input */}
                      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                        {/* Drag Grip Handle */}
                        <div 
                          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-[#13253D] transition shrink-0"
                          title="Drag to Reorder"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Image Frame */}
                        <div className="relative group/thumb shrink-0">
                          <img 
                            src={img.src} 
                            alt={img.alt || "Gallery Image"} 
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border border-[#F1D9D0] bg-gray-50" 
                          />
                          <a 
                            href={img.src} 
                            target="_blank" 
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 rounded-lg flex items-center justify-center transition-opacity duration-150"
                            title="View Full Size"
                          >
                            <LinkIcon className="w-3.5 h-3.5 text-white" />
                          </a>
                        </div>

                        {/* Info & Alt (Desktop) */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] sm:text-[10px] bg-slate-100 text-[#13253D] font-bold px-1.5 py-0.5 rounded">
                              #{String(i + 1).padStart(2, "0")}
                            </span>
                            <div className="text-[9px] text-[#3D4A5E] truncate max-w-[140px] sm:max-w-[200px] font-mono">
                              {img.src}
                            </div>
                            <button
                              onClick={() => copyToClipboard(img.src)}
                              className="p-1 rounded text-gray-400 hover:text-[#FF4A7D] hover:bg-slate-50 transition shrink-0"
                              title="Copy URL"
                            >
                              {copiedUrl === img.src ? (
                                <Check className="w-3 h-3 text-green-600 stroke-[3]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          
                          {/* Desktop Alt Input */}
                          <div className="hidden sm:block">
                            <input 
                              type="text" 
                              placeholder="Add search-engine friendly alt description..."
                              value={currentAlt} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setLocalAlts(prev => ({ ...prev, [i]: val }));
                              }}
                              onBlur={(e) => {
                                const val = e.target.value;
                                if (val !== img.alt) {
                                  handleAltChange(i, val);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.currentTarget.blur();
                                }
                              }}
                              className="w-full text-[11px] bg-white border border-[#F1D9D0]/80 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#FF4A7D] transition-colors focus:ring-1 focus:ring-[#FF4A7D]/25 placeholder:text-gray-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Mobile Alt Input */}
                      <div className="block sm:hidden w-full">
                        <input 
                          type="text" 
                          placeholder="Add search-engine friendly alt description..."
                          value={currentAlt} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setLocalAlts(prev => ({ ...prev, [i]: val }));
                          }}
                          onBlur={(e) => {
                            const val = e.target.value;
                            if (val !== img.alt) {
                              handleAltChange(i, val);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur();
                            }
                          }}
                          className="w-full text-[11px] bg-white border border-[#F1D9D0]/80 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#FF4A7D] transition-colors focus:ring-1 focus:ring-[#FF4A7D]/25 placeholder:text-gray-400"
                        />
                      </div>

                      {/* Bottom Row (Mobile) / Right Block (Desktop): Controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 border-t border-dashed border-gray-100 pt-2 sm:pt-0 sm:border-0 shrink-0">
                        <span className="text-[10px] text-gray-400 sm:hidden">Reorder / Remove:</span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => moveImage(i, "up")}
                              disabled={i === 0}
                              title="Move Up"
                              className="w-7 h-7 sm:w-6 sm:h-6 rounded border border-gray-150 bg-white hover:bg-slate-50 text-gray-600 disabled:opacity-30 disabled:hover:bg-white grid place-items-center transition"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => moveImage(i, "down")}
                              disabled={i === homepageImages.length - 1}
                              title="Move Down"
                              className="w-7 h-7 sm:w-6 sm:h-6 rounded border border-gray-150 bg-white hover:bg-slate-50 text-gray-600 disabled:opacity-30 disabled:hover:bg-white grid place-items-center transition"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => removeImage(i)}
                            title="Remove from Homepage"
                            className="w-7 h-7 rounded-lg border border-[#FF4A7D]/20 text-[#FF4A7D] hover:bg-[#FFF0F4] hover:border-[#FF4A7D]/40 transition grid place-items-center shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Add Form Section */}
            <div className="mt-2 pt-4 border-t border-[#F1D9D0] space-y-3.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#13253D] flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#FF4A7D]" /> Add Direct URL to Banner
              </h3>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Paste external image URL (e.g. Unsplash URL)..." 
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 text-xs bg-white border border-[#F1D9D0] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#FF4A7D] transition-colors focus:ring-1 focus:ring-[#FF4A7D]/20"
                />
                <button 
                  onClick={() => {
                    if (customUrl) {
                      addImageUrl(customUrl, "Homepage gallery photo");
                      setCustomUrl("");
                    }
                  }}
                  className="rounded-xl bg-[#13253D] text-white px-4 py-2.5 text-xs font-bold hover:bg-[#FF4A7D] hover:shadow-sm transition-all shrink-0"
                >
                  Link Image
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: General Media Library (6/12 width) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="rounded-2xl bg-white border border-[#F1D9D0] p-4 sm:p-6 shadow-sm flex flex-col gap-5">
            <div>
              <h2 className="font-semibold text-lg text-[#13253D]">Media Repository & Uploader</h2>
              <p className="text-xs text-[#3D4A5E] mt-0.5 leading-relaxed">
                Upload new image assets to use across trip packages, articles, or select existing assets to feature in the homepage slider.
              </p>
            </div>

            {/* Upload Area */}
            <ImageUpload 
              label="Drop & Upload new image file" 
              onUploaded={() => setRefresh((x) => x + 1)} 
            />

            {/* Filter and Search Bar controls */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#F1D9D0] pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#13253D]/80">
                  Uploaded File Browser
                </h3>
                
                {/* Search */}
                <div className="relative w-full sm:max-w-[220px]">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by file name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-8 pr-7 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF4A7D] focus:bg-white transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-2 p-0.5 text-gray-400 hover:text-[#13253D] transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Tabs with Horizontal Scroll for Mobile */}
              <div className="flex bg-[#FFF8F0]/60 p-1 rounded-xl border border-[#F1D9D0] gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
                <button
                  onClick={() => setFilterTab("all")}
                  className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    filterTab === "all"
                      ? "bg-white text-[#13253D] shadow-sm border border-[#F1D9D0]/50"
                      : "text-[#3D4A5E]/85 hover:text-[#13253D] hover:bg-white/40"
                  }`}
                >
                  All ({images.length})
                </button>
                <button
                  onClick={() => setFilterTab("active")}
                  className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    filterTab === "active"
                      ? "bg-white text-[#13253D] shadow-sm border border-[#F1D9D0]/50"
                      : "text-[#3D4A5E]/85 hover:text-[#13253D] hover:bg-white/40"
                  }`}
                >
                  On Homepage ({homepageImages.length})
                </button>
                <button
                  onClick={() => setFilterTab("unused")}
                  className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    filterTab === "unused"
                      ? "bg-white text-[#13253D] shadow-sm border border-[#F1D9D0]/50"
                      : "text-[#3D4A5E]/85 hover:text-[#13253D] hover:bg-white/40"
                  }`}
                >
                  Unused ({unusedCount})
                </button>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredImages.length === 0 ? (
                <div className="col-span-3 text-xs text-[#3D4A5E] py-12 text-center bg-slate-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5">
                  <ImageIcon className="w-7 h-7 text-gray-300" />
                  <span>No media assets match your filters.</span>
                  <span className="text-[10px] text-gray-400">Clear search or upload new files above.</span>
                </div>
              ) : (
                filteredImages.map((img: any, i: number) => {
                  const isInHomepage = homepageImages.some((h) => h.src === img.url);
                  return (
                    <div 
                      key={i} 
                      className="group relative rounded-xl border border-[#F1D9D0]/80 overflow-hidden bg-white flex flex-col justify-between hover:border-[#FF4A7D]/40 hover:shadow-md transition-all duration-300 h-fit"
                    >
                      {/* Image Thumbnail Container */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 shrink-0">
                        <img 
                          src={img.url} 
                          alt={img.originalName || "upload"} 
                          className="w-full h-full object-cover" 
                        />

                        {/* Homepage Tag (Always visible overlay on top-left of image) */}
                        {isInHomepage && (
                          <span className="absolute top-2 left-2 z-10 bg-[#FF4A7D] text-white text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shadow-sm">
                            Homepage
                          </span>
                        )}
                      </div>

                      {/* Details & Actions Footer */}
                      <div className="p-2 sm:p-2.5 flex flex-col gap-2 bg-white flex-1 min-w-0 border-t border-[#F1D9D0]/30">
                        {/* File details */}
                        <div className="min-w-0">
                          <div className="text-[10px] text-[#13253D] font-bold truncate" title={img.originalName || "Unnamed asset"}>
                            {img.originalName || "Unnamed asset"}
                          </div>
                          <div className="text-[8px] text-[#3D4A5E]/70 font-mono truncate mt-0.5" title={img.url}>
                            {img.url}
                          </div>
                        </div>

                        {/* Action Row */}
                        <div className="flex items-center gap-1 mt-0.5">
                          {/* Copy Link Button */}
                          <button 
                            onClick={() => copyToClipboard(img.url)}
                            title="Copy Link to Clipboard"
                            className="flex-1 py-1.5 rounded-lg bg-[#FFF8F0] border border-[#F1D9D0] text-[#13253D] hover:bg-[#FFF0F4] hover:border-[#FF4A7D]/35 text-[9px] sm:text-[10px] font-bold transition flex items-center justify-center gap-1 shadow-sm"
                          >
                            {copiedUrl === img.url ? (
                              <>
                                <Check className="w-3 h-3 text-green-600 stroke-[3]" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#3D4A5E]" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          
                          {/* Add to Slider / Active Button */}
                          {!isInHomepage ? (
                            <button 
                              onClick={() => addImageUrl(img.url, "Homepage gallery photo")}
                              title="Add to Homepage Slider"
                              className="flex-1 py-1.5 rounded-lg bg-[#FF4A7D] hover:bg-[#ff3b71] text-white text-[9px] sm:text-[10px] font-bold transition flex items-center justify-center gap-1 shadow-sm"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Slider</span>
                            </button>
                          ) : (
                            <div 
                              title="Active in Homepage Slider"
                              className="flex-1 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[9px] sm:text-[10px] font-bold flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>Active</span>
                            </div>
                          )}

                          {/* Delete Button */}
                          <button 
                            onClick={() => deleteImage(img.url)} 
                            disabled={deletingUrl === img.url}
                            title="Permanently Delete"
                            className="p-1.5 rounded-lg border border-red-150 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition disabled:opacity-50 shrink-0"
                          >
                            {deletingUrl === img.url ? (
                              <span className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin block"></span>
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
