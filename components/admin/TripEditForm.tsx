"use client";
import { useState, useTransition } from "react";
import ImageUpload from "./ImageUpload";
import { Loader2, Plus, Trash2, Calendar, Hotel as HotelIcon, CheckCircle, XCircle } from "lucide-react";

export default function TripEditForm({ initial, action }: { initial?: any; action: (fd: FormData)=>Promise<any> }) {
  const [heroImage, setHeroImage] = useState(initial?.heroImage || "");
  const [isPending, startTransition] = useTransition();

  // New dynamic aspects states
  const [inclusionsText, setInclusionsText] = useState(
    initial?.inclusions ? initial.inclusions.join("\n") : ""
  );
  const [exclusionsText, setExclusionsText] = useState(
    initial?.exclusions ? initial.exclusions.join("\n") : ""
  );

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

