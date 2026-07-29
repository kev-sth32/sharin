import { getAdminData, toggleDestinationPublished, deleteDestination } from "@/lib/admin-store";
import Link from "next/link";
import ConfirmButton from "@/components/admin/ConfirmButton";

export default async function DestinationsAdmin() {
  const { destinations } = await getAdminData();
  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl">Destinations — Full CRUD + Photo Upload</h1>
          <p className="text-xs text-[#3D4A5E] mt-1">Create new destination, edit name/tagline/description/region/best season/hero photo, publish.</p>
        </div>
        <Link href="/admin/destinations/new" className="rounded-full bg-[#FF4A7D] text-white px-5 py-2.5 text-sm font-bold">+ Add Destination</Link>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {destinations.map((d: any)=>(
          <div key={d.slug} className="rounded-2xl bg-white border border-[#F1D9D0] p-5 flex gap-4 hover:border-[#FF4A7D]/30 transition">
            <img src={d.heroImage} className="w-24 h-24 rounded-xl object-cover border" alt="" />
            <div className="flex-1">
              <div className="font-semibold text-sm">{d.name} — {d.region}</div>
              <div className="text-xs text-[#3D4A5E] mt-1 line-clamp-2">{d.tagline}</div>
              <div className="text-[10px] mt-2">Best: {d.bestSeason} • Published: {d.isPublished!==false?'Yes':'No'} • {d.isInternational?'International':'India'}</div>
              <div className="mt-3 flex gap-2">
                <Link href={`/admin/destinations/${d.slug}/edit`} className="rounded-full bg-[#13253D] text-white px-3 py-1 text-[11px] font-bold">✏️ Edit + Change Photo</Link>
                <a href={`/destinations/${d.slug}`} target="_blank" className="rounded-full border px-3 py-1 text-[11px]">View</a>
                <ConfirmButton
                  action={toggleDestinationPublished.bind(null, d.slug)}
                  confirmText={`Are you sure you want to ${d.isPublished!==false?'draft':'publish'} "${d.name}"?`}
                  className="rounded-full border px-3 py-1 text-[11px]"
                >
                  {d.isPublished!==false?'Draft':'Publish'}
                </ConfirmButton>
                <ConfirmButton
                  action={deleteDestination.bind(null, d.slug)}
                  confirmText={`Are you sure you want to DELETE "${d.name}"? This cannot be undone.`}
                  className="rounded-full bg-red-50 border border-red-200 text-red-600 px-3 py-1 text-[11px]"
                >
                  Delete
                </ConfirmButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
