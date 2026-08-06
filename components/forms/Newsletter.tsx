"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitNewsletter } from "@/lib/actions";

export default function Newsletter() {
  const [status, setStatus] = useState<"idle"|"loading"|"success">("idle");
  async function action(fd: FormData) {
    setStatus("loading");
    const res = await submitNewsletter(fd);
    if (res.success) setStatus("success");
  }
  return (
    <section id="newsletter" className="max-w-[1280px] mx-auto px-4 md:px-8 py-12">
      <div className="rounded-[32px] bg-gradient-to-r from-[#FF4A7D] via-[#E63E6E] to-[#800F2D] text-white p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between shadow-[0_20px_50px_-12px_rgba(255,74,125,0.25)]">
        <div className="max-w-xl text-center md:text-left space-y-3">
          <div className="text-[12px] font-bold tracking-[0.25em] uppercase text-white/80">
            NEWSLETTER
          </div>
          <h3 className="font-display font-[800] text-[28px] md:text-[36px] leading-[1.1] text-white">
            Get TripNaari Updates
          </h3>
          <p className="text-white/80 text-sm md:text-[15px] leading-relaxed max-w-md">
            Sign up for our newsletter to receive travel tips, special offers, and new trip announcements.
          </p>
        </div>

        {status==="success" ? (
          <div className="rounded-3xl bg-white text-[#13253D] p-6 w-full md:w-[400px] text-center font-bold shadow-md animate-in fade-in zoom-in-95 duration-200">
            Added! Check your email for WhatsApp community invite 💌
          </div>
        ) : (
          <form action={action} className="w-full md:w-[400px] flex flex-col sm:flex-row bg-transparent sm:bg-white/10 border-0 sm:border border-white/20 rounded-none sm:rounded-2xl p-0 sm:p-2 gap-3 sm:gap-2 backdrop-blur-sm">
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="Enter your email" 
              className="w-full sm:flex-1 bg-white/10 sm:bg-transparent border border-white/20 sm:border-0 px-4 py-3.5 sm:py-3 rounded-2xl sm:rounded-xl outline-none text-white placeholder-white/60 text-sm focus:border-white transition-all" 
            />
            <Button 
              type="submit" 
              size="md" 
              isLoading={status==="loading"}
              className="w-full sm:w-auto bg-white hover:bg-[#FFF8F0] text-[#800F2D] font-bold rounded-2xl sm:rounded-xl shadow-none px-6 py-3.5 sm:py-2"
            >
              Subscribe Now
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

