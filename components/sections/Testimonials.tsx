import { getMergedTestimonials } from "@/lib/public-store";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = getMergedTestimonials().filter((t:any)=>t.isFeatured);
  return (
    <section className="bg-[#13253D] text-white border-y border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16 lg:py-20 xl:py-24 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FF8A2B] mb-3">
            💬 Sisterhood Stories • Verified
          </div>
          <h2 className="font-display font-[800] text-[28px] sm:text-[36px] lg:text-[42px] xl:text-[48px] leading-[1.05] text-white tracking-tight">
            What happens when women travel fearless?
          </h2>
          <p className="mt-4 text-[15px] md:text-[16px] leading-relaxed text-white/70 max-w-xl mx-auto">
            Real travelers, real stories, no stock pretense. We value direct transparent feedback. All reviews verified by invoice records.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {testimonials.slice(0,4).map((t:any, i:number)=>(
            <div key={i} className="rounded-[32px] bg-white text-[#13253D] p-8 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:shadow-[0_20px_50px_-10px_rgba(255,74,125,0.15)] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({length: t.rating||5}).map((_,j)=>(
                    <Star key={j} className="w-4 h-4 fill-[#FF8A2B] text-[#FF8A2B]" />
                  ))}
                </div>
                <p className="text-[14.5px] leading-relaxed text-[#3D4A5E] italic">&ldquo;{t.content}&rdquo;</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F1D9D0]/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[15px] text-[#13253D]">{t.name}</div>
                  <div className="text-[12px] text-[#3D4A5E] font-medium">{t.location}</div>
                </div>
                <div className="text-[10px] font-bold rounded-full bg-[#FFF8F0] border border-[#F1D9D0] px-3.5 py-1 text-[#FF4A7D] uppercase tracking-wider">
                  Verified Trip
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
