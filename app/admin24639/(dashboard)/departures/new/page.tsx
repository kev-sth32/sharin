import { getAdminData, saveDeparture } from "@/lib/admin-store";
import DepartureEditForm from "@/components/admin/DepartureEditForm";
import { redirect } from "next/navigation";

export default async function NewDeparturePage() {
  const { trips } = await getAdminData();

  async function handleSave(formData: FormData) {
    "use server";
    await saveDeparture(formData);
    redirect("/admin24639/departures");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-[#13253D]">Add New Departure</h1>
        <p className="text-xs text-[#3D4A5E] mt-1">Create a new group departure date for a trip package.</p>
      </div>
      <DepartureEditForm trips={trips} action={handleSave} />
    </div>
  );
}
