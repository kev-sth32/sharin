import { getDestinationBySlug, saveDestination } from "@/lib/admin-store";
import DestinationEditForm from "@/components/admin/DestinationEditForm";
import { notFound, redirect } from "next/navigation";

export default async function EditDestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest) return notFound();
  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Edit Destination — {dest.name}</h1>
      <div className="mt-6 max-w-3xl">
        <DestinationEditForm initial={dest} action={async(fd: FormData)=>{ "use server"; await saveDestination(fd); redirect("/admin/destinations"); }} />
      </div>
    </div>
  );
}
