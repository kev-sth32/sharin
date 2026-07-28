import { tripPackagesSeed } from "@/lib/data";
import { formatINR } from "@/lib/utils";

export default function DeparturesAdmin() {
  const today = new Date();
  const departures = tripPackagesSeed.flatMap(t=>[
    { trip: t.title, slug: t.slug, start: new Date(today.getTime()+7*24*60*60*1000), seats: 14, booked: 8, status: "open" },
    { trip: t.title, slug: t.slug, start: new Date(today.getTime()+20*24*60*60*1000), seats: 16, booked: 14, status: "filling_fast" },
  ]).slice(0,12);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Departure Dates — Seats, Guaranteed, Status</h1>
      <div className="mt-6 rounded-2xl border border-[#F1D9D0] bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FFF8F0] text-[11px] uppercase">
            <tr><th className="text-left p-3">Trip</th><th className="text-left p-3">Start - End</th><th className="text-left p-3">Seats</th><th className="text-left p-3">Status</th><th className="text-left p-3">Action</th></tr>
          </thead>
          <tbody>
            {departures.map((d,i)=>(
              <tr key={i} className="border-t">
                <td className="p-3 text-xs">{d.trip}</td>
                <td className="p-3 text-xs">{d.start.toLocaleDateString()} — 5D</td>
                <td className="p-3 text-xs">{d.booked}/{d.seats}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${d.status==="filling_fast"?"bg-[#FFF0F4] text-[#FF4A7D] border border-[#FF4A7D]/20":"bg-green-50 text-green-700"}`}>{d.status}</span></td>
                <td className="p-3"><button className="rounded-full bg-[#13253D] text-white px-3 py-1 text-[11px]">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
