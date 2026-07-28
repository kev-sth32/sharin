"use client";
import { useState } from "react";
import ImageUpload from "./ImageUpload";

export default function LeaderEditForm({ initial, action }: { initial?: any; action: (fd: FormData)=>Promise<any> }) {
  const [image, setImage] = useState(initial?.image||"");
  return (
    <form action={action} className="space-y-4 rounded-2xl bg-white border border-[#F1D9D0] p-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="text-xs font-bold uppercase">Slug</label><input name="slug" defaultValue={initial?.slug||""} required className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
        <div><label className="text-xs font-bold uppercase">Name</label><input name="name" defaultValue={initial?.name||""} required className="w-full mt-1 rounded-xl border px-3 py-2 text-sm font-bold" /></div>
        <div className="md:col-span-2"><label className="text-xs font-bold uppercase">Bio</label><textarea name="bio" defaultValue={initial?.bio||""} rows={4} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
        <div><label className="text-xs font-bold uppercase">Specialties (comma)</label><input name="specialties" defaultValue={(initial?.specialties||[]).join(", ")} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
        <div><label className="text-xs font-bold uppercase">Languages (comma)</label><input name="languages" defaultValue={(initial?.languages||[]).join(", ")} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
        <div><label className="text-xs font-bold uppercase">Exp Years</label><input name="experienceYears" type="number" defaultValue={initial?.experienceYears||3} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
        <div><label className="text-xs font-bold uppercase">Trips Led</label><input name="tripsLed" type="number" defaultValue={initial?.tripsLed||0} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" /></div>
        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase">Photo URL</label>
          <input name="image" value={image} onChange={e=>setImage(e.target.value)} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
          {image && <img src={image} className="mt-2 w-24 h-24 rounded-xl object-cover" alt="leader" />}
          <div className="mt-2"><ImageUpload label="Upload Leader Photo" onUploaded={setImage} /></div>
        </div>
      </div>
      <button type="submit" className="w-full rounded-full bg-[#5B2063] text-white py-3 text-sm font-bold">Save Leader →</button>
    </form>
  );
}
