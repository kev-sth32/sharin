import { ShieldCheck, BadgeCheck, Heart } from "lucide-react";
const Instagram = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);

export default function SocialProof() {
  return (
    <section className="bg-[#FFF8F0] border-b border-[#F1D9D0]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 md:gap-10">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#13253D]/70">
              <span className="w-8 h-8 rounded-full bg-white border border-[#F1D9D0] grid place-items-center"><ShieldCheck className="w-4 h-4 text-[#FF4A7D]" /></span>
              MSME & Startup India Recognised
            </div>
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#13253D]/70">
              <span className="w-8 h-8 rounded-full bg-white border border-[#F1D9D0] grid place-items-center"><BadgeCheck className="w-4 h-4 text-[#5B2063]" /></span>
              3000+ Women Travelers
            </div>
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#13253D]/70">
              <span className="w-8 h-8 rounded-full bg-white border border-[#F1D9D0] grid place-items-center"><Heart className="w-4 h-4 text-[#FF8A2B]" /></span>
              4.9/5 (1200+ reviews)
            </div>
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#13253D]/70">
              <span className="w-8 h-8 rounded-full bg-white border border-[#F1D9D0] grid place-items-center"><Instagram className="w-4 h-4 text-[#FF4A7D]" /></span>
              33K Instagram • 2,109 posts • @tripnaari
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-widest font-bold text-[#13253D]/40">As seen in love of</span>
            <div className="flex -space-x-2 ml-2">
              {[1, 2, 3, 4, 5].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?img=${10 + i}`} alt="traveler" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
              ))}
              <div className="w-8 h-8 rounded-full bg-[#13253D] text-white grid place-items-center text-[10px] font-bold border-2 border-white">+3k</div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-t border-[#F1D9D0] bg-[#FFF0F4]">
        <div className="flex animate-marquee whitespace-nowrap py-3 gap-8 text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D]/70">
          <span>• Solo women • Housewives • Professionals • Students • Entrepreneurs • Mothers with children • Adventurous grandmothers • Friend groups • Women-led private groups • </span>
          <span>• Solo women • Housewives • Professionals • Students • Entrepreneurs • Mothers with children • Adventurous grandmothers • Friend groups • Women-led private groups • </span>
        </div>
      </div>
    </section>
  );
}
