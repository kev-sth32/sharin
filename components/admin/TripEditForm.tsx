"use client";
import { useState, useTransition } from "react";
import ImageUpload from "./ImageUpload";
import { Loader2 } from "lucide-react";

export default function TripEditForm({ initial, action }: { initial?: any; action: (fd: FormData)=>Promise<any> }) {
  const [heroImage, setHeroImage] = useState(initial?.heroImage || "");
  const [gallery, setGallery] = useState<string[]>(initial?.gallery || []);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to save this trip package?")) return;
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (err) {
        console.error("Save trip failed:", err);
        alert("An error occurred. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white border border-[#F1D9D0] p-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase">Slug (URL)</label>
          <input name="slug" defaultValue={initial?.slug||""} required placeholder="kashmir-blossom" className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase">Destination Slug</label>
          <input name="destinationSlug" defaultValue={initial?.destinationSlug||"kashmir"} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" placeholder="kashmir" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase">Title</label>
          <input name="title" defaultValue={initial?.title||""} required className="w-full mt-1 rounded-xl border px-3 py-2 text-sm font-semibold" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase">Short Description</label>
          <input name="shortDescription" defaultValue={initial?.shortDescription||""} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase">Long Description</label>
          <textarea name="longDescription" defaultValue={initial?.longDescription||""} rows={4} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
        </div>

        <div><label className="text-xs font-bold uppercase">Days</label><input name="durationDays" type="number" defaultValue={initial?.durationDays||5} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
        <div><label className="text-xs font-bold uppercase">Nights</label><input name="durationNights" type="number" defaultValue={initial?.durationNights||4} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>

        <div><label className="text-xs font-bold uppercase">Price From ₹</label><input name="priceFrom" type="number" defaultValue={initial?.priceFrom||19999} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
        <div><label className="text-xs font-bold uppercase">Original Price ₹</label><input name="priceOriginal" type="number" defaultValue={initial?.priceOriginal||""} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>

        <div><label className="text-xs font-bold uppercase">Min Group</label><input name="groupSizeMin" type="number" defaultValue={initial?.groupSizeMin||6} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
        <div><label className="text-xs font-bold uppercase">Max Group</label><input name="groupSizeMax" type="number" defaultValue={initial?.groupSizeMax||16} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>

        <div><label className="text-xs font-bold uppercase">Difficulty</label><select name="difficulty" defaultValue={initial?.difficulty||"easy"} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm"><option>easy</option><option>moderate</option><option>challenging</option></select></div>
        <div><label className="text-xs font-bold uppercase">Comfort</label><select name="comfortLevel" defaultValue={initial?.comfortLevel||"comfort"} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm"><option>backpacker</option><option>comfort</option><option>premium</option></select></div>

        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase">Hero Image URL (or upload below)</label>
          <input name="heroImage" value={heroImage} onChange={e=>setHeroImage(e.target.value)} placeholder="https://... or /uploads/..." className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
          {heroImage && <img src={heroImage} alt="hero" className="mt-2 w-full h-48 object-cover rounded-xl" />}
          <div className="mt-2"><ImageUpload label="Upload Hero Photo" onUploaded={setHeroImage} /></div>
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase">Highlights (comma separated)</label>
          <input name="highlights" defaultValue={(initial?.highlights||[]).join(", ")} placeholder="Houseboat, Tulip Garden, Women Leader" className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase">Itinerary Change Policy</label>
          <textarea name="itineraryChangePolicy" defaultValue={initial?.itineraryChangePolicy||""} rows={2} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="isFeatured" defaultChecked={initial?.isFeatured} /> Featured?</label>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="isPublished" defaultChecked={initial?.isPublished!==false} /> Published?</label>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isPending} 
        className={`w-full rounded-full bg-[#FF4A7D] text-white py-3 text-sm font-bold flex items-center justify-center gap-2 ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
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
