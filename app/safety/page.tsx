import { ShieldCheck, Phone, MapPin, FileText, Heart, AlertTriangle } from "lucide-react";

export const metadata = { title: "Safety Promise - TripNaari Women-First Accountability" };

export default function SafetyPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12">
      <div className="rounded-[32px] bg-[#13253D] text-white p-8 md:p-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase"><ShieldCheck className="w-4 h-4 text-[#FF8A2B]" /> Safety is accountability, not a tagline</div>
        <h1 className="mt-6 font-display font-bold text-[36px] md:text-[48px] leading-[0.9]">Our women-led safety SOP, written for you, not for investors.</h1>
        <p className="mt-4 text-white/70 max-w-2xl">We read public reviews: safety was praised, operations needed transparency. So we wrote SOP that our trip leaders must follow — and you can hold them to it.</p>
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6">
          <h3 className="font-bold flex gap-2"><Phone className="w-5 h-5 text-[#FF4A7D]" /> Before trip: 48h WhatsApp group</h3>
          <ul className="mt-3 space-y-2 text-[14px] text-[#3D4A5E] list-disc pl-5">
            <li>Hotel category + 2 samples, transport type, inclusions/exclusions PDF</li>
            <li>Trip leader intro video + languages + emergency card</li>
            <li>Live location sharing turn-on demo</li>
            <li>Food/medical/collect safety needs from custom form</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6">
          <h3 className="font-bold flex gap-2"><MapPin className="w-5 h-5 text-[#FF4A7D]" /> On trip: Daily safety audits</h3>
          <ul className="mt-3 space-y-2 text-[14px] text-[#3D4A5E] list-disc pl-5">
            <li>Same hotel, same floor where possible, locker check</li>
            <li>Driver background check + no night travel without group consent</li>
            <li>Morning briefing: plan, backup, emergency contacts</li>
            <li>Evening check: headcount, wellness, feedback</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6">
          <h3 className="font-bold flex gap-2"><FileText className="w-5 h-5 text-[#FF4A7D]" /> After booking: Hotel & refunds in writing</h3>
          <ul className="mt-3 space-y-2 text-[14px] text-[#3D4A5E] list-disc pl-5">
            <li>Hotel name 7 days before (3 days for weekend) via email+WhatsApp</li>
            <li>Cancellation slabs disclosed before payment</li>
            <li>Refund timeline: 7-10 working days</li>
            <li>Itinerary change policy for weather/traffic/low group size</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-[#FFF0F4] border border-[#FF4A7D]/20 p-6">
          <h3 className="font-bold flex gap-2 text-[#FF4A7D]"><Heart className="w-5 h-5" /> Accountability: Trip leader empowerment</h3>
          <ul className="mt-3 space-y-2 text-[14px] text-[#5B2063] list-disc pl-5">
            <li>Trip leader can change hotel/vehicle instantly if safety concern — no head office approval needed</li>
            <li>Emergency fund with leader for immediate alternate booking</li>
            <li>Post-trip report filed: issues, actions, learnings</li>
            <li>Monthly safety report on Instagram highlights</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-[#FF8A2B]/20 bg-[#FFF6EF] p-6 flex gap-4">
        <AlertTriangle className="w-6 h-6 text-[#FF8A2B] shrink-0" />
        <div className="text-[14px] leading-relaxed text-[#3D4A5E]">
          <strong className="text-[#13253D]">Low group size scenario:</strong> If group drops below 6, we give 3 choices: Move to next date with free upgrade, continue with small group supplement max 10% extra, full refund. We never cancel confirmed departure without your consent.
        </div>
      </div>
    </div>
  );
}
