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
      <div className="rounded-[32px] bg-[#5B2063] text-white p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="max-w-lg">
          <div className="text-[12px] font-bold tracking-widest uppercase text-[#FF8A2B]">Join 12k+ Naaris • No spam</div>
          <h3 className="mt-2 font-display font-bold text-[28px] leading-[0.95]">Get early bird deals & safety stories first.</h3>
          <p className="mt-3 text-white/70 text-sm leading-relaxed">New departures, refund policy updates, and honest travel diaries. WhatsApp community link after signup.</p>
        </div>
        {status==="success" ? (
          <div className="rounded-2xl bg-white text-[#13253D] p-6 w-full md:w-[380px] text-center font-medium">Added! Check your email for WhatsApp community invite 💌</div>
        ) : (
          <form action={action} className="w-full md:w-[380px] bg-white rounded-2xl p-2 flex gap-2">
            <input name="email" type="email" required placeholder="Your email" className="flex-1 px-4 py-3 rounded-xl outline-none text-[#13253D] text-sm" />
            <Button type="submit" size="md" isLoading={status==="loading"}>Join</Button>
          </form>
        )}
      </div>
    </section>
  );
}
