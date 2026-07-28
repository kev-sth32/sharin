"use client";
import { useState } from "react";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitContact, submitRefund } from "@/lib/actions";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [refundStatus, setRefundStatus] = useState<"idle"|"loading"|"success"|"error">("idle");

  async function onContact(fd: FormData) {
    setStatus("loading");
    const res = await submitContact(fd);
    if (res.success) setStatus("success"); else setStatus("error");
  }
  async function onRefund(fd: FormData) {
    setRefundStatus("loading");
    const res = await submitRefund(fd);
    if (res.success) setRefundStatus("success"); else setRefundStatus("error");
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 grid lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7">
        <h1 className="font-display font-bold text-[32px] leading-tight">Need help? We reply in 2 hours (10AM-8PM). Emergency 24x7.</h1>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <form action={onContact} className="rounded-2xl bg-white border border-[#F1D9D0] p-6">
            <h3 className="font-semibold">Contact / Support form</h3>
            <div className="mt-4 space-y-3">
              <Input name="name" label="Name" required placeholder="Your name" />
              <Input name="email" label="Email" required placeholder="you@email.com" />
              <Input name="phone" label="Phone" placeholder="+91..." />
              <Select name="category" label="Category" required options={[{value:"general", label:"General"}, {value:"booking", label:"Booking help"}, {value:"safety", label:"Safety concern"}, {value:"refund", label:"Refund / Cancellation"}, {value:"feedback", label:"Feedback / Escalation"}]} />
              <Input name="subject" label="Subject" required placeholder="e.g. Need hotel name for Kashmir 12 Dec" />
              <Textarea name="message" label="Message" required placeholder="Tell us..." />
              <Button type="submit" isLoading={status==="loading"}>Submit →</Button>
              {status==="success" && <div className="text-sm text-green-600">Received! We’ll WhatsApp in 2 hours.</div>}
            </div>
          </form>

          <form action={onRefund} className="rounded-2xl bg-[#FFF0F4] border border-[#FF4A7D]/20 p-6">
            <h3 className="font-semibold text-[#FF4A7D]">Refund / Cancellation request</h3>
            <div className="mt-4 space-y-3">
              <Input name="bookingId" label="Booking ID (if any)" placeholder="TN-XXXXX" />
              <Input name="email" label="Email booked with" required placeholder="you@email.com" />
              <Input name="phone" label="Phone" required placeholder="+91..." />
              <Textarea name="reason" label="Reason" required placeholder="Emergency / Change plan — be honest, we care" />
              <label className="flex gap-2 text-xs items-start"><input type="checkbox" name="policyAcknowledged" required className="mt-1" /> I read <a href="/policies/cancellation-refund" className="underline">cancellation policy</a> and understand timeline 7-10 days</label>
              <Button type="submit" size="md" variant="secondary" isLoading={refundStatus==="loading"}>Request refund →</Button>
              {refundStatus==="success" && <div className="text-sm text-green-700">Refund request logged. Ack in 24h, resolve in 5 days.</div>}
            </div>
          </form>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="sticky top-28 space-y-6">
          <div className="rounded-2xl bg-[#13253D] text-white p-6">
            <div className="font-bold">Emergency — ongoing trips only</div>
            <div className="mt-3 text-sm text-white/80">WhatsApp/call +91 9XXXX 9XXXX (2 min response). Operations manager callback in 30 min. Keep emergency card from trip leader handy.</div>
          </div>
          <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6 text-sm text-[#3D4A5E] leading-relaxed">
            <div className="font-bold text-[#13253D]">Escalation matrix</div>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>Level 1: Trip Leader — instant on trip</li>
              <li>Level 2: Operations 24x7 — 2 min pickup</li>
              <li>Level 3: Founder — founder@tripnaari.com (24h response)</li>
            </ul>
            <div className="mt-4">Bangalore HQ: 10AM-8PM. We respond faster on Instagram DM @tripnaari during peak.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
