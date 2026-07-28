"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import Link from "next/link";

export default function StickyCTA() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 800) setShow(true);
      else setShow(false);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[60] transition-transform duration-300 ${show ? "translate-y-0" : "translate-y-full"}`}>
      <div className="mx-auto max-w-[1280px] px-4 pb-[max(16px,env(safe-area-inset-bottom))] md:px-8">
        <div className="rounded-[24px] bg-[#13253D] text-white p-4 md:p-3 flex items-center justify-between gap-4 shadow-[0_16px_48px_rgba(19,37,61,0.4)] border border-white/10">
          <div className="flex items-center gap-3">
            <div className="hidden md:grid w-10 h-10 rounded-full bg-[#FF4A7D] place-items-center font-bold">TN</div>
            <div className="leading-tight">
              <div className="font-semibold text-[14px] md:text-[15px]">Not sure which trip? Get free consult in 2 hours</div>
              <div className="text-[12px] text-white/60 hidden md:block">33K+ women community • Verified stays • Women trip leader 24x7 • Transparent refunds</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://wa.me/919999999999" target="_blank" className="hidden md:inline-flex w-11 h-11 rounded-full bg-[#25D366] grid place-items-center"><MessageCircle className="w-5 h-5" /></a>
            <Link href="/#enquiry"><Button size="md" className="shadow-none whitespace-nowrap">Enquire now</Button></Link>
            <button onClick={()=>setDismissed(true)} className="w-11 h-11 rounded-full bg-white/10 grid place-items-center"><X className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
