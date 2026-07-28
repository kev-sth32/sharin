import { getAdminData, addTestimonial, approveTestimonial } from "@/lib/admin-store";

export default async function TestimonialsAdmin() {
  const { testimonials } = await getAdminData();
  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Testimonials — Moderate & Feature</h1>
      <div className="mt-6 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          {testimonials.map((t: any)=>(
            <div key={t.id || t.name} className="rounded-2xl bg-white border border-[#F1D9D0] p-5">
              <div className="flex justify-between gap-3">
                <div>
                  <div className="font-semibold text-sm">{t.name} — {t.location}</div>
                  <div className="text-xs text-[#3D4A5E]">Trip: {t.tripSlug} • Rating {t.rating} • Approved: {t.isApproved!==false?'Yes':'No'}</div>
                  <p className="text-sm mt-2 leading-relaxed">“{t.content}”</p>
                </div>
                <form action={async()=>{ "use server"; if(t.id) await approveTestimonial(t.id); }}>
                  <button className="rounded-full bg-[#13253D] text-white px-3 py-1 text-[11px]">Toggle approve</button>
                </form>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6 sticky top-6">
            <h3 className="font-semibold">Add new testimonial</h3>
            <form action={async(formData: FormData)=>{ "use server"; await addTestimonial({ name: formData.get("name"), location: formData.get("location"), tripSlug: formData.get("tripSlug"), rating: Number(formData.get("rating")), content: formData.get("content") }); }} className="mt-4 space-y-3">
              <input name="name" placeholder="Name" required className="w-full rounded-xl border border-[#F1D9D0] px-3 py-2 text-sm" />
              <input name="location" placeholder="Location e.g. Bangalore, 32" className="w-full rounded-xl border border-[#F1D9D0] px-3 py-2 text-sm" />
              <input name="tripSlug" placeholder="Trip slug e.g. kashmir-blossom" className="w-full rounded-xl border border-[#F1D9D0] px-3 py-2 text-sm" />
              <select name="rating" className="w-full rounded-xl border border-[#F1D9D0] px-3 py-2 text-sm">
                <option value="5">5 ★</option><option value="4">4 ★</option>
              </select>
              <textarea name="content" placeholder="Review content" required rows={4} className="w-full rounded-xl border border-[#F1D9D0] px-3 py-2 text-sm" />
              <button className="w-full rounded-full bg-[#FF4A7D] text-white py-2 text-sm font-bold">Add testimonial →</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
