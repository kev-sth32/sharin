"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqsSeed } from "@/lib/data";

export default function FAQSection() {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-[#FFF8F0] py-12 md:py-16 lg:py-20 xl:py-24">
      <div className="max-w-[860px] mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D] mb-4">
            FAQ
          </div>
          <h2 className="font-display font-[800] text-[28px] sm:text-[32px] lg:text-[38px] xl:text-[44px] leading-[1.1] text-[#13253D]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqsSeed.map((faq, i) => (
            <div key={i} className="rounded-2xl border border-[#F1D9D0] bg-white overflow-hidden shadow-[0_5px_15px_-5px_rgba(19,37,61,0.03)]">
              <button 
                onClick={() => setOpen(open === i ? -1 : i)} 
                className="w-full text-left flex items-center justify-between gap-4 p-5 md:p-6 transition-colors hover:bg-[#FFF0F4]/20"
              >
                <span className="font-display font-bold text-[16px] md:text-[18px] leading-tight text-[#13253D]">
                  {faq.question}
                </span>
                <ChevronDown className={`w-5 h-5 text-[#FF4A7D] shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-[14px] leading-relaxed text-[#3D4A5E] animate-in slide-in-from-top-1 duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

