import { Phone, MapPin, FileText, Heart, AlertTriangle } from "lucide-react";


export const metadata = { title: "Safety Promise - TripNaari Women-First Accountability" };

export default function SafetyPage() {
  return (
    <div className="bg-[#FFF8F0] py-16 md:py-24 min-h-screen">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D] mb-4">
            Safety Accountability
          </div>
          <h1 className="font-display font-[800] text-[36px] md:text-[48px] leading-[1.05] text-[#13253D]">
            Our Safety SOP, written for you.
          </h1>
          <p className="mt-4 text-[16px] md:text-[17px] leading-relaxed text-[#3D4A5E]">
            We read public feedback: safety is praised, operations need complete transparency. Here is the SOP our Trip Leaders follow — and you can hold us accountable to it.
          </p>
        </div>

        {/* SOP Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-white border border-[#F1D9D0] p-6 md:p-8 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.05)]">
            <h3 className="font-display font-bold text-lg text-[#13253D] flex items-center gap-2 border-b border-[#F1D9D0]/50 pb-3 mb-4">
              <Phone className="w-5 h-5 text-[#FF4A7D]" /> Before trip: 48h WhatsApp Group
            </h3>
            <ul className="space-y-3 text-[14px] text-[#3D4A5E] leading-relaxed list-disc pl-5">
              <li>Hotel category & 2 sample stays shared at booking</li>
              <li>Trip Leader introduction details, contact card, and languages spoken</li>
              <li>Detailed PDF outline of inclusions, exclusions, and itinerary timings</li>
              <li>SOP for special food (Jain, vegan) and medical accessibility constraints</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-white border border-[#F1D9D0] p-6 md:p-8 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.05)]">
            <h3 className="font-display font-bold text-lg text-[#13253D] flex items-center gap-2 border-b border-[#F1D9D0]/50 pb-3 mb-4">
              <MapPin className="w-5 h-5 text-[#FF4A7D]" /> On trip: Daily Safety Audits
            </h3>
            <ul className="space-y-3 text-[14px] text-[#3D4A5E] leading-relaxed list-disc pl-5">
              <li>Stays audited for double locks, verified security, and reviews</li>
              <li>Checked drivers and verified transport. No night travel without group consent</li>
              <li>Morning briefing: exact logistics, alternatives, and regional contacts</li>
              <li>Daily wellness and safety checks by the Trip Leader</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-white border border-[#F1D9D0] p-6 md:p-8 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.05)]">
            <h3 className="font-display font-bold text-lg text-[#13253D] flex items-center gap-2 border-b border-[#F1D9D0]/50 pb-3 mb-4">
              <FileText className="w-5 h-5 text-[#FF4A7D]" /> After booking: Stays & Refunds
            </h3>
            <ul className="space-y-3 text-[14px] text-[#3D4A5E] leading-relaxed list-disc pl-5">
              <li>Hotel name confirmed 7 days before (3 days for weekend trips)</li>
              <li>Cancellation slabs disclosed in writing before you pay a deposit</li>
              <li>Refund timeline: 7-10 working days returned to source</li>
              <li>Weather, curfew, or safety change guidelines written clearly</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-[#FFF0F4] border border-[#FF4A7D]/20 p-6 md:p-8 shadow-[0_10px_35px_-8px_rgba(255,74,125,0.05)]">
            <h3 className="font-display font-bold text-lg text-[#FF4A7D] flex items-center gap-2 border-b border-[#FF4A7D]/20 pb-3 mb-4">
              <Heart className="w-5 h-5 text-[#FF4A7D] stroke-[3]" /> Leader Empowerment SOP
            </h3>
            <ul className="space-y-3 text-[14px] text-[#800F2D] leading-relaxed list-disc pl-5">
              <li>Trip Leader is authorized to change stays or transport immediately for safety</li>
              <li>Emergency funds kept with Leader for instant changes/detours</li>
              <li>Detailed post-trip audits filled to document operational learnings</li>
              <li>Monthly safety incident reports shared transparently with community</li>
            </ul>
          </div>
        </div>

        {/* Detour Alert banner */}
        <div className="mt-12 rounded-3xl border border-[#FF8A2B]/20 bg-[#FFF6EF] p-6 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-[#FF8A2B] shrink-0 mt-0.5" />
          <div className="text-[14px] leading-relaxed text-[#3D4A5E]">
            <strong className="text-[#13253D] block mb-1">Low group size policy</strong>
            If a group size drops below 6, we offer 3 choices: move to next date with upgrade, supplement max 10% extra to travel with a smaller group size, or a 100% full refund. We never cancel a confirmed date without your explicit consent.
          </div>
        </div>

      </div>
    </div>
  );
}

