import { Shield, Heart, Users, Map, Clock, Wallet } from "lucide-react";

const reasons = [
  { icon: Shield, title: "Women trip leader 24x7, not just a driver", desc: "Verified, wilderness first responder trained, stays in same hotel, accountable via escalation card." },
  { icon: Map, title: "Hotel category revealed at booking, name 7 days before", desc: "We show you 2 sample properties and exact timeline. No bait-and-switch. If changed, upgrade at our cost." },
  { icon: Wallet, title: "Transparent inclusion & refund timelines", desc: "Every trip page lists inclusions, exclusions, cancellation slabs with refund processing days (7-10 days)." },
  { icon: Users, title: "Community, not just customers", desc: "Solo travelers, housewives, mothers, grandmothers travel together. Pre-trip icebreaker call." },
  { icon: Clock, title: "Itinerary change policy in writing", desc: "Weather, traffic, safety, low group size: alternatives or refund options shared 12 hours prior. Never abandoned." },
  { icon: Heart, title: "Food, safety needs actually heard", desc: "Jain, vegan, kid-friendly, medical needs collected in form and acted on. Not just a marketing checkbox." },
];

export default function WhyChoose() {
  return (
    <section className="bg-[#FFF0F4] border-y border-[#F1D9D0]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D]">Why 3000+ women choose TripNaari</div>
          <h2 className="mt-3 font-display font-bold text-[32px] md:text-[48px] leading-[0.9] tracking-tight text-[#13253D]">Safety is not a tagline.<br/>It is accountability.</h2>
          <p className="mt-4 text-[16px] text-[#3D4A5E] leading-relaxed">Public reviews love our safety, some mention operational hiccups. So we fixed it: every touchpoint now has a written policy, escalation, and timeline.</p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r, i)=>(
            <div key={i} className="rounded-[24px] bg-white border border-[#F1D9D0] p-6 md:p-7 card-shadow">
              <div className="w-11 h-11 rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] grid place-items-center text-[#FF4A7D]"><r.icon className="w-5 h-5"/></div>
              <h3 className="mt-4 font-semibold text-[16px] leading-tight text-[#13253D]">{r.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#3D4A5E]">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
