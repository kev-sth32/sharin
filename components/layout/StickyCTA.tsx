"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";

const WhatsAppIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437.002 9.861-4.416 9.864-9.852.002-2.63-1.023-5.101-2.885-6.963C16.388 1.928 13.916.904 11.285.902c-5.439 0-9.863 4.417-9.867 9.853-.001 1.73.457 3.419 1.328 4.908l-.989 3.613 3.708-.973zm11.58-6.143c-.302-.15-1.788-.882-2.057-.98-.268-.099-.463-.149-.658.15-.195.299-.754.98-.925 1.178-.17.199-.341.224-.643.075-.302-.15-1.273-.469-2.427-1.498-.897-.8-1.502-1.787-1.678-2.087-.177-.3-.019-.462.13-.611.135-.134.302-.35.454-.523.151-.174.2-.299.302-.498.101-.2.05-.374-.025-.523-.075-.15-.658-1.588-.901-2.173-.236-.57-.497-.493-.68-.5-.187-.008-.401-.01-.614-.01s-.56.08-.853.4c-.293.32-1.12 1.1-1.12 2.68 0 1.58 1.147 3.11 1.307 3.32.16.21 2.257 3.45 5.47 4.83.763.329 1.36.526 1.822.673.768.243 1.467.209 2.02.127.616-.093 1.788-.732 2.042-1.44.254-.707.254-1.314.178-1.44-.076-.124-.268-.199-.57-.348z"/>
  </svg>
);

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
            <div className="hidden md:flex w-10 h-10 rounded-full bg-[#FF4A7D] items-center justify-center font-bold shrink-0">TN</div>
            <div className="leading-tight">
              <div className="font-semibold text-[14px] md:text-[15px]">Not sure which trip? Get free consult in 2 hours</div>
              <div className="text-[12px] text-white/60 hidden md:block">33K+ women community • Verified stays • Women trip leader 24x7 • Transparent refunds</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a 
              href="https://wa.me/919999999999" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden md:flex w-11 h-11 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white items-center justify-center transition-all hover:scale-105"
            >
              <WhatsAppIcon className="w-5 h-5 text-white" />
            </a>
            <Link href="/#enquiry">
              <Button size="md" className="shadow-none whitespace-nowrap">
                Enquire now
              </Button>
            </Link>
            <button 
              onClick={() => setDismissed(true)} 
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

