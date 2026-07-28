import LeaderEditForm from "@/components/admin/LeaderEditForm";
import { saveLeader } from "@/lib/admin-store";
import { redirect } from "next/navigation";

export default function NewLeader() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Add Trip Leader</h1>
      <div className="mt-6 max-w-2xl"><LeaderEditForm action={async(fd: FormData)=>{ "use server"; await saveLeader(fd); redirect("/admin/leaders"); }} /></div>
    </div>
  );
}
