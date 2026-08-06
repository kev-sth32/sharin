import { getMergedLeaders } from "@/lib/public-store";
import { Badge } from "@/components/ui/badge";

export default function TripLeaders() {
  const leaders = getMergedLeaders();
  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16 lg:py-20 xl:py-24">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FF4A7D]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FF4A7D] mb-3">
          👩‍✈️ Trip leaders • Accountability
        </div>
        <h2 className="font-display font-[800] text-[28px] sm:text-[36px] lg:text-[42px] xl:text-[48px] leading-[1.05] text-[#13253D] tracking-tight">
          She is your sister, guide, and safety officer.
        </h2>
        <p className="mt-4 text-[15px] md:text-[16px] leading-relaxed text-[#3D4A5E] max-w-xl mx-auto">
          Every departure has a verified woman leader. Background-checked, first-aid trained, local language, and empowered to make decisions.
        </p>
      </div>
      
      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {leaders.map((l:any)=>(
          <div key={l.slug} className="rounded-[32px] bg-white border border-[#F1D9D0] p-6 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.04)] hover:shadow-[0_20px_50px_-10px_rgba(255,74,125,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex gap-4">
                {l.image ? (
                  <img src={l.image} alt={l.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-[#F1D9D0]" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#FF4A7D]/10 text-[#FF4A7D] flex items-center justify-center font-bold text-lg shrink-0">
                    {l.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-[#13253D] leading-tight text-base">{l.name}</div>
                  <div className="text-[12px] text-[#3D4A5E] mt-1 font-semibold">{l.experienceYears} Years • {l.tripsLed}+ Trips Led</div>
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    {l.specialties?.map((s:string)=>(
                      <Badge key={s} variant="outline" className="text-[9px] uppercase font-bold tracking-wider text-[#FF4A7D] border-[#FF4A7D]/20 bg-[#FFF0F4]/40">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-5 text-[13.5px] leading-relaxed text-[#3D4A5E] italic">&ldquo;{l.bio}&rdquo;</p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F1D9D0]/50 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#800F2D]">
              <span className="text-[#FF4A7D]">✔</span> Safety Trained • Verified • {l.languages?.join(", ")}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
