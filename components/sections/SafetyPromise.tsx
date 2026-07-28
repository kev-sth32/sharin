import { AlertTriangle, BadgeCheck, PhoneCall, FileCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SafetyPromise() {
  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="rounded-[32px] bg-[#13253D] text-white overflow-hidden border border-white/10">
        <div className="grid md:grid-cols-12">
          <div className="md:col-span-7 p-8 md:p-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FF4A7D]/20 border border-[#FF4A7D]/30 px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase text-[#FF8A9D]"><BadgeCheck className="w-4 h-4" /> Safety Promise — Women-led, written, accountable</div>
            <h2 className="mt-6 font-display font-bold text-[32px] md:text-[44px] leading-[0.9]">Travel fearless means<br/>knowing exactly who<br/>has your back.</h2>
            <div className="mt-8 grid sm:grid-cols-2 gap-6 text-[14px] leading-relaxed">
              <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-white/10 grid place-items-center shrink-0"><PhoneCall className="w-4 h-4 text-[#FF8A2B]" /></div><div><div className="font-semibold text-white">Emergency card in your pocket</div><div className="text-white/60 mt-1">Trip leader, local police, hospital, TripNaari founder Anjali escalation. Printed + WhatsApp.</div></div></div>
              <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-white/10 grid place-items-center shrink-0"><AlertTriangle className="w-4 h-4 text-[#FF8A2B]" /></div><div><div className="font-semibold text-white">Live location on travel days</div><div className="text-white/60 mt-1">Driver & trip leader share live location in group. No one gets dropped alone after dark.</div></div></div>
              <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-white/10 grid place-items-center shrink-0"><BadgeCheck className="w-4 h-4 text-[#FF8A2B]" /></div><div><div className="font-semibold text-white">Verified stays & drivers</div><div className="text-white/60 mt-1">Background check, hotel safety audit (lock, location, solo women reviews), same gender floor where possible.</div></div></div>
              <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-white/10 grid place-items-center shrink-0"><FileCheck className="w-4 h-4 text-[#FF8A2B]" /></div><div><div className="font-semibold text-white">Refund & hotel timeline in writing</div><div className="text-white/60 mt-1">We message you: hotel name 7 days before, cancellation slabs, refund in 7-10 days. No verbal promises.</div></div></div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/safety"><Button size="md" className="bg-white text-[#13253D] hover:bg-[#FFF8F0]">Read safety SOP →</Button></Link>
              <Link href="/policies/cancellation-refund"><Button variant="outline" size="md" className="bg-transparent border-white/20 text-white hover:bg-white/10">Cancellation policy</Button></Link>
            </div>
          </div>
          <div className="md:col-span-5 bg-[#FFF8F0] text-[#13253D] p-8 md:p-10 flex flex-col">
            <div className="text-[12px] font-bold tracking-widest uppercase text-[#FF4A7D]">Feedback escalation - We listen, we act</div>
            <h3 className="mt-3 font-display font-bold text-2xl leading-tight">If anything feels off, here is your power:</h3>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-white border border-[#F1D9D0] p-4">
                <div className="text-[13px] font-bold">Level 1: Trip Leader (Instant)</div>
                <div className="text-[13px] text-[#3D4A5E] mt-1">Raise on group or privately. She is empowered to change stay/vehicle if safety concern.</div>
              </div>
              <div className="rounded-2xl bg-white border border-[#F1D9D0] p-4">
                <div className="text-[13px] font-bold">Level 2: Operations 24x7</div>
                <div className="text-[13px] text-[#3D4A5E] mt-1">WhatsApp +91 9XXXX 9XXXX (2 min response for ongoing trips). Manager callback in 30 min.</div>
              </div>
              <div className="rounded-2xl bg-[#FFE7EE] border border-[#FF4A7D]/20 p-4">
                <div className="text-[13px] font-bold text-[#FF4A7D]">Level 3: Founder Escalation</div>
                <div className="text-[13px] text-[#3D4A5E] mt-1">Email founder@tripnaari.com. You get response in 24 hours + correct action log.</div>
              </div>
            </div>
            <div className="mt-6 text-[11px] text-[#3D4A5E]/70 leading-relaxed">We publish monthly safety report in our Instagram story highlights: issues raised, actions taken. Because trust is built, not claimed.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
