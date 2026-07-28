import { getAdminData, updateLeadFull } from "@/lib/admin-store";

const statuses = ["new","contacted","itinerary_shared","payment_pending","booked","lost","support_needed"] as const;

export default async function LeadsAdmin() {
  const { leads } = await getAdminData();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-[#13253D]">Leads CRM — Control Pipeline</h1>
      <p className="text-xs text-[#3D4A5E] mt-1">Change status, add notes, set follow-up. Writes to .data/leads.json (PG in prod). Email/WhatsApp hooks in lib/actions.ts.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#F1D9D0] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#FFF8F0] text-[11px] uppercase tracking-widest">
            <tr>
              <th className="text-left p-3">Lead</th>
              <th className="text-left p-3">Destination / Budget</th>
              <th className="text-left p-3">Status → Update</th>
              <th className="text-left p-3">Notes & Follow-up</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l: any)=>(
              <tr key={l.id} className="border-t border-[#F1D9D0] align-top">
                <td className="p-3">
                  <div className="font-semibold">{l.name}</div>
                  <div className="text-xs text-[#3D4A5E]">{l.email}<br/>{l.phone}<br/>{new Date(l.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="p-3 text-xs">
                  <div>{l.destination} • {l.travelMonth}</div>
                  <div>{l.travelers} travelers • {l.budget}</div>
                  <div className="mt-1 max-w-[200px] truncate text-[#3D4A5E]">{l.message}</div>
                </td>
                <td className="p-3">
                  <form action={async(formData: FormData)=>{ "use server"; const status = formData.get("status") as string; const notes = formData.get("notes") as string; const follow = formData.get("followUpAt") as string; await updateLeadFull(l.id, status, notes, follow); }} className="space-y-2">
                    <select name="status" defaultValue={l.status} className="w-full rounded-full border border-[#F1D9D0] px-2 py-1.5 text-xs">
                      {statuses.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                    <textarea name="notes" defaultValue={l.notes||""} placeholder="Add notes / WhatsApp log" className="w-full rounded-xl border border-[#F1D9D0] p-2 text-xs" rows={2} />
                    <input name="followUpAt" type="datetime-local" defaultValue={l.followUpAt||""} className="w-full rounded-full border border-[#F1D9D0] px-2 py-1 text-xs" />
                    <button className="w-full rounded-full bg-[#FF4A7D] text-white py-1.5 text-xs font-bold">Save lead →</button>
                  </form>
                </td>
                <td className="p-3 text-xs">
                  <div>Notes: {l.notes || "—"}</div>
                  <div className="mt-1">Follow: {l.followUpAt || "—"}</div>
                </td>
                <td className="p-3 text-xs">
                  <a href={`https://wa.me/${l.phone?.replace(/[^0-9]/g,"")}`} target="_blank" className="rounded-full bg-[#25D366] text-white px-3 py-1 text-[11px] inline-block">WhatsApp</a>
                  <div className="mt-2 text-[10px] text-[#3D4A5E]">Source: {l.source}</div>
                </td>
              </tr>
            ))}
            {leads.length===0 && <tr><td colSpan={5} className="p-8 text-center text-sm text-[#3D4A5E]">No leads — submit homepage enquiry to test CRM control.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
