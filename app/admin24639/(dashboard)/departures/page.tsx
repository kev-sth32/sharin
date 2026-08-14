import { getAdminData } from "@/lib/admin-store";
import Link from "next/link";
import DeparturesManager from "@/components/admin/DeparturesManager";

export default async function DeparturesAdmin() {
  const { departures, trips } = await getAdminData();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#13253D]">Departure Dates — Seats, Guaranteed, Status</h1>
          <div className="text-xs text-[#3D4A5E] mt-1">Manage group departure dates, seat availability, prices, and status. Updates are reflected instantly.</div>
        </div>
        <Link 
          href="/admin24639/departures/new" 
          className="rounded-full bg-[#FF4A7D] text-white px-5 py-2.5 text-sm font-bold transition hover:bg-[#13253D]"
        >
          + Add New Departure
        </Link>
      </div>

      <DeparturesManager initialDepartures={departures} trips={trips} />
    </div>
  );
}
