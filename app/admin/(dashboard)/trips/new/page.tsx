import TripEditForm from "@/components/admin/TripEditForm";
import { saveTrip } from "@/lib/admin-store";
import { redirect } from "next/navigation";

export default function NewTripPage() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Add New Trip — Full Content Control</h1>
      <p className="text-xs text-[#3D4A5E] mt-1">All fields, hero photo upload, highlights, policy. Saves instantly to file + PG ready.</p>
      <div className="mt-6 max-w-3xl">
        <TripEditForm action={async(fd: FormData)=>{ "use server"; const res = await saveTrip(fd); if(res.success) redirect(`/admin/trips`); }} />
      </div>
    </div>
  );
}
