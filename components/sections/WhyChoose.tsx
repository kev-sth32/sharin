import { Shield, Heart, Users, Map, Clock, Wallet, HelpCircle } from "lucide-react";
import { getSettings } from "@/lib/public-store";

const iconMap: Record<string, any> = {
  Shield,
  Heart,
  Users,
  Map,
  Clock,
  Wallet
};

export default function WhyChoose() {
  const settings = getSettings();
  const badge = settings.whyChooseBadge || "Why 3000+ women choose TripNaari";
  const title = settings.whyChooseTitle || "Safety is not a tagline.\nIt is accountability.";
  const desc = settings.whyChooseDesc || "Public reviews love our safety, some mention operational hiccups. So we fixed it: every touchpoint now has a written policy, escalation, and timeline.";
  
  const reasons = settings.whyChooseReasons || [];

  return (
    <section className="bg-[#FFF0F4] border-y border-[#F1D9D0]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D]">
            {badge}
          </div>
          <h2 className="mt-3 font-display font-[800] text-[32px] md:text-[48px] leading-[1.05] tracking-tight text-[#13253D] whitespace-pre-line">
            {title}
          </h2>
          <p className="mt-4 text-[16px] md:text-[17px] text-[#3D4A5E] leading-relaxed max-w-2xl text-balance">
            {desc}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r: any, i: number) => {
            const IconComponent = iconMap[r.icon] || HelpCircle;
            return (
              <div 
                key={i} 
                className="group rounded-[24px] bg-white border border-[#F1D9D0] p-6 md:p-7 card-shadow transition-all duration-300 hover:-translate-y-1 hover:border-[#FF4A7D]/30 hover:shadow-xl"
              >
                <div className="w-11 h-11 rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] grid place-items-center text-[#FF4A7D] transition-transform duration-300 group-hover:scale-110">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="mt-4 font-bold text-[16px] leading-tight text-[#13253D] transition-colors duration-300 group-hover:text-[#FF4A7D]">
                  {r.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#3D4A5E]">
                  {r.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
