"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, ShieldCheck } from "lucide-react";
const Instagram = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const navLinks = [
  { href: "/trips", label: "Trips" },
  { href: "/destinations", label: "Destinations" },
  { href: "/safety", label: "Safety" },
  { href: "/about", label: "Our Story" },
  { href: "/blog", label: "Resources" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="w-full bg-[#5B2063] text-white text-[12px] tracking-wide">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium"><ShieldCheck className="w-4 h-4 text-[#FF8A2B]" /> Women-Crafted • MSME & Startup India Recognised • Bangalore</span>
            <span className="hidden md:inline-flex opacity-60">|</span>
            <span className="hidden md:inline-flex gap-2"><span>33K+ Instagram community</span><a href="https://instagram.com/tripnaari" target="_blank" className="underline underline-offset-2 hover:text-[#FF8A2B] inline-flex items-center gap-1"><Instagram className="w-3 h-3"/> @tripnaari</a></span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+919999999999" className="inline-flex items-center gap-1 hover:text-[#FF8A2B]"><Phone className="w-3 h-3"/> Emergency: +91 9XXXX XXXXX</a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-[#F1D9D0] glass">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#FF4A7D] text-white grid place-items-center font-black tracking-tighter text-[18px] group-hover:rotate-3 transition-transform">TN</div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-[22px] tracking-tight text-[#13253D]">TripNaari</span>
              <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-[#FF4A7D]">Travel Fearless</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-[14px] font-medium text-[#13253D]/80 hover:text-[#13253D] relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-[#FF4A7D] after:transition-all hover:after:w-full">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/contact" className="text-[14px] font-medium text-[#13253D] hover:underline">Support</Link>
            <Link href="/#enquiry">
              <Button size="md">Plan My Trip</Button>
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden w-10 h-10 grid place-items-center rounded-full border border-[#F1D9D0] bg-white">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-[#F1D9D0] bg-[#FFF8F0] px-4 py-6">
            <nav className="flex flex-col gap-4">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={()=>setOpen(false)} className="text-[18px] font-semibold text-[#13253D]">{l.label}</Link>
              ))}
              <div className="h-px bg-[#F1D9D0] my-2" />
              <Link href="/contact" className="text-[14px] font-medium">Contact & Support</Link>
              <Link href="/#enquiry" onClick={()=>setOpen(false)}><Button size="lg" className="w-full">Plan My Trip</Button></Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
