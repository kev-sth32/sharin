"use client";
import { useState } from "react";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitContact, submitRefund } from "@/lib/actions";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [refundStatus, setRefundStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [contactErrors, setContactErrors] = useState<any>({});
  const [refundErrors, setRefundErrors] = useState<any>({});

  async function onContact(fd: FormData) {
    setStatus("loading");
    setContactErrors({});
    const res = await submitContact(fd);
    if (res.success) {
      setStatus("success");
    } else {
      setStatus("error");
      if (res.errors) {
        setContactErrors(res.errors.fieldErrors || {});
      }
    }
  }
  async function onRefund(fd: FormData) {
    setRefundStatus("loading");
    setRefundErrors({});
    const res = await submitRefund(fd);
    if (res.success) {
      setRefundStatus("success");
    } else {
      setRefundStatus("error");
      if (res.errors) {
        setRefundErrors(res.errors.fieldErrors || {});
      }
    }
  }

  return (
    <div className="bg-[#FFF8F0] py-16 md:py-24 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid lg:grid-cols-12 gap-12 items-start">
        {/* Left Column - Forms */}
        <div className="lg:col-span-7 space-y-10">
          <div>
            <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D] mb-3">
              Get in Touch
            </div>
            <h1 className="font-display font-[800] text-[32px] md:text-[44px] leading-[1.1] text-[#13253D]">
              Need help? We reply in 2 hours.
            </h1>
            <p className="mt-4 text-[#3D4A5E] text-[15px] leading-relaxed">
              Active support from 10 AM to 8 PM. Emergency response is active 24x7 for all ongoing trip departures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <form action={onContact} className="rounded-3xl bg-white border border-[#F1D9D0] p-6 md:p-8 space-y-4 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.05)]">
              <h3 className="font-display font-bold text-lg text-[#13253D]">Contact & Support</h3>
              <div className="space-y-4">
                <Input name="name" label="Name" required placeholder="Your name" error={contactErrors.name?.[0]} />
                <Input name="email" label="Email" required placeholder="you@email.com" error={contactErrors.email?.[0]} />
                <Input 
                  name="phone" 
                  label="Phone" 
                  placeholder="e.g. 9999999999" 
                  error={contactErrors.phone?.[0]}
                  onInput={(e: React.FormEvent<HTMLInputElement>) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                  }}
                />
                <Select name="category" label="Category" required options={[{value:"general", label:"General Inquiry"}, {value:"booking", label:"Booking Help"}, {value:"safety", label:"Safety Concern"}, {value:"refund", label:"Refund / Cancellation"}, {value:"feedback", label:"Escalation"}]} error={contactErrors.category?.[0]} />
                <Input name="subject" label="Subject" required placeholder="e.g. Need details for Kashmir trip" error={contactErrors.subject?.[0]} />
                <Textarea name="message" label="Message" required placeholder="Tell us how we can help..." error={contactErrors.message?.[0]} />
                <Button type="submit" isLoading={status==="loading"} className="w-full bg-[#FF4A7D] hover:bg-[#E63E6E] text-white rounded-full font-bold shadow-md">
                  Submit Form
                </Button>
                {status==="success" && (
                  <div className="text-sm text-green-600 font-bold bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    Received! We will WhatsApp you within 2 hours.
                  </div>
                )}
                {status==="error" && (
                  <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                    Submission failed. Please check the validation errors above.
                  </div>
                )}
              </div>
            </form>

            {/* Refund Form */}
            <form action={onRefund} className="rounded-3xl bg-white border-2 border-[#FF4A7D]/30 p-6 md:p-8 space-y-4 shadow-[0_10px_35px_-8px_rgba(255,74,125,0.08)]">
              <h3 className="font-display font-bold text-lg text-[#FF4A7D]">Refund / Cancellation</h3>
              <div className="space-y-4">
                <Input name="bookingId" label="Booking ID" placeholder="TN-XXXXX" error={refundErrors.bookingId?.[0]} />
                <Input name="email" label="Email booked with" required placeholder="you@email.com" error={refundErrors.email?.[0]} />
                <Input 
                  name="phone" 
                  label="Phone" 
                  required 
                  placeholder="e.g. 9999999999" 
                  error={refundErrors.phone?.[0]}
                  onInput={(e: React.FormEvent<HTMLInputElement>) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                  }}
                />
                <Textarea name="reason" label="Reason for Cancellation" required placeholder="Please share details..." error={refundErrors.reason?.[0]} />
                <div className="flex flex-col gap-1">
                  <label className="flex gap-2 text-[11px] leading-relaxed text-[#3D4A5E] items-start cursor-pointer font-medium">
                    <input type="checkbox" name="policyAcknowledged" required className="mt-1 shrink-0" />
                    <span>I have read the <a href="/policies/cancellation-refund" className="underline font-bold text-[#FF4A7D]">cancellation policy</a> and understand refund timeline is 7-10 days.</span>
                  </label>
                  {refundErrors.policyAcknowledged?.[0] && (
                    <p className="text-xs text-red-500 mt-1">{refundErrors.policyAcknowledged[0]}</p>
                  )}
                </div>
                <Button type="submit" size="md" variant="secondary" isLoading={refundStatus==="loading"} className="w-full bg-[#800F2D] hover:bg-[#660C24] text-white rounded-full font-bold shadow-md">
                  Request Refund
                </Button>
                {refundStatus==="success" && (
                  <div className="text-sm text-green-700 font-bold bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    Logged! Acknowledged in 24 hours, resolved in 5 days.
                  </div>
                )}
                {refundStatus==="error" && (
                  <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                    Failed to request refund. Please check the validation errors above.
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-6">
            {/* Emergency Box */}
            <div className="rounded-3xl bg-gradient-to-br from-[#800F2D] to-[#4A0516] text-white p-6 md:p-8 shadow-xl border border-white/5 space-y-4">
              <div className="font-display font-bold text-xl">Emergency — ongoing trips only</div>
              <p className="text-[14px] text-white/80 leading-relaxed">
                WhatsApp or call <a href="tel:+919282794457" className="underline font-bold hover:text-[#FF4A7D] transition-colors">+91 92827 94457</a> or <a href="tel:+919282696757" className="underline font-bold hover:text-[#FF4A7D] transition-colors">+91 92826 96757</a>. Pick up within 2 minutes. Operations callback within 30 minutes. Keep the emergency card from your Trip Leader handy.
              </p>
            </div>

            {/* Escalation Matrix Box */}
            <div className="rounded-3xl bg-white border border-[#F1D9D0] p-6 md:p-8 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.05)] space-y-4">
              <h3 className="font-display font-bold text-lg text-[#13253D] border-b border-[#F1D9D0]/50 pb-3">
                Escalation Matrix
              </h3>
              <ul className="space-y-3 text-[14px] text-[#3D4A5E] font-medium">
                <li className="flex gap-2">
                  <span className="text-[#FF4A7D] font-bold">1.</span>
                  <span><strong>Trip Leader:</strong> Instant assistance while on trip.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#FF4A7D] font-bold">2.</span>
                  <span><strong>Operations Support:</strong> 24x7 escalation via WhatsApp.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#FF4A7D] font-bold">3.</span>
                  <span><strong>Founder Email:</strong> founder@tripnaari.com (24h response).</span>
                </li>
              </ul>
              <p className="text-[12px] leading-relaxed text-[#3D4A5E]/70 pt-2">
                TripNaari HQ is based in Bangalore, India. We respond quickly on Instagram DMs during peak season hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
