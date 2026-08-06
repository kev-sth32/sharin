"use client";
import { useState } from "react";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitCustomTrip } from "@/lib/actions";

const interests = ["Mountains", "Beaches", "Desert", "Backwaters", "Culture", "Spiritual", "Trek", "Wellness", "Food", "Shopping"];
const activities = ["Trek", "Rafting", "Surf", "Houseboat", "Yoga", "Cooking class", "Art workshop", "Village walk"];

export default function CustomTripBuilder() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");

  function toggle(arr: string[], setArr: any, val: string) {
    if (arr.includes(val)) setArr(arr.filter((v: string)=>v!==val));
    else setArr([...arr, val]);
  }

  async function onSubmit(formData: FormData) {
    setStatus("loading");
    selectedInterests.forEach(v=>formData.append("interests", v));
    selectedActivities.forEach(v=>formData.append("activities", v));
    const res = await submitCustomTrip(formData);
    if (res.success) setStatus("success");
    else setStatus("error");
  }

  if (status==="success") {
    return (
      <div className="rounded-[24px] bg-[#13253D] text-white p-8 text-center">
        <h3 className="font-display font-bold text-2xl">Your custom sisterhood trip is brewing!</h3>
        <p className="mt-2 text-white/70">We’ll craft options with hotel previews & safety plan in 6 hours.</p>
      </div>
    );
  }

  return (
    <section id="custom-trip" className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="rounded-[32px] bg-white border border-[#F1D9D0] overflow-hidden grid md:grid-cols-12">
        <div className="md:col-span-5 bg-[#FFF0F4] p-8 md:p-10">
          <div className="text-[12px] font-bold tracking-widest uppercase text-[#FF4A7D]">Custom trip builder • Women-first</div>
          <h2 className="mt-3 font-display font-bold text-[32px] leading-[0.9] text-[#13253D]">Design your trip like you design your life — on your terms.</h2>
          <p className="mt-4 text-[14px] leading-relaxed text-[#3D4A5E]">Private groups for 6+ Naaris, moms & kids, corporate women offsites. We handle safety checklist, food, comfort level, and transparent costing.</p>
          <div className="mt-8 space-y-3">
            <div className="rounded-xl bg-white border border-[#F1D9D0] p-4 flex gap-3"><div className="w-8 h-8 rounded-full bg-[#FFF8F0] grid place-items-center">🏡</div><div><div className="font-semibold text-sm">Women-led stays</div><div className="text-xs text-[#3D4A5E]">We pitch 2 sample hotels with timeline</div></div></div>
            <div className="rounded-xl bg-white border border-[#F1D9D0] p-4 flex gap-3"><div className="w-8 h-8 rounded-full bg-[#FFF8F0] grid place-items-center">🛡️</div><div><div className="font-semibold text-sm">Safety briefing</div><div className="text-xs text-[#3D4A5E]">Escalation card + local contacts</div></div></div>
            <div className="rounded-xl bg-white border border-[#F1D9D0] p-4 flex gap-3"><div className="w-8 h-8 rounded-full bg-[#FFF8F0] grid place-items-center">💳</div><div><div className="font-semibold text-sm">Transparent pricing</div><div className="text-xs text-[#3D4A5E]">Inclusions, exclusions, cancellation slabs upfront</div></div></div>
          </div>
        </div>

        <form action={onSubmit} className="md:col-span-7 p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="name" label="Name" required placeholder="Your name" />
            <Input 
              name="phone" 
              label="WhatsApp" 
              required 
              placeholder="e.g. 9999999999" 
              onInput={(e: React.FormEvent<HTMLInputElement>) => {
                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
              }}
            />
            <Input name="email" label="Email" required type="email" placeholder="you@email.com" />
            <Input name="dates" label="Tentative dates" required placeholder="e.g. 12-18 Dec or flexible" />
            <Select name="groupType" label="Group type" required options={[{value:"solo-joined", label:"Solo → join women group"}, {value:"friends-private", label:"Friends private (6+)"}, {value:"mother-daughter", label:"Mother-daughter"}, {value:"family-women-led", label:"Family women-led"}, {value:"corporate", label:"Corporate women offsite"}]} />
            <Select name="comfortLevel" label="Comfort level" required options={[{value:"backpacker", label:"Backpacker (homestays)"}, {value:"comfort", label:"Comfort (3-star+)"}, {value:"premium", label:"Premium (4-star+)"}]} />
          </div>

          <div className="mt-6">
            <div className="text-[13px] font-semibold uppercase tracking-wide text-[#13253D]/80">Interests (select at least 1)</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {interests.map(i=>(
                <button key={i} type="button" onClick={()=>toggle(selectedInterests, setSelectedInterests, i)} className={`rounded-full px-3 py-1.5 text-xs font-medium border ${selectedInterests.includes(i)?"bg-[#FF4A7D] text-white border-[#FF4A7D]":"bg-white border-[#F1D9D0] text-[#13253D]"}`}>{i}</button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-[13px] font-semibold uppercase tracking-wide text-[#13253D]/80">Activities loved</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {activities.map(a=>(
                <button key={a} type="button" onClick={()=>toggle(selectedActivities, setSelectedActivities, a)} className={`rounded-full px-3 py-1.5 text-xs font-medium border ${selectedActivities.includes(a)?"bg-[#5B2063] text-white border-[#5B2063]":"bg-white border-[#F1D9D0] text-[#13253D]"}`}>{a}</button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="foodPreferences" label="Food preferences" placeholder="Jain, vegan, kid-friendly..." />
            <Input name="budget" label="Budget per person" placeholder="e.g. 20-30k" />
            <Input name="safetyNeeds" label="Safety needs if any" placeholder="Ground floor, no night travel..." className="md:col-span-2" />
          </div>

          <label className="mt-4 flex gap-2 items-center text-[12px] text-[#3D4A5E]"><input type="checkbox" name="kidFriendly" /> Kid-friendly required (12+ kids allowed on women-led trips)</label>

          <Textarea name="message" label="Anything else we should know?" placeholder="We are 8 friends from Bangalore, 2 mothers with daughters..." className="mt-4" />

          <Button type="submit" size="lg" className="w-full mt-6" isLoading={status==="loading"}>Get custom plan →</Button>
          {status==="error" && <div className="mt-3 text-sm text-red-600">Select at least one interest and fill required fields.</div>}
        </form>
      </div>
    </section>
  );
}
