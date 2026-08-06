import { getAdminData, getDepartureById, saveDeparture } from "@/lib/admin-store";
import DepartureEditForm from "@/components/admin/DepartureEditForm";
import { notFound, redirect } from "next/navigation";

export default async function EditDeparturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const departureId = Number(id);
  const departure = await getDepartureById(departureId);
  if (!departure) return notFound();

  const { trips } = await getAdminData();

  async function handleSave(formData: FormData) {
    "use server";
    await saveDeparture(formData);
    redirect("/admin/departures");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-[#13253D]">Edit Departure</h1>
        <p className="text-xs text-[#3D4A5E] mt-1">Modify group departure details, seat counts, and status.</p>
      </div>
      <DepartureEditForm initial={departure} trips={trips} action={handleSave} />
    </div>
  );
}
