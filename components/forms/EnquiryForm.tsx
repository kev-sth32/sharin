"use client";
import { useState } from "react";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { destinationsSeed } from "@/lib/data";
import { submitEnquiry } from "@/lib/actions";

export default function EnquiryForm({ source = "homepage" }: { source?: string }) {
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(formData: FormData) {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await submitEnquiry(formData);
      if (res.success) {
        setStatus("success");
        // conversion event
        // @ts-ignore
        if (typeof window !== "undefined" && (window as any).gtag) {
          // @ts-ignore
          (window as any).gtag("event", "generate_lead", { destination: formData.get("destination") });
        }
      } else {
        setStatus("error");
        setErrorMsg("Please check fields - consent required");
      }
    } catch (e:any) {
      setStatus("error");
      setErrorMsg(e.message || "Failed");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[24px] bg-white border border-[#F1D9D0] p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FFF0F4] border border-[#FF4A7D]/20 grid place-items-center mx-auto text-[#FF4A7D] text-2xl">✓</div>
        <h3 className="mt-4 font-display font-bold text-2xl text-[#13253D]">Received, Naari! We’ve got your back.</h3>
        <p className="mt-2 text-[14px] text-[#3D4A5E] leading-relaxed">Our sister will WhatsApp you in 2 hours (10AM-8PM). You’ll get itinerary, hotel sample, inclusions, cancellation timeline. No spam calls.</p>
        <div className="mt-6 rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] p-4 text-left text-[13px] leading-relaxed text-[#3D4A5E]">
          <strong>Next steps:</strong><br/>
          1. Check WhatsApp (also spam folder for email)<br/>
          2. If urgent, DM @tripnaari on Instagram<br/>
          3. Hotel name confirmed 7 days before, guaranteed.
        </div>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="rounded-[24px] bg-white border border-[#F1D9D0] p-6 md:p-8 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-xl text-[#13253D]">Find my trip — free</h3>
        <div className="text-[11px] rounded-full bg-[#13253D] text-white px-3 py-1 font-bold tracking-widest uppercase">2 min form</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="name" label="Your name" required placeholder="Ananya Sharma" />
        <Input name="phone" label="Phone / WhatsApp" required placeholder="+91 98..." />
        <Input name="email" label="Email" required type="email" placeholder="you@email.com" className="md:col-span-2" />
        <Select name="destination" label="Dream destination" required options={destinationsSeed.map(d=>({value:d.slug, label:d.name}))} />
        <Select name="travelMonth" label="Travel month" required options={[
          {value:"Oct 2026", label:"Oct 2026"}, {value:"Nov 2026", label:"Nov 2026"}, {value:"Dec 2026", label:"Dec 2026"}, {value:"Jan 2027", label:"Jan 2027"}, {value:"Flexible", label:"Flexible"},
        ]} />
        <Select name="travelers" label="Travelers" options={[{value:"1", label:"1 - solo"}, {value:"2", label:"2 - friends"}, {value:"3", label:"3"}, {value:"4", label:"4+"}]} />
        <Select name="budget" label="Budget per person" options={[{value:"<10k", label:"< ₹10,000 weekend"}, {value:"10-20k", label:"₹10k-20k"}, {value:"20-35k", label:"₹20k-35k"}, {value:"35k+", label:"₹35k+ (premium/international)"}]} />
        <Select name="travelStyle" label="Who are you?" options={[{value:"solo", label:"Solo first timer"}, {value:"mother-daughter", label:"Mother-daughter"}, {value:"friends", label:"Friends group"}, {value:"housewife", label:"Housewife exploring"}, {value:"professional", label:"Professional / entrepreneur"}, {value:"grandmother", label:"Adventurous grandmother"}]} />
        <Textarea name="message" label="Anything we should know? Safety, food, kid-friendly?" placeholder="Jain food, kid 14y, need ground floor..." className="md:col-span-2" />
      </div>

      <label className="mt-5 flex gap-2 items-start text-[12px] leading-relaxed text-[#3D4A5E] cursor-pointer">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>I consent to TripNaari contacting me on WhatsApp/email. I have read cancellation-refund and safety promise. No spam, unsubscribe anytime.</span>
      </label>

      {status==="error" && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{errorMsg}</div>}

      <Button type="submit" size="lg" className="w-full mt-6" isLoading={status==="loading"}>Get itinerary on WhatsApp →</Button>

      <div className="mt-3 text-[11px] text-center text-[#3D4A5E]/60">🔒 Data encrypted. 2 hours response 10AM-8PM. Emergency 24x7 for ongoing trips. By MSME & Startup India recognised.</div>
    </form>
  );
}
