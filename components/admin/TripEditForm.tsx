"use client";
import { useState, useTransition } from "react";
import ImageUpload from "./ImageUpload";
import { Loader2, Plus, Trash2, Calendar, Hotel as HotelIcon, CheckCircle, XCircle, Upload } from "lucide-react";
import { compressImageInBrowser } from "@/lib/client-compressor";
import { uploadFileWithProgress } from "@/lib/upload-with-progress";

export default function TripEditForm({ initial, action }: { initial?: any; action: (fd: FormData)=>Promise<any> }) {
  const [heroImage, setHeroImage] = useState(initial?.heroImage || "");
  const [itineraryPdf, setItineraryPdf] = useState(initial?.itineraryPdf || "");
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfProgressPercent, setPdfProgressPercent] = useState(0);
  const [pdfStatusText, setPdfStatusText] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed size is 100MB.`);
      return;
    }

    setPdfUploading(true);
    setPdfProgressPercent(5);
    setPdfStatusText("Preparing PDF file...");

    try {
      const res = await uploadFileWithProgress(file, (info) => {
        setPdfProgressPercent(info.percent);
        setPdfStatusText(info.statusText);
      });

      if (res.success && res.url) {
        setItineraryPdf(res.url);
      } else {
        alert("Upload failed: " + (res.error || "Server error"));
      }
    } catch (err: any) {
      alert("Error uploading file: " + (err?.message || "Network error"));
    } finally {
      setPdfUploading(false);
      setPdfProgressPercent(0);
      setPdfStatusText("");
      e.target.value = "";
    }
  }

  // New dynamic aspects states
  const [inclusionsText, setInclusionsText] = useState(
    initial?.inclusions ? initial.inclusions.join("\n") : ""
  );
  const [exclusionsText, setExclusionsText] = useState(
    initial?.exclusions ? initial.exclusions.join("\n") : ""
  );

  const [packingDisclaimer, setPackingDisclaimer] = useState(initial?.packingDisclaimer || "");
  const [packingItemsText, setPackingItemsText] = useState(
    initial?.packingItems ? initial.packingItems.join("\n") : ""
  );
  const [momentsGallery, setMomentsGallery] = useState<string[]>(
    initial?.momentsGallery && Array.isArray(initial.momentsGallery)
      ? initial.momentsGallery
      : []
  );
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const [gallery, setGallery] = useState<string[]>(
    initial?.gallery && Array.isArray(initial.gallery)
      ? initial.gallery
      : []
  );
  const [uploadingGalleryIdx, setUploadingGalleryIdx] = useState<number | null>(null);

  const updateGalleryUrl = (index: number, url: string) => {
    const updated = [...gallery];
    while (updated.length <= index) {
      updated.push("");
    }
    updated[index] = url;
    setGallery(updated);
  };

  const removeGalleryImage = (index: number) => {
    const updated = [...gallery];
    updated[index] = "";
    setGallery(updated);
  };

  const handleGalleryUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingGalleryIdx(index);

    try {
      const finalFile = await compressImageInBrowser(file);
      const formData = new FormData();
      formData.append("file", finalFile);

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        updateGalleryUrl(index, data.url);
      } else {
        alert("Upload failed: " + (data?.error || res.statusText || "Server error"));
      }
    } catch (err: any) {
      alert("Error uploading image: " + (err?.message || "Network error"));
    } finally {
      setUploadingGalleryIdx(null);
    }
  };

  const updateMomentUrl = (index: number, url: string) => {
    const updated = [...momentsGallery];
    while (updated.length <= index) {
      updated.push("");
    }
    updated[index] = url;
    setMomentsGallery(updated);
  };

  const removeMoment = (index: number) => {
    const updated = [...momentsGallery];
    updated[index] = "";
    setMomentsGallery(updated);
  };

  const handleMomentUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);

    try {
      const finalFile = await compressImageInBrowser(file);
      const formData = new FormData();
      formData.append("file", finalFile);

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        updateMomentUrl(index, data.url);
      } else {
        alert("Upload failed: " + (data?.error || res.statusText || "Server error"));
      }
    } catch (err: any) {
      alert("Error uploading image: " + (err?.message || "Network error"));
    } finally {
      setUploadingIndex(null);
    }
  };

  const [cancellationSpecialNotes, setCancellationSpecialNotes] = useState(initial?.cancellationSpecialNotes || "");
  const [cancellationSlabs, setCancellationSlabs] = useState<any[]>(
    initial?.cancellationSlabs || [
      { window: "30 Days or more before departure date", refund: "100% Refund", terms: "Full amount refunded back to source account. No hidden penalties." },
      { window: "Between 15 to 30 Days before departure date", refund: "50% Refund", terms: "Half package cost refunded or 80% dynamic rollover credit voucher provided." },
      { window: "Between 7 to 14 Days before departure date", refund: "25% Refund", terms: "Quarterly package cost returned. Operational logistics fees apply." },
      { window: "Less than 7 Days before departure date", refund: "No Refund (0%)", terms: "Strictly non-refundable due to advance mountain vehicle and hotel bookings." }
    ]
  );

  const updateCancellationSlab = (index: number, key: string, value: string) => {
    const updated = [...cancellationSlabs];
    updated[index] = { ...updated[index], [key]: value };
    setCancellationSlabs(updated);
  };

  const addCancellationSlab = () => {
    setCancellationSlabs([
      ...cancellationSlabs,
      { window: "", refund: "", terms: "" }
    ]);
  };

  const removeCancellationSlab = (index: number) => {
    if (cancellationSlabs.length <= 1) return;
    setCancellationSlabs(cancellationSlabs.filter((_, i) => i !== index));
  };

  const getInitialItinerary = () => {
    if (initial?.itinerary && initial.itinerary.length > 0) {
      return initial.itinerary;
    }
    const days = initial?.durationDays || 5;
    const list = [];
    for (let i = 1; i <= days; i++) {
      list.push({
        day: i,
        title: `Day ${i} Plan`,
        desc: "",
        meals: ["B"],
        stay: "Stay / Hotel details"
      });
    }
    return list;
  };
  const [itinerary, setItinerary] = useState<any[]>(getInitialItinerary());

  const [hotels, setHotels] = useState<any[]>(
    initial?.hotels || [
      { 
        name: "", 
        category: "3-star comfort", 
        location: "", 
        amenities: ["Locker", "24x7 reception"], 
        confirmationTimeline: "Exact name 7 days before" 
      }
    ]
  );

  // Itinerary helpers
  const updateItineraryItem = (index: number, key: string, value: any) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [key]: value };
    setItinerary(updated);
  };

  const addItineraryDay = () => {
    const nextDay = itinerary.length + 1;
    setItinerary([
      ...itinerary,
      { day: nextDay, title: `Day ${nextDay} Plan`, desc: "", meals: ["B"], stay: "Stay / Hotel details" }
    ]);
  };

  const removeItineraryDay = (index: number) => {
    if (itinerary.length <= 1) return;
    const filtered = itinerary.filter((_, i) => i !== index).map((item, i) => ({
      ...item,
      day: i + 1
    }));
    setItinerary(filtered);
  };

  // Hotel helpers
  const updateHotelItem = (index: number, key: string, value: any) => {
    const updated = [...hotels];
    if (key === "amenities") {
      updated[index] = { ...updated[index], [key]: value.split(",").map((s: string) => s.trim()).filter(Boolean) };
    } else {
      updated[index] = { ...updated[index], [key]: value };
    }
    setHotels(updated);
  };

  const addHotel = () => {
    setHotels([
      ...hotels,
      { name: "", category: "3-star comfort", location: "", amenities: [], confirmationTimeline: "Exact name 7 days before" }
    ]);
  };

  const removeHotel = (index: number) => {
    if (hotels.length <= 1) return;
    setHotels(hotels.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to save this trip package?")) return;
    const formData = new FormData(e.currentTarget);
    
    // Parse inclusions and exclusions from multiline text
    const inclusionsArr = inclusionsText.split("\n").map((s: string) => s.trim()).filter(Boolean);
    const exclusionsArr = exclusionsText.split("\n").map((s: string) => s.trim()).filter(Boolean);
    
    formData.set("inclusions", JSON.stringify(inclusionsArr));
    formData.set("exclusions", JSON.stringify(exclusionsArr));
    formData.set("itinerary", JSON.stringify(itinerary));
    formData.set("hotels", JSON.stringify(hotels));
    formData.set("cancellationSlabs", JSON.stringify(cancellationSlabs));
    formData.set("momentsGallery", JSON.stringify(momentsGallery.filter(Boolean)));
    formData.set("gallery", JSON.stringify(gallery.filter(Boolean)));
    
    startTransition(async () => {
      try {
        await action(formData);
      } catch (err: any) {
        if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
          throw err;
        }
        console.error("Save trip failed:", err);
        alert("An error occurred. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 rounded-3xl bg-white border border-[#F1D9D0] p-6 md:p-8 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.05)]">
      {/* 1. Basic Details */}
      <div className="space-y-6">
        <h2 className="font-display font-bold text-xl text-[#13253D] border-b border-[#F1D9D0]/50 pb-2">1. Basic Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#13253D]">Slug (URL Segment)</label>
            <input name="slug" defaultValue={initial?.slug||""} required placeholder="kashmir-blossom" className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#13253D]">Destination Slug</label>
            <input name="destinationSlug" defaultValue={initial?.destinationSlug||"kashmir"} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" placeholder="kashmir" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#13253D]">Location Display Label (Map Pin)</label>
            <input name="locationLabel" defaultValue={initial?.locationLabel||""} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" placeholder="e.g. Sikkim, India (falls back to destination slug)" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#13253D]">Badge Text (e.g. Popular, Selling Fast, or 'none' to hide)</label>
            <input name="badgeText" defaultValue={initial?.badgeText||""} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" placeholder="e.g. Popular, Selling Fast, or 'none'" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase text-[#13253D]">Title</label>
            <input name="title" defaultValue={initial?.title||""} required className="w-full mt-1 rounded-xl border px-3 py-2 text-sm font-semibold" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase text-[#13253D]">Short Description</label>
            <input name="shortDescription" defaultValue={initial?.shortDescription||""} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase text-[#13253D]">Long Description</label>
            <textarea name="longDescription" defaultValue={initial?.longDescription||""} rows={3} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
          </div>

          <div><label className="text-xs font-bold uppercase text-[#13253D]">Days</label><input name="durationDays" type="number" defaultValue={initial?.durationDays||5} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
          <div><label className="text-xs font-bold uppercase text-[#13253D]">Nights</label><input name="durationNights" type="number" defaultValue={initial?.durationNights||4} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>

          <div><label className="text-xs font-bold uppercase text-[#13253D]">Price From ₹</label><input name="priceFrom" type="number" defaultValue={initial?.priceFrom||19999} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
          <div><label className="text-xs font-bold uppercase text-[#13253D]">Original Price ₹</label><input name="priceOriginal" type="number" defaultValue={initial?.priceOriginal||""} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>

          <div><label className="text-xs font-bold uppercase text-[#13253D]">Min Group</label><input name="groupSizeMin" type="number" defaultValue={initial?.groupSizeMin||6} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
          <div><label className="text-xs font-bold uppercase text-[#13253D]">Max Group</label><input name="groupSizeMax" type="number" defaultValue={initial?.groupSizeMax||16} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>

          <div><label className="text-xs font-bold uppercase text-[#13253D]">Difficulty</label><select name="difficulty" defaultValue={initial?.difficulty||"easy"} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm"><option>easy</option><option>moderate</option><option>challenging</option></select></div>
          <div><label className="text-xs font-bold uppercase text-[#13253D]">Comfort Level</label><select name="comfortLevel" defaultValue={initial?.comfortLevel||"comfort"} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm"><option>backpacker</option><option>comfort</option><option>premium</option></select></div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase text-[#13253D]">Hero Image URL (or upload below)</label>
            <input name="heroImage" value={heroImage} onChange={e=>setHeroImage(e.target.value)} placeholder="https://... or /uploads/..." className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
            {heroImage && <img src={heroImage} alt="hero" className="mt-2 w-full h-48 object-cover rounded-xl" />}
            <div className="mt-2"><ImageUpload label="Upload Hero Photo" onUploaded={setHeroImage} /></div>
          </div>

          {/* Destination Gallery Photos */}
          <div className="md:col-span-2 rounded-2xl border border-[#F1D9D0] bg-[#FFF8F0]/30 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-[#13253D]">🖼️ Destination Gallery Photos (Grid Gallery - Max 5)</h3>
              <span className="text-[10px] text-[#3D4A5E]/60 font-semibold">Upload or paste URLs for up to 5 additional gallery images</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map((idx) => {
                const url = gallery[idx] || "";
                return (
                  <div key={idx} className="relative rounded-xl border border-[#F1D9D0] bg-white p-2.5 space-y-2 flex flex-col justify-between shadow-sm min-h-[120px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-[#13253D]/40">IMAGE #{idx + 1}</span>
                      {url && (
                        <button 
                          type="button" 
                          onClick={() => removeGalleryImage(idx)} 
                          className="text-[#800F2D] hover:text-red-700 transition-colors p-0.5"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {url ? (
                      <div className="space-y-1.5">
                        <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-12 object-cover rounded-lg border" />
                        <input 
                          type="text" 
                          value={url} 
                          onChange={e => updateGalleryUrl(idx, e.target.value)} 
                          placeholder="Image URL" 
                          className="w-full text-[9px] px-1.5 py-0.5 rounded border"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2.5 border border-dashed border-[#F1D9D0] rounded-lg bg-[#FFF8F0]/40 flex-1">
                        {uploadingGalleryIdx === idx ? (
                          <div className="text-[9px] text-[#FF4A7D] animate-pulse">Uploading...</div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center space-y-0.5">
                            <Upload className="w-3.5 h-3.5 text-[#FF4A7D]" />
                            <span className="text-[8px] font-bold text-[#FF4A7D]">Upload</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={e => handleGalleryUpload(idx, e)} 
                              className="hidden" 
                            />
                          </label>
                        )}
                        <span className="text-[7px] text-[#3D4A5E]/40 my-0.5">or</span>
                        <input 
                          type="text" 
                          placeholder="URL..." 
                          onChange={e => updateGalleryUrl(idx, e.target.value)} 
                          className="w-11/12 text-[8px] px-1 py-0.5 rounded border text-center"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase text-[#13253D]">Itinerary PDF URL</label>
            <input name="itineraryPdf" value={itineraryPdf} onChange={e=>setItineraryPdf(e.target.value)} placeholder="e.g. /uploads/kashmir-itinerary.pdf or external google drive link" className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
            <div className="mt-2 rounded-xl border border-dashed border-[#F1D9D0] bg-[#FFF8F0] p-4">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#13253D]/60 block mb-1">Upload Itinerary PDF</label>
              <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="text-xs" />
              {pdfUploading && (
                <div className="mt-3 space-y-1.5 bg-white p-3 rounded-xl border border-[#F1D9D0] shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#13253D]">
                    <span className="truncate pr-2 text-[#FF4A7D]">{pdfStatusText}</span>
                    <span className="font-mono text-[10px] bg-[#FF4A7D]/10 text-[#FF4A7D] px-2 py-0.5 rounded-md font-bold">
                      {pdfProgressPercent}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#E5D7D0] rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF4A7D] via-[#FF758C] to-[#FFC107] rounded-full transition-all duration-300 ease-out shadow-sm"
                      style={{ width: `${pdfProgressPercent}%` }}
                    />
                  </div>
                </div>
              )}
              {itineraryPdf && (
                <div className="text-xs mt-2 text-green-700 font-semibold flex items-center gap-1">
                  <span>✓ Configured PDF:</span>
                  <a href={itineraryPdf} target="_blank" rel="noopener noreferrer" className="underline">{itineraryPdf}</a>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase text-[#13253D]">Highlights (comma separated)</label>
            <input name="highlights" defaultValue={(initial?.highlights||[]).join(", ")} placeholder="Houseboat, Tulip Garden, Women Leader" className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase text-[#13253D]">Itinerary Change Policy</label>
            <textarea name="itineraryChangePolicy" defaultValue={initial?.itineraryChangePolicy||""} rows={2} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs font-bold text-[#13253D]"><input type="checkbox" name="isFeatured" defaultChecked={initial?.isFeatured} /> Featured?</label>
            <label className="flex items-center gap-2 text-xs font-bold text-[#13253D]"><input type="checkbox" name="isPublished" defaultChecked={initial?.isPublished!==false} /> Published?</label>
            <label className="flex items-center gap-2 text-xs font-bold text-[#13253D]"><input type="checkbox" name="isInternational" defaultChecked={initial?.isInternational} /> International?</label>
          </div>
        </div>
      </div>

      {/* 2. Inclusions & Exclusions */}
      <div className="space-y-6">
        <h2 className="font-display font-bold text-xl text-[#13253D] border-b border-[#F1D9D0]/50 pb-2">2. Inclusions & Exclusions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold uppercase text-green-700 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Inclusions (One entry per line)</label>
            <textarea 
              rows={6}
              value={inclusionsText}
              onChange={e => setInclusionsText(e.target.value)}
              placeholder="Accommodation - Same hotel for all women&#10;Meals: Breakfast daily + 2 dinners&#10;Private transport with background check"
              className="w-full mt-2 rounded-2xl border px-3 py-2 text-sm font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-red-700 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Exclusions (One entry per line)</label>
            <textarea 
              rows={6}
              value={exclusionsText}
              onChange={e => setExclusionsText(e.target.value)}
              placeholder="Personal expenses & shopping&#10;Meals not mentioned&#10;Travel insurance"
              className="w-full mt-2 rounded-2xl border px-3 py-2 text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* 3. Day-by-Day Itinerary */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#F1D9D0]/50 pb-2">
          <h2 className="font-display font-bold text-xl text-[#13253D]">3. Day-wise sisterhood plan</h2>
          <button 
            type="button" 
            onClick={addItineraryDay} 
            className="flex items-center gap-1 text-xs font-bold bg-[#FF4A7D]/10 hover:bg-[#FF4A7D]/25 text-[#FF4A7D] rounded-full px-3 py-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Day
          </button>
        </div>

        <div className="space-y-4">
          {itinerary.map((dayItem, index) => (
            <div key={index} className="rounded-2xl border border-[#F1D9D0] bg-[#FFF8F0]/30 p-5 space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-display font-bold text-base text-[#13253D]">
                  <Calendar className="w-4 h-4 text-[#FF4A7D]" />
                  <span>Day {dayItem.day}</span>
                </div>
                {itinerary.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeItineraryDay(index)} 
                    className="text-[#800F2D] hover:text-red-700 transition-colors p-1"
                    title="Remove Day"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-[#3D4A5E]">Day Title</label>
                  <input 
                    type="text" 
                    value={dayItem.title} 
                    onChange={e => updateItineraryItem(index, "title", e.target.value)}
                    required
                    placeholder="e.g. Arrival in Srinagar - Sisterhood icebreaker"
                    className="w-full mt-1 rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-[#3D4A5E]">Description</label>
                  <textarea 
                    value={dayItem.desc} 
                    onChange={e => updateItineraryItem(index, "desc", e.target.value)}
                    required
                    rows={2}
                    placeholder="Brief details about what the group does on this day..."
                    className="w-full mt-1 rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#3D4A5E]">Meals (e.g. B, L, D)</label>
                  <input 
                    type="text" 
                    value={dayItem.meals.join(", ")} 
                    onChange={e => updateItineraryItem(index, "meals", e.target.value.split(",").map((s: string)=>s.trim()).filter(Boolean))}
                    placeholder="e.g. B, D"
                    className="w-full mt-1 rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#3D4A5E]">Stay</label>
                  <input 
                    type="text" 
                    value={dayItem.stay} 
                    onChange={e => updateItineraryItem(index, "stay", e.target.value)}
                    placeholder="e.g. Srinagar Houseboat / Heritage Hotel"
                    className="w-full mt-1 rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Hotel Previews */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#F1D9D0]/50 pb-2">
          <h2 className="font-display font-bold text-xl text-[#13253D]">4. Hotel preview</h2>
          <button 
            type="button" 
            onClick={addHotel} 
            className="flex items-center gap-1 text-xs font-bold bg-[#FF4A7D]/10 hover:bg-[#FF4A7D]/25 text-[#FF4A7D] rounded-full px-3 py-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Hotel
          </button>
        </div>

        <div className="space-y-4">
          {hotels.map((hotel, index) => (
            <div key={index} className="rounded-2xl border border-[#F1D9D0] bg-[#FFF8F0]/30 p-5 space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-display font-bold text-base text-[#13253D]">
                  <HotelIcon className="w-4 h-4 text-[#FF4A7D]" />
                  <span>Hotel #{index + 1}</span>
                </div>
                {hotels.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeHotel(index)} 
                    className="text-[#800F2D] hover:text-red-700 transition-colors p-1"
                    title="Remove Hotel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#3D4A5E]">Hotel / Homestay Name (Sample)</label>
                  <input 
                    type="text" 
                    value={hotel.name} 
                    onChange={e => updateHotelItem(index, "name", e.target.value)}
                    required
                    placeholder="e.g. Srinagar Residency"
                    className="w-full mt-1 rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#3D4A5E]">Category / Rating</label>
                  <input 
                    type="text" 
                    value={hotel.category} 
                    onChange={e => updateHotelItem(index, "category", e.target.value)}
                    required
                    placeholder="e.g. 3-star comfort / Women-led Homestay"
                    className="w-full mt-1 rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#3D4A5E]">Location</label>
                  <input 
                    type="text" 
                    value={hotel.location} 
                    onChange={e => updateHotelItem(index, "location", e.target.value)}
                    required
                    placeholder="e.g. Srinagar"
                    className="w-full mt-1 rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#3D4A5E]">Timeline Confirmation text</label>
                  <input 
                    type="text" 
                    value={hotel.confirmationTimeline} 
                    onChange={e => updateHotelItem(index, "confirmationTimeline", e.target.value)}
                    required
                    placeholder="e.g. Exact name 7 days before"
                    className="w-full mt-1 rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-[#3D4A5E]">Amenities (comma separated)</label>
                  <input 
                    type="text" 
                    value={(hotel.amenities || []).join(", ")} 
                    onChange={e => updateHotelItem(index, "amenities", e.target.value)}
                    placeholder="e.g. Locker, 24x7 reception, Women-only floor option"
                    className="w-full mt-1 rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Additional Dynamic Details */}
      <div className="space-y-6">
        <h2 className="font-display font-bold text-xl text-[#13253D] border-b border-[#F1D9D0]/50 pb-2">5. Additional Details (Packing, Moments, Cancellation)</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Packing section */}
          <div className="rounded-2xl border border-[#F1D9D0] bg-[#FFF8F0]/30 p-5 space-y-4">
            <h3 className="font-display font-bold text-[#13253D]">🎒 Packing Checklist</h3>
            <div>
              <label className="text-[10px] font-bold uppercase text-[#3D4A5E]">Packing Disclaimer/Info</label>
              <input 
                type="text" 
                name="packingDisclaimer"
                value={packingDisclaimer}
                onChange={e => setPackingDisclaimer(e.target.value)}
                placeholder="e.g. Weather conditions in mountainous regions can drop rapidly..."
                className="w-full mt-1 rounded-xl border px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-[#3D4A5E]">Packing Items (One per line)</label>
              <textarea 
                name="packingItems"
                rows={5}
                value={packingItemsText}
                onChange={e => setPackingItemsText(e.target.value)}
                placeholder="Heavy thermal innerwear&#10;Insulated winter jacket&#10;Sturdy trekking shoes"
                className="w-full mt-1 rounded-xl border px-3 py-2 text-sm bg-white"
              />
            </div>
          </div>

          {/* Moments Gallery section */}
          <div className="rounded-2xl border border-[#F1D9D0] bg-[#FFF8F0]/30 p-5 space-y-4">
            <h3 className="font-display font-bold text-[#13253D]">📸 Moments Gallery (Previous Trips)</h3>
            <p className="text-[10px] text-[#3D4A5E]/70">Upload or paste URLs for up to 4 moments photos of previous trips.</p>
            
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((idx) => {
                const url = momentsGallery[idx] || "";
                return (
                  <div key={idx} className="relative rounded-xl border border-[#F1D9D0] bg-white p-3 space-y-2 flex flex-col justify-between shadow-sm min-h-[140px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#13253D]/50 uppercase">Moment #{idx + 1}</span>
                      {url && (
                        <button 
                          type="button" 
                          onClick={() => removeMoment(idx)} 
                          className="text-[#800F2D] hover:text-red-700 transition-colors p-1"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {url ? (
                      <div className="space-y-2">
                        <img src={url} alt={`Moment ${idx + 1}`} className="w-full h-16 object-cover rounded-lg border" />
                        <input 
                          type="text" 
                          value={url} 
                          onChange={e => updateMomentUrl(idx, e.target.value)} 
                          placeholder="Image URL" 
                          className="w-full text-[10px] px-2 py-1 rounded border"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 border border-dashed border-[#F1D9D0] rounded-lg bg-[#FFF8F0]/40">
                        {uploadingIndex === idx ? (
                          <div className="text-[10px] text-[#FF4A7D] animate-pulse">Uploading...</div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center space-y-1">
                            <Upload className="w-4 h-4 text-[#FF4A7D]" />
                            <span className="text-[9px] font-bold text-[#FF4A7D]">Upload Photo</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={e => handleMomentUpload(idx, e)} 
                              className="hidden" 
                            />
                          </label>
                        )}
                        <span className="text-[8px] text-[#3D4A5E]/40 my-1">or</span>
                        <input 
                          type="text" 
                          placeholder="Paste image URL..." 
                          onChange={e => updateMomentUrl(idx, e.target.value)} 
                          className="w-11/12 text-[9px] px-1.5 py-0.5 rounded border text-center"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cancellation slabs */}
        <div className="rounded-2xl border border-[#F1D9D0] bg-[#FFF8F0]/30 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-[#13253D]">📋 Timeline Cancellation Slabs</h3>
            <button 
              type="button" 
              onClick={addCancellationSlab}
              className="flex items-center gap-1 text-[11px] font-bold bg-[#FF4A7D]/10 hover:bg-[#FF4A7D]/25 text-[#FF4A7D] rounded-full px-2.5 py-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Slab
            </button>
          </div>

          <div className="space-y-3">
            {cancellationSlabs.map((slab, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start border-b border-[#F1D9D0]/30 pb-3">
                <div className="md:col-span-3">
                  <label className="text-[9px] font-bold uppercase text-[#3D4A5E]">Timeline Window</label>
                  <input 
                    type="text" 
                    value={slab.window}
                    onChange={e => updateCancellationSlab(index, "window", e.target.value)}
                    placeholder="e.g. 30 Days or more before departure"
                    className="w-full mt-0.5 rounded-lg border px-2.5 py-1.5 text-xs bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[9px] font-bold uppercase text-[#3D4A5E]">Refund %</label>
                  <input 
                    type="text" 
                    value={slab.refund}
                    onChange={e => updateCancellationSlab(index, "refund", e.target.value)}
                    placeholder="e.g. 100% Refund"
                    className="w-full mt-0.5 rounded-lg border px-2.5 py-1.5 text-xs bg-white text-center"
                  />
                </div>
                <div className="md:col-span-6">
                  <label className="text-[9px] font-bold uppercase text-[#3D4A5E]">Applicable terms / Notes</label>
                  <input 
                    type="text" 
                    value={slab.terms}
                    onChange={e => updateCancellationSlab(index, "terms", e.target.value)}
                    placeholder="e.g. Full amount refunded back to source..."
                    className="w-full mt-0.5 rounded-lg border px-2.5 py-1.5 text-xs bg-white"
                  />
                </div>
                <div className="md:col-span-1 pt-4 text-right">
                  {cancellationSlabs.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeCancellationSlab(index)}
                      className="text-[#800F2D] hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <label className="text-[10px] font-bold uppercase text-[#3D4A5E]">Special Policy Notes / Warnings</label>
            <textarea 
              name="cancellationSpecialNotes"
              rows={3}
              value={cancellationSpecialNotes}
              onChange={e => setCancellationSpecialNotes(e.target.value)}
              placeholder="Permit application processing tokens and high-altitude clearances are non-refundable once initiated..."
              className="w-full mt-1 rounded-xl border px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isPending} 
        className={`w-full rounded-full bg-[#FF4A7D] hover:bg-[#E63E6E] text-white py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving Trip Data...</span>
          </>
        ) : (
          "Save Trip → Live Instantly"
        )}
      </button>
    </form>
  );
}

