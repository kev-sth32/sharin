import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, ShieldCheck, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1600&q=80" alt="Women traveling together" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#13253D]/90 via-[#5B2063]/60 to-[#FF4A7D]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFF8F0] via-transparent to-transparent" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 pt-10 md:pt-20 pb-24 md:pb-32">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="pink" className="backdrop-blur bg-white/90">Empower • Encourage • Freedom • Safety</Badge>
            <Badge variant="outline" className="backdrop-blur bg-white/80 border-white/50"><Star className="w-3 h-3 mr-1 fill-[#FF8A2B] text-[#FF8A2B]" /> 4.9/5 from 1,200+ Naaris</Badge>
          </div>

          <h1 className="font-display font-[800] tracking-tight leading-[0.95] text-[40px] md:text-[72px] text-white text-balance">
            Travel fearless,<br />
            <span className="text-[#FF8A2B]">we've got your</span><br />
            <span className="relative">backpack! <span className="absolute -bottom-2 left-0 w-full h-3 bg-[#FF4A7D]/30 -rotate-1" /></span>
          </h1>

          <p className="mt-6 text-[18px] md:text-[20px] leading-relaxed text-white/85 max-w-[56ch] text-balance">
            Women-first handcrafted trips from Bangalore to Kashmir to Bali. Verified stays, women trip leaders 24x7, transparent refunds — because sisterhood is safety.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="#enquiry"><Button size="lg" className="w-full sm:w-auto">Find my sisterhood trip — free</Button></Link>
            <Link href="/trips"><Button variant="cream" size="lg" className="w-full sm:w-auto backdrop-blur bg-white/90">See departures →</Button></Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
            <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-4">
              <div className="text-white font-bold text-xl flex items-center gap-1"><Users className="w-5 h-5" /> 3000+</div>
              <div className="text-white/70 text-xs mt-1">Women traveled</div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-4">
              <div className="text-white font-bold text-xl flex items-center gap-1"><ShieldCheck className="w-5 h-5" /> 100%</div>
              <div className="text-white/70 text-xs mt-1">Women trip leaders</div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-4">
              <div className="text-white font-bold text-xl flex items-center gap-1"><MapPin className="w-5 h-5" /> 10+</div>
              <div className="text-white/70 text-xs mt-1">Curated regions</div>
            </div>
          </div>
        </div>

        {/* Floating enquiry card on desktop */}
        <div className="hidden lg:block absolute right-8 top-20 w-[360px]">
          <div className="rounded-[28px] bg-white p-6 card-shadow">
            <div className="text-[12px] font-bold tracking-widest uppercase text-[#FF4A7D]">Quick enquiry • 2 min • 2 hours response</div>
            <h3 className="mt-2 font-display font-bold text-[22px] leading-tight text-[#13253D]">Where do you want to go next, Naari?</h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] p-3">
                <div className="text-[10px] uppercase tracking-widest font-bold text-[#13253D]/60">Most loved</div>
                <div className="text-[13px] font-semibold mt-1">Kashmir Tulip • 5D</div>
                <div className="text-[12px] text-[#13253D]/60">₹21,999 • 8 seats left</div>
              </div>
              <div className="rounded-xl bg-[#FFF0F4] border border-[#FF4A7D]/20 p-3">
                <div className="text-[10px] uppercase tracking-widest font-bold text-[#FF4A7D]">Weekend</div>
                <div className="text-[13px] font-semibold mt-1">Tirthan 3D • Solo</div>
                <div className="text-[12px] text-[#13253D]/60">₹9,999 • Fri departure</div>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-[#13253D] text-white p-3 flex items-center justify-between">
              <div className="text-[13px]">⚡ 3 Naaris enquired last hour</div>
              <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            </div>
            <div className="mt-4">
              <Link href="#enquiry"><Button size="md" className="w-full">Check availability →</Button></Link>
              <div className="mt-2 text-[11px] text-center text-[#13253D]/50">No spam, itinerary on WhatsApp. Cancellation policy transparent.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-[#FFF8F0]">
        <div className="h-8 w-full bg-[#FFF8F0] rounded-t-[32px] -mt-8 relative z-10 border-t border-[#F1D9D0]" />
      </div>
    </section>
  );
}
