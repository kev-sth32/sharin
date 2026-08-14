import { getAdminData, saveLeader } from "@/lib/admin-store";
import LeaderEditForm from "@/components/admin/LeaderEditForm";
import { notFound, redirect } from "next/navigation";

export default async function EditLeaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getAdminData();
  const leader = data.tripLeaders.find((l:any)=>l.slug===slug);
  if (!leader) return notFound();
  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Edit Leader — {leader.name}</h1>
      <div className="mt-6 max-w-2xl">
        <LeaderEditForm initial={leader} action={async(fd: FormData)=>{ "use server"; await saveLeader(fd); redirect("/admin24639/leaders"); }} />
      </div>
    </div>
  );
}
