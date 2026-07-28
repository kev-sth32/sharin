import { getAdminData } from "@/lib/admin-store";
import Link from "next/link";

export default async function LeadersAdmin() {
  const { tripLeaders } = await getAdminData();
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="font-display font-bold text-2xl">Trip Leaders — Photo + Bio + Verified</h1>
        <Link href="/admin/leaders/new" className="rounded-full bg-[#5B2063] text-white px-5 py-2.5 text-sm font-bold">+ Add Leader</Link>
      </div>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {tripLeaders.map((l: any)=>(
          <div key={l.slug} className="rounded-2xl bg-white border border-[#F1D9D0] p-5 hover:border-[#FF4A7D]/30 transition">
            <img src={l.image} alt={l.name} className="w-20 h-20 rounded-2xl object-cover border" />
            <div className="font-semibold mt-3 text-sm">{l.name}</div>
            <div className="text-xs text-[#3D4A5E] mt-1 line-clamp-3">{l.bio}</div>
            <div className="text-[10px] mt-2">✔ Verified • {l.experienceYears}y • {l.tripsLed}+ trips</div>
            <Link href={`/admin/leaders/${l.slug}/edit`} className="mt-3 block rounded-full bg-[#13253D] text-white text-center text-[11px] py-2">✏️ Edit + Change Photo</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
