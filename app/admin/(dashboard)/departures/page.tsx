import { getAdminData, deleteDeparture } from "@/lib/admin-store";
import { formatINR } from "@/lib/utils";
import Link from "next/link";
import ConfirmButton from "@/components/admin/ConfirmButton";

export default async function DeparturesAdmin() {
  const { departures, trips } = await getAdminData();

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#13253D]">Departure Dates — Seats, Guaranteed, Status</h1>
          <div className="text-xs text-[#3D4A5E] mt-1">Manage group departure dates, seat availability, prices, and status. Updates are reflected instantly.</div>
        </div>
        <Link 
          href="/admin/departures/new" 
          className="rounded-full bg-[#FF4A7D] text-white px-5 py-2.5 text-sm font-bold transition hover:bg-[#13253D]"
        >
          + Add New Departure
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-[#F1D9D0] bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#FFF8F0] text-[11px] uppercase text-[#13253D]/70">
            <tr>
              <th className="text-left p-3 font-semibold">Trip Package</th>
              <th className="text-left p-3 font-semibold">Dates</th>
              <th className="text-left p-3 font-semibold">Price</th>
              <th className="text-left p-3 font-semibold">Seats</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold">Guaranteed</th>
              <th className="text-left p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departures.map((d: any) => {
              const trip = trips.find((t: any) => t.slug === d.tripSlug);
              const tripTitle = trip ? trip.title : d.tripSlug;
              const tripPrice = trip ? trip.priceFrom : 0;
              const displayPrice = d.price || tripPrice;

              return (
                <tr key={d.id} className="border-t border-[#F1D9D0]/50 hover:bg-[#FFF8F0]/30 transition-colors">
                  <td className="p-3 text-xs font-semibold text-[#13253D] max-w-xs truncate">{tripTitle}</td>
                  <td className="p-3 text-xs text-[#3D4A5E]">
                    {d.startDate} to {d.endDate}
                  </td>
                  <td className="p-3 text-xs font-medium text-[#13253D]">
                    {formatINR(displayPrice)}
                  </td>
                  <td className="p-3 text-xs text-[#3D4A5E]">
                    <span className="font-bold">{d.seatsBooked}</span> / {d.seatsTotal}
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      d.status === "filling_fast" ? "bg-[#FFF0F4] text-[#FF4A7D] border border-[#FF4A7D]/20" :
                      d.status === "sold_out" ? "bg-gray-100 text-gray-600 border border-gray-200" :
                      d.status === "cancelled" ? "bg-red-50 text-red-600 border border-red-200" :
                      "bg-green-50 text-green-700 border border-green-200"
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs">
                    {d.isGuaranteed ? (
                      <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700 border border-green-200">Guaranteed</span>
                    ) : (
                      <span className="text-[#3D4A5E]/40">—</span>
                    )}
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    <Link 
                      href={`/admin/departures/${d.id}/edit`} 
                      className="rounded-full bg-[#13253D] text-white px-3 py-1 text-[11px] font-bold transition hover:bg-[#FF4A7D]"
                    >
                      Edit
                    </Link>
                    <ConfirmButton
                      action={deleteDeparture.bind(null, d.id)}
                      confirmText={`Are you sure you want to delete this departure for "${tripTitle}"?`}
                      className="rounded-full bg-red-50 border border-red-200 text-red-600 px-3 py-1 text-[11px] font-bold transition hover:bg-red-100"
                    >
                      Delete
                    </ConfirmButton>
                  </td>
                </tr>
              );
            })}
            {departures.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-[#3D4A5E]">
                  No departure dates found. Click "+ Add New Departure" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
