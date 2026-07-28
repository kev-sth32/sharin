"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqsSeed } from "@/lib/data";

export default function FAQSection() {
  const [open, setOpen] = useState(0);
  return (
    <section className="max-w-[1000px] mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D]">Transparent answers, not marketing spin</div>
        <h2 className="mt-3 font-display font-bold text-[32px] md:text-[44px] leading-[0.9] text-[#13253D]">Your questions, answered honestly.</h2>
        <p className="mt-4 text-[#3D4A5E]">We updated these after reading every single public critique. If you don’t see answer, WhatsApp us — we add to site in 48 hours.</p>
      </div>

      <div className="mt-10 space-y-3">
        {faqsSeed.map((faq, i)=>(
          <div key={i} className="rounded-2xl border border-[#F1D9D0] bg-white overflow-hidden">
            <button onClick={()=>setOpen(open===i? -1:i)} className="w-full text-left flex items-center justify-between gap-4 p-5 md:p-6">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-[#FFF8F0] border border-[#F1D9D0] grid place-items-center text-[11px] font-bold shrink-0">{i+1}</div>
                <span className="font-semibold text-[15px] md:text-[16px] leading-tight text-[#13253D]">{faq.question}</span>
              </div>
              <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open===i?"rotate-180":""}`} />
            </button>
            {open===i && (
              <div className="px-6 md:px-[68px] pb-6 text-[14px] leading-relaxed text-[#3D4A5E]">
                {faq.answer}
                <div className="mt-3 inline-flex rounded-full bg-[#FFF0F4] border border-[#FF4A7D]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#FF4A7D]">{faq.category}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
