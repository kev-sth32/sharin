"use client";
import { useState, useTransition } from "react";
import ImageUpload from "./ImageUpload";
import { Loader2 } from "lucide-react";

export default function DestinationEditForm({ initial, action }: { initial?: any; action: (fd: FormData)=>Promise<any> }) {
  const [heroImage, setHeroImage] = useState(initial?.heroImage || "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to save this destination?")) return;
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (err) {
        console.error("Save destination failed:", err);
        alert("An error occurred. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white border border-[#F1D9D0] p-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="text-xs font-bold uppercase">Slug</label><input name="slug" defaultValue={initial?.slug||""} required className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
        <div><label className="text-xs font-bold uppercase">Name</label><input name="name" defaultValue={initial?.name||""} required className="w-full mt-1 rounded-xl border px-3 py-2 text-sm font-semibold" /></div>
        <div className="md:col-span-2"><label className="text-xs font-bold uppercase">Tagline</label><input name="tagline" defaultValue={initial?.tagline||""} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
        <div className="md:col-span-2"><label className="text-xs font-bold uppercase">Description</label><textarea name="description" defaultValue={initial?.description||""} rows={3} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
        <div><label className="text-xs font-bold uppercase">Region</label><input name="region" defaultValue={initial?.region||""} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
        <div><label className="text-xs font-bold uppercase">Best Season</label><input name="bestSeason" defaultValue={initial?.bestSeason||""} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
        <div className="md:col-span-2"><label className="text-xs font-bold uppercase">Ideal For (comma)</label><input name="idealFor" defaultValue={(initial?.idealFor||[]).join(", ")} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
      </div>
      <div>
        <label className="text-xs font-bold uppercase">Hero Image URL</label>
        <input name="heroImage" value={heroImage} onChange={e=>setHeroImage(e.target.value)} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
        {heroImage && <img src={heroImage} alt="hero" className="mt-2 w-full h-48 object-cover rounded-xl" />}
        <div className="mt-2"><ImageUpload label="Upload Destination Photo" onUploaded={setHeroImage} /></div>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="isInternational" defaultChecked={initial?.isInternational} /> International?</label>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="isPublished" defaultChecked={initial?.isPublished!==false} /> Published?</label>
      </div>
      <button 
        type="submit" 
        disabled={isPending} 
        className={`w-full rounded-full bg-[#13253D] text-white py-3 text-sm font-bold flex items-center justify-center gap-2 ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving Destination...</span>
          </>
        ) : (
          "Save Destination →"
        )}
      </button>
    </form>
  );
}
