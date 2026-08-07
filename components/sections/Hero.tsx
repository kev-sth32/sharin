"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, Calendar, Briefcase } from "lucide-react";
import { openEnquiryModal } from "@/lib/utils";

const WhatsAppIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437.002 9.861-4.416 9.864-9.852.002-2.63-1.023-5.101-2.885-6.963C16.388 1.928 13.916.904 11.285.902c-5.439 0-9.863 4.417-9.867 9.853-.001 1.73.457 3.419 1.328 4.908l-.989 3.613 3.708-.973zm11.58-6.143c-.302-.15-1.788-.882-2.057-.98-.268-.099-.463-.149-.658.15-.195.299-.754.98-.925 1.178-.17.199-.341.224-.643.075-.302-.15-1.273-.469-2.427-1.498-.897-.8-1.502-1.787-1.678-2.087-.177-.3-.019-.462.13-.611.135-.134.302-.35.454-.523.151-.174.2-.299.302-.498.101-.2.05-.374-.025-.523-.075-.15-.658-1.588-.901-2.173-.236-.57-.497-.493-.68-.5-.187-.008-.401-.01-.614-.01s-.56.08-.853.4c-.293.32-1.12 1.1-1.12 2.68 0 1.58 1.147 3.11 1.307 3.32.16.21 2.257 3.45 5.47 4.83.763.329 1.36.526 1.822.673.768.243 1.467.209 2.02.127.616-.093 1.788-.732 2.042-1.44.254-.707.254-1.314.178-1.44-.076-.124-.268-.199-.57-.348z"/>
  </svg>
);

const InstagramIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

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
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 pt-8 pb-16 lg:pt-8 lg:pb-18 xl:pt-10 xl:pb-20 2xl:pt-16 2xl:pb-32">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start lg:pt-2">
            {/* Left side text */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-4 md:space-y-5 lg:space-y-6">
              <div className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase text-white/90">
                Women-Only Travel Experience
              </div>

              <h1 className="font-display font-[800] tracking-tight leading-[1.05] text-[32px] sm:text-[42px] md:text-[50px] xl:text-[56px] 2xl:text-[68px] text-white text-balance max-w-4xl">
                Solo on Paper.<br />
                <span className="font-serif italic font-normal text-[#FF4A7D]">Together in Spirit.</span>
              </h1>

              <p className="text-[15px] xl:text-[18px] leading-relaxed text-white/80 max-w-[62ch] text-balance">
                Discover safety-first small group trips for women. Experience local cultures, form lifetime friendships, and explore the world with our experienced Trip Leaders.
              </p>

              <div className="mt-4 lg:mt-6 xl:mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <a
                  href="https://chat.whatsapp.com/IdH8AumJHbQ3A8th9VkQts?s=cl&p=a&mlu=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button size="lg" className="w-full sm:w-auto bg-[#FF4A7D] hover:bg-[#E63E6E] text-white rounded-full font-semibold px-8 shadow-[0_8px_25px_-5px_rgba(255,74,125,0.4)] inline-flex items-center justify-center gap-2">
                    <WhatsAppIcon className="w-5 h-5" />
                    Join Community
                  </Button>
                </a>
                <a
                  href="https://instagram.com/tripnaari"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white rounded-full font-semibold px-8 inline-flex items-center justify-center gap-2">
                    <InstagramIcon className="w-5 h-5" />
                    Follow on Instagram
                  </Button>
                </a>
              </div>
            </div>

            {/* Right side Quick Enquiry Widget */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-[430px] bg-white rounded-[32px] p-5 lg:p-4.5 xl:p-6 2xl:p-8 border border-[#F1D9D0]/50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-[#13253D]">
                <div className="text-[10px] xl:text-[11px] font-extrabold uppercase tracking-wider text-[#FF4A7D] leading-tight">
                  Quick Enquiry • 2 Min • 2 Hours Response
                </div>
                <h3 className="font-display font-[800] text-[19px] sm:text-[21px] lg:text-[19px] xl:text-[24px] 2xl:text-[28px] text-[#13253D] leading-[1.15] mt-2 mb-3.5 2xl:mb-5">
                  Where do you want to go next, Naari?
                </h3>

                {/* Popular Recommendation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5 mb-3.5 2xl:mb-5">
                  <button 
                    onClick={() => openEnquiryModal()}
                    className="flex flex-col text-left p-3 lg:p-2.5 xl:p-3.5 rounded-2xl bg-[#FFF8F0] border border-[#FF4A7D]/10 hover:border-[#FF4A7D]/30 transition-all group/pill cursor-pointer"
                  >
                    <span className="text-[9px] font-extrabold text-[#FF4A7D] uppercase tracking-wider">Most Loved</span>
                    <span className="text-[13px] sm:text-[14px] lg:text-[13px] xl:text-[14px] font-extrabold text-[#13253D] mt-1 group-hover/pill:text-[#FF4A7D] transition-colors">Kashmir Tulip • 5D</span>
                    <span className="text-[10px] sm:text-[11px] lg:text-[10px] xl:text-[11px] text-[#3D4A5E]/80 mt-1 font-semibold">₹21,999 • 8 seats left</span>
                  </button>

                  <button 
                    onClick={() => openEnquiryModal()}
                    className="flex flex-col text-left p-3 lg:p-2.5 xl:p-3.5 rounded-2xl bg-[#FFF8F0] border border-[#FF4A7D]/10 hover:border-[#FF4A7D]/30 transition-all group/pill cursor-pointer"
                  >
                    <span className="text-[9px] font-extrabold text-[#FF4A7D] uppercase tracking-wider">Weekend</span>
                    <span className="text-[13px] sm:text-[14px] lg:text-[13px] xl:text-[14px] font-extrabold text-[#13253D] mt-1 group-hover/pill:text-[#FF4A7D] transition-colors">Tirthan 3D • Solo</span>
                    <span className="text-[10px] sm:text-[11px] lg:text-[10px] xl:text-[11px] text-[#3D4A5E]/80 mt-1 font-semibold">₹9,999 • Fri departure</span>
                  </button>
                </div>

                {/* Alert/Live Tag */}
                <div className="flex items-center justify-between gap-3 bg-[#13253D] text-white rounded-2xl p-3 lg:p-2.5 xl:p-3.5 2xl:p-4 mb-3.5 2xl:mb-5 text-xs sm:text-sm lg:text-xs xl:text-sm font-semibold shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <span>{enquiryCount} Naaris enquired last hour</span>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse shadow-sm" />
                </div>

                {/* Action CTA Button */}
                <button 
                  onClick={() => openEnquiryModal()}
                  className="w-full text-center rounded-full bg-[#FF4A7D] hover:bg-[#E63E6E] text-white font-extrabold text-[14px] xl:text-[15px] py-3 xl:py-3.5 2xl:py-4 transition-all duration-300 shadow-[0_6px_20px_-4px_rgba(255,74,125,0.4)] cursor-pointer"
                >
                  Check availability →
                </button>

                {/* Footer Disclosures */}
                <p className="text-[11px] text-[#3D4A5E]/70 text-center mt-3 lg:mt-3.5 font-medium leading-relaxed">
                  No spam, itinerary on WhatsApp. Cancellation policy transparent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Stats Bar Container (Centered overlap) */}
      <div className="relative -mt-8 md:-mt-12 lg:-mt-16 z-20 max-w-[1100px] mx-auto px-4 md:px-8">
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(19,37,61,0.12)] border border-[#F1D9D0] p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 md:gap-4 md:divide-x md:divide-[#F1D9D0]/80">
            {/* Stat 1 */}
            <div className="flex flex-col items-center text-center p-4 pb-6 border-r border-b border-[#F1D9D0]/80 md:border-0 md:p-4">
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
            <div className="flex flex-col items-center text-center p-4 pb-6 border-b border-[#F1D9D0]/80 md:border-0 md:p-4">
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
            <div className="flex flex-col items-center text-center p-4 pt-6 border-r border-[#F1D9D0]/80 md:border-0 md:p-4">
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
            <div className="flex flex-col items-center text-center p-4 pt-6 md:border-0 md:p-4">
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

