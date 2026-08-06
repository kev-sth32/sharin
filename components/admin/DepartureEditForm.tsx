"use client";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending} 
      className={`w-full rounded-full bg-[#13253D] text-white py-3 text-sm font-bold flex items-center justify-center gap-2 transition hover:bg-[#FF4A7D] ${pending ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Saving Departure...</span>
        </>
      ) : (
        "Save Departure →"
      )}
    </button>
  );
}

export default function DepartureEditForm({ initial, trips, action }: { initial?: any; trips: any[]; action: (fd: FormData)=>Promise<any> }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!window.confirm("Are you sure you want to save this departure?")) {
      e.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white border border-[#F1D9D0] p-6">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase text-[#13253D]/70">Trip Package</label>
          <select 
            name="tripSlug" 
            defaultValue={initial?.tripSlug || ""} 
            required 
            className="w-full mt-1 rounded-xl border px-3 py-2 text-sm bg-white font-medium text-[#13253D]"
          >
            <option value="">Select a Trip...</option>
            {trips.map((t: any) => (
              <option key={t.slug} value={t.slug}>
                {t.title} ({t.durationDays}D)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-[#13253D]/70">Start Date</label>
          <input 
            type="date" 
            name="startDate" 
            defaultValue={initial?.startDate || ""} 
            required 
            className="w-full mt-1 rounded-xl border px-3 py-2 text-sm text-[#13253D]" 
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-[#13253D]/70">End Date</label>
          <input 
            type="date" 
            name="endDate" 
            defaultValue={initial?.endDate || ""} 
            required 
            className="w-full mt-1 rounded-xl border px-3 py-2 text-sm text-[#13253D]" 
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-[#13253D]/70">Seats Total</label>
          <input 
            type="number" 
            name="seatsTotal" 
            defaultValue={initial?.seatsTotal ?? 16} 
            required 
            min={1}
            className="w-full mt-1 rounded-xl border px-3 py-2 text-sm text-[#13253D]" 
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-[#13253D]/70">Seats Booked</label>
          <input 
            type="number" 
            name="seatsBooked" 
            defaultValue={initial?.seatsBooked ?? 0} 
            required 
            min={0}
            className="w-full mt-1 rounded-xl border px-3 py-2 text-sm text-[#13253D]" 
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-[#13253D]/70">Custom Price (INR, Optional)</label>
          <input 
            type="number" 
            name="price" 
            placeholder="Defaults to trip price if empty"
            defaultValue={initial?.price || ""} 
            className="w-full mt-1 rounded-xl border px-3 py-2 text-sm text-[#13253D]" 
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-[#13253D]/70">Status</label>
          <select 
            name="status" 
            defaultValue={initial?.status || "open"} 
            required 
            className="w-full mt-1 rounded-xl border px-3 py-2 text-sm bg-white text-[#13253D]"
          >
            <option value="open">Open</option>
            <option value="filling_fast">Filling Fast</option>
            <option value="sold_out">Sold Out</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-xs font-semibold text-[#13253D]">
          <input 
            type="checkbox" 
            name="isGuaranteed" 
            defaultChecked={!!initial?.isGuaranteed} 
            className="rounded border-[#F1D9D0] text-[#FF4A7D] focus:ring-[#FF4A7D]" 
          /> 
          Guaranteed Departure?
        </label>
      </div>

      <SubmitButton />
    </form>
  );
}
