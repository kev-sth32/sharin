import DestinationEditForm from "@/components/admin/DestinationEditForm";
import { saveDestination } from "@/lib/admin-store";
import { redirect } from "next/navigation";

export default function NewDestPage() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Add Destination — With Photo Upload</h1>
      <div className="mt-6 max-w-3xl">
        <DestinationEditForm action={async(fd: FormData)=>{ "use server"; const res = await saveDestination(fd); if(res.success) redirect("/admin/destinations"); }} />
      </div>
    </div>
  );
}
