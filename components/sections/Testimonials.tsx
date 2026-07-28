import { getMergedTestimonials } from "@/lib/public-store";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = getMergedTestimonials().filter((t:any)=>t.isFeatured);
  return (
    <section className="bg-[#13253D] text-white border-y border-white/10">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF8A2B]">Real Naaris, real stories, no filter</div>
            <h2 className="mt-3 font-display font-bold text-[32px] md:text-[44px] leading-[0.9]">What happens when<br/>women travel fearless?</h2>
          </div>
          <div className="text-white/60 text-sm max-w-sm">We don’t delete critical reviews. We respond, we rectify, we publish corrective actions. Manage in /admin/testimonials.</div>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {testimonials.slice(0,4).map((t:any, i:number)=>(
            <div key={i} className="rounded-[24px] bg-white text-[#13253D] p-7">
              <div className="flex gap-1">{Array.from({length: t.rating||5}).map((_,j)=><Star key={j} className="w-4 h-4 fill-[#FF8A2B] text-[#FF8A2B]" />)}</div>
              <p className="mt-4 text-[15px] leading-relaxed">&ldquo;{t.content}&rdquo;</p>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[14px]">{t.name}</div>
                  <div className="text-[12px] text-[#3D4A5E]">{t.location}</div>
                </div>
                <div className="text-[11px] rounded-full bg-[#FFF8F0] border border-[#F1D9D0] px-3 py-1">Trip: {t.tripSlug}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
