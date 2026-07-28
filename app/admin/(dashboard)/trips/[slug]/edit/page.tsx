import { getTripBySlug, saveTrip } from "@/lib/admin-store";
import TripEditForm from "@/components/admin/TripEditForm";
import { notFound, redirect } from "next/navigation";

export default async function EditTripPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) return notFound();
  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Edit Trip — {trip.title}</h1>
      <p className="text-xs text-[#3D4A5E] mt-1">Update any field + change photos. All changes reflect instantly on public trip page.</p>
      <div className="mt-6 max-w-3xl">
        <TripEditForm initial={trip} action={async(fd: FormData)=>{ "use server"; const res = await saveTrip(fd); if(res.success) redirect(`/admin/trips`); }} />
      </div>
    </div>
  );
}
