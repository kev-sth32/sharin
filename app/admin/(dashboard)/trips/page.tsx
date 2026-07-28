import { getAdminData, toggleTripFeatured, toggleTripPublished, updateTripPrice, deleteTrip } from "@/lib/admin-store";
import { formatINR } from "@/lib/utils";
import Link from "next/link";

export default async function TripsAdmin() {
  const { trips } = await getAdminData();

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#13253D]">Trip Packages — FULL CRUD + Photos</h1>
          <div className="text-xs text-[#3D4A5E] mt-1">Create, edit all fields, upload hero photo, change gallery, featured toggle, publish/draft, price, SEO. Instant live.</div>
        </div>
        <Link href="/admin/trips/new" className="rounded-full bg-[#FF4A7D] text-white px-5 py-2.5 text-sm font-bold">+ Add New Trip</Link>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {trips.map((t: any)=>(
          <div key={t.slug} className="rounded-2xl bg-white border border-[#F1D9D0] p-5 group hover:border-[#FF4A7D]/30 transition">
            <div className="flex justify-between gap-3">
              <div className="flex-1">
                <div className="font-semibold text-sm leading-tight">{t.title}</div>
                <div className="text-[11px] text-[#3D4A5E] mt-1">{t.destinationSlug} • {t.durationDays}D/{t.durationNights}N • {formatINR(t.priceFrom)} {t.priceOriginal && <span className="line-through"> {formatINR(t.priceOriginal)}</span>}</div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <span className={`text-[10px] rounded-full px-2 py-1 border ${t.isFeatured?'bg-[#FFF0F4] border-[#FF4A7D]/30 text-[#FF4A7D]':'bg-[#FFF8F0] border-[#F1D9D0] text-[#3D4A5E]'}`}>{t.isFeatured?'★ Featured':'Not featured'}</span>
                  <span className={`text-[10px] rounded-full px-2 py-1 border ${t.isPublished!==false?'bg-green-50 border-green-200 text-green-700':'bg-red-50 border-red-200 text-red-600'}`}>{t.isPublished!==false?'Published':'Draft'}</span>
                  <span className="text-[10px] rounded-full bg-[#13253D] text-white px-2 py-1">{t.comfortLevel} • {t.difficulty}</span>
                </div>
                <div className="mt-2 text-[10px] text-[#3D4A5E] line-clamp-2">{t.shortDescription}</div>
              </div>
              <img src={t.heroImage} alt="" className="w-20 h-20 rounded-xl object-cover border" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href={`/admin/trips/${t.slug}/edit`} className="rounded-full bg-[#13253D] text-white text-center text-[11px] font-bold py-2">✏️ Edit Full Content + Photos</Link>
              <a href={`/trips/${t.slug}`} target="_blank" className="rounded-full border border-[#F1D9D0] text-center text-[11px] font-bold py-2 bg-white">View Live →</a>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <form action={async()=>{ "use server"; await toggleTripFeatured(t.slug); }}>
                <button className="w-full rounded-full bg-[#FFF0F4] border border-[#FF4A7D]/20 text-[#FF4A7D] text-[11px] font-bold py-1.5">Toggle ★ Featured</button>
              </form>
              <form action={async()=>{ "use server"; await toggleTripPublished(t.slug); }}>
                <button className="w-full rounded-full border border-[#F1D9D0] bg-white text-[11px] font-bold py-1.5">{t.isPublished!==false?'Draft it':'Publish'}</button>
              </form>
              <form action={async()=>{ "use server"; await deleteTrip(t.slug); }}>
                <button className="w-full rounded-full bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold py-1.5">Delete</button>
              </form>
            </div>

            <form action={async(formData: FormData)=>{ "use server"; const price = Number(formData.get("price")); await updateTripPrice(t.slug, price); }} className="mt-3 flex gap-2">
              <input name="price" type="number" defaultValue={t.priceFrom} className="flex-1 rounded-full border border-[#F1D9D0] px-3 py-1.5 text-xs" />
              <button className="rounded-full bg-[#FF4A7D] text-white px-4 py-1.5 text-xs font-bold">Update price</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
