import { getMergedLeaders } from "@/lib/public-store";
import { Badge } from "@/components/ui/badge";

export default function TripLeaders() {
  const leaders = getMergedLeaders();
  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="max-w-2xl">
        <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D]">Trip leaders • Accountability, not just selfies</div>
        <h2 className="mt-3 font-display font-bold text-[32px] md:text-[44px] leading-[0.9] text-[#13253D]">She is your sister, guide, and safety officer.</h2>
        <p className="mt-4 text-[#3D4A5E]">Every departure has a verified woman leader. Background-checked, first-aid trained, local language, and empowered to make decisions.</p>
      </div>
      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {leaders.map((l:any)=>(
          <div key={l.slug} className="rounded-[24px] bg-white border border-[#F1D9D0] p-6 card-shadow">
            <div className="flex gap-4">
              <img src={l.image} alt={l.name} className="w-16 h-16 rounded-2xl object-cover" />
              <div>
                <div className="font-semibold text-[#13253D] leading-tight">{l.name}</div>
                <div className="text-[12px] text-[#3D4A5E] mt-1">{l.experienceYears} years • {l.tripsLed}+ trips led</div>
                <div className="mt-2 flex gap-1.5 flex-wrap">{l.specialties?.map((s:string)=>(<Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>))}</div>
              </div>
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-[#3D4A5E]">&ldquo;{l.bio}&rdquo;</p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#FF4A7D]">✔ Safety trained • Verified • Languages: {l.languages?.join(", ")}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
