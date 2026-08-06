"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, Calendar, Briefcase } from "lucide-react";
import { openEnquiryModal } from "@/lib/utils";

export default function Hero() {
  const [enquiryCount, setEnquiryCount] = useState(24);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnquiryCount((prev) => {
        const choices = [12, 24, 32, 45, 54, 61];
        const filtered = choices.filter((c) => c !== prev);
        return filtered[Math.floor(Math.random() * filtered.length)];
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-[#FFF8F0]">
      {/* Dark maroon/burgundy hero background container */}
      <div className="relative overflow-hidden bg-[#6a0c24] text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1600&q=80"
            alt="Women traveling together"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#4A0516]/90 via-[#6D0C24]/85 to-[#4A0516]/95" />
        </div>

        {/* Hero Content (Left text, Right quick enquiry form) */}
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 pt-20 pb-36">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left side text */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase text-white/90">
                Women-Only Travel Experience
              </div>

              <h1 className="font-display font-[800] tracking-tight leading-[1.05] text-[40px] md:text-[68px] text-white text-balance max-w-4xl">
                Solo on Paper.<br />
                <span className="font-serif italic font-normal text-[#FF4A7D]">Together in Spirit.</span>
              </h1>

              <p className="text-[16px] md:text-[18px] leading-relaxed text-white/80 max-w-[62ch] text-balance">
                Discover safety-first small group trips for women. Experience local cultures, form lifetime friendships, and explore the world with our experienced Trip Leaders.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Link href="/trips" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-[#FF4A7D] hover:bg-[#E63E6E] text-white rounded-full font-semibold px-8 shadow-[0_8px_25px_-5px_rgba(255,74,125,0.4)]">
                    Explore Trips
                  </Button>
                </Link>
                <button onClick={() => openEnquiryModal()} className="w-full sm:w-auto focus:outline-none">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white rounded-full font-semibold px-8">
                    Find My Trip
                  </Button>
                </button>
              </div>
            </div>

            {/* Right side Quick Enquiry Widget */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-[430px] bg-white rounded-[32px] p-6 md:p-8 border border-[#F1D9D0]/50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-[#13253D]">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF4A7D] leading-tight">
                  Quick Enquiry • 2 Min • 2 Hours Response
                </div>
                <h3 className="font-display font-[800] text-[24px] md:text-[28px] text-[#13253D] leading-[1.15] mt-2 mb-6">
                  Where do you want to go next, Naari?
                </h3>

                {/* Popular Recommendation Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button 
                    onClick={() => openEnquiryModal()}
                    className="flex flex-col text-left p-3.5 rounded-2xl bg-[#FFF8F0] border border-[#FF4A7D]/10 hover:border-[#FF4A7D]/30 transition-all group/pill"
                  >
                    <span className="text-[9px] font-extrabold text-[#FF4A7D] uppercase tracking-wider">Most Loved</span>
                    <span className="text-sm font-extrabold text-[#13253D] mt-1 group-hover/pill:text-[#FF4A7D] transition-colors">Kashmir Tulip • 5D</span>
                    <span className="text-[11px] text-[#3D4A5E]/80 mt-1 font-semibold">₹21,999 • 8 seats left</span>
                  </button>

                  <button 
                    onClick={() => openEnquiryModal()}
                    className="flex flex-col text-left p-3.5 rounded-2xl bg-[#FFF8F0] border border-[#FF4A7D]/10 hover:border-[#FF4A7D]/30 transition-all group/pill"
                  >
                    <span className="text-[9px] font-extrabold text-[#FF4A7D] uppercase tracking-wider">Weekend</span>
                    <span className="text-sm font-extrabold text-[#13253D] mt-1 group-hover/pill:text-[#FF4A7D] transition-colors">Tirthan 3D • Solo</span>
                    <span className="text-[11px] text-[#3D4A5E]/80 mt-1 font-semibold">₹9,999 • Fri departure</span>
                  </button>
                </div>

                {/* Alert/Live Tag */}
                <div className="flex items-center justify-between gap-3 bg-[#13253D] text-white rounded-2xl p-4 mb-6 text-sm font-semibold shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <span>{enquiryCount} Naaris enquired last hour</span>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse shadow-sm" />
                </div>

                {/* Action CTA Button */}
                <button 
                  onClick={() => openEnquiryModal()}
                  className="w-full text-center rounded-full bg-[#FF4A7D] hover:bg-[#800F2D] text-white font-extrabold text-[15px] py-4 transition-all duration-300 shadow-[0_6px_20px_-4px_rgba(255,74,125,0.4)]"
                >
                  Check availability →
                </button>

                {/* Footer Disclosures */}
                <p className="text-[11px] text-[#3D4A5E]/70 text-center mt-4 font-medium leading-relaxed">
                  No spam, itinerary on WhatsApp. Cancellation policy transparent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Stats Bar Container (Centered overlap) */}
      <div className="relative -mt-16 z-20 max-w-[1100px] mx-auto px-4 md:px-8">
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(19,37,61,0.12)] border border-[#F1D9D0] p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-y divide-x-0 md:divide-y-0 md:divide-x divide-[#F1D9D0]/80">
            {/* Stat 1 */}
            <div className="flex flex-col items-center text-center p-2 md:p-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF0F4] border border-[#FF4A7D]/20 flex items-center justify-center text-[#FF4A7D] mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="font-display font-[800] text-[24px] md:text-[28px] text-[#13253D] leading-none">
                2,500+
              </div>
              <div className="text-[12px] md:text-[13px] font-bold text-[#FF4A7D] tracking-wider uppercase mt-2">
                Travelled
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center text-center p-2 md:p-4 pt-6 md:pt-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF0F4] border border-[#FF4A7D]/20 flex items-center justify-center text-[#FF4A7D] mb-3">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="font-display font-[800] text-[24px] md:text-[28px] text-[#13253D] leading-none">
                75+
              </div>
              <div className="text-[12px] md:text-[13px] font-bold text-[#FF4A7D] tracking-wider uppercase mt-2">
                Destinations
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center text-center p-2 md:p-4 pt-6 md:pt-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF0F4] border border-[#FF4A7D]/20 flex items-center justify-center text-[#FF4A7D] mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="font-display font-[800] text-[24px] md:text-[28px] text-[#13253D] leading-none">
                100%
              </div>
              <div className="text-[12px] md:text-[13px] font-bold text-[#FF4A7D] tracking-wider uppercase mt-2">
                Safety Rate
              </div>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col items-center text-center p-2 md:p-4 pt-6 md:pt-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF0F4] border border-[#FF4A7D]/20 flex items-center justify-center text-[#FF4A7D] mb-3">
                <Star className="w-5 h-5 fill-[#FF4A7D]" />
              </div>
              <div className="font-display font-[800] text-[24px] md:text-[28px] text-[#13253D] leading-none">
                4.9
              </div>
              <div className="text-[12px] md:text-[13px] font-bold text-[#FF4A7D] tracking-wider uppercase mt-2">
                Google Rating
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

