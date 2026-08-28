"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, ShieldCheck } from "lucide-react";
import { openEnquiryModal } from "@/lib/utils";

const Instagram = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);

const navLinks = [
  { href: "/trips", label: "Upcoming Trips" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/blog", label: "Blog" },
  { href: "/safety", label: "Safety First" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];


export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="w-full bg-[#800F2D] text-white text-[12px] tracking-wide">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-1 lg:py-1.5 xl:py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium"><ShieldCheck className="w-4 h-4 text-[#FF4A7D]" /> Women-Crafted • MSME & Startup India Recognised</span>
            <span className="hidden md:inline-flex opacity-60">|</span>
            <span className="hidden md:inline-flex gap-2"><span>33K+ Instagram community</span><a href="https://instagram.com/tripnaari" target="_blank" className="underline underline-offset-2 hover:text-[#FF4A7D] inline-flex items-center gap-1"><Instagram className="w-3 h-3" /> @tripnaari</a></span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+919282794457" className="inline-flex items-center gap-1 hover:text-[#FF4A7D]"><Phone className="w-3 h-3" /> Contact: +91 92827 94457</a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-[#F1D9D0] bg-white/95 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-[64px] lg:h-[70px] xl:h-[76px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.png" 
              alt="TripNaari Logo" 
              className="h-10 md:h-12 w-auto object-contain hover:opacity-90 transition-opacity" 
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-[15px] font-semibold text-[#13253D]/80 hover:text-[#800F2D] relative transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <button onClick={() => openEnquiryModal()} className="focus:outline-none">
              <Button size="md" className="rounded-full bg-[#800F2D] hover:bg-[#660C24] text-white font-semibold px-6 shadow-none">
                Customize my trip
              </Button>
            </button>
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden w-10 h-10 grid place-items-center rounded-full border border-[#F1D9D0] bg-white">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-[#F1D9D0] bg-white px-4 py-6">
            <nav className="flex flex-col gap-4">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-[16px] font-semibold text-[#13253D]">{l.label}</Link>
              ))}
              <div className="h-px bg-[#F1D9D0] my-2" />
              <button 
                onClick={() => {
                  setOpen(false);
                  openEnquiryModal();
                }}
                className="w-full text-left focus:outline-none"
              >
                <Button size="lg" className="w-full bg-[#800F2D] text-white rounded-full">Customize my trip</Button>
              </button>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

