"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { tripPackagesSeed } from "@/lib/data";
import { submitEnquiry } from "@/lib/actions";

function EnquiryFormInner({ 
  source = "homepage", 
  defaultDestination = "", 
  defaultDate = "", 
  defaultMessage = "",
  pdfUrl = "",
  mode = ""
}: { 
  source?: string; 
  defaultDestination?: string; 
  defaultDate?: string; 
  defaultMessage?: string;
  pdfUrl?: string;
  mode?: string;
}) {
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<string | null>(defaultDate || null);
  const [travelMonth, setTravelMonth] = useState("");
  const [destination, setDestination] = useState(defaultDestination || "");

  // Multi-step controlled states
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [budget, setBudget] = useState("<10k");
  const [travelStyle, setTravelStyle] = useState("solo");
  const [message, setMessage] = useState(defaultMessage || "");
  const [consent, setConsent] = useState(false);

  const isStep1Valid = name.trim() !== "" && phone.length >= 10 && email.includes("@") && email.includes(".");
  const isStep2Valid = destination !== "" && travelMonth !== "";

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step < 3) setStep(prev => prev + 1);
  };

  const handlePrevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step > 1) setStep(prev => prev - 1);
  };

  // Update destination state when defaultDestination prop changes
  useEffect(() => {
    if (defaultDestination) {
      setDestination(defaultDestination);
    }
  }, [defaultDestination]);

  // Update selectedDate state when defaultDate prop changes
  useEffect(() => {
    if (defaultDate) {
      setSelectedDate(defaultDate);
      try {
        const dateObj = new Date(defaultDate);
        if (!isNaN(dateObj.getTime())) {
          const monthName = dateObj.toLocaleDateString("en-US", { month: 'short' });
          const year = dateObj.getFullYear();
          setTravelMonth(`${monthName} ${year}`);
        }
      } catch (e) {
        console.error("Error parsing defaultDate:", e);
      }
    }
  }, [defaultDate]);

  // Update message state when defaultMessage prop changes
  useEffect(() => {
    if (defaultMessage) {
      setMessage(defaultMessage);
    }
  }, [defaultMessage]);

  // Extract selected date from URL search parameters or the hash
  useEffect(() => {
    let date = searchParams.get("date");

    // Fallback: parse hash in case the hash has parameter (e.g. #enquiry?date=2026-08-10)
    if (!date && typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.includes("date=")) {
        const match = hash.match(/date=([^&?]+)/);
        if (match) {
          date = match[1];
        }
      }
    }

    if (date) {
      setSelectedDate(date);

      // Parse the month/year out of the date
      try {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          const monthName = dateObj.toLocaleDateString("en-US", { month: 'short' });
          const year = dateObj.getFullYear();
          setTravelMonth(`${monthName} ${year}`);
        }
      } catch (e) {
        console.error("Error parsing date from URL:", e);
      }

      // Smooth scroll to the enquiry form
      const element = document.getElementById("enquiry");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [searchParams]);

  async function performSubmit(formData: FormData, newWindow: Window | null) {
    setStatus("loading");
    setErrorMsg("");

    if (mode === "download") {
      if (!formData.get("destination")) {
        formData.set("destination", destination || "General");
      }
      if (!formData.get("travelMonth")) {
        formData.set("travelMonth", travelMonth || "Flexible");
      }
      if (!formData.get("consent")) {
        formData.set("consent", "on");
      }
    }

    try {
      const res = await submitEnquiry(formData);
      if (res.success) {
        setStatus("success");
        // Redirect the blank tab to the PDF URL
        if (newWindow && pdfUrl) {
          newWindow.location.href = pdfUrl;
        }
        // conversion event
        // @ts-ignore
        if (typeof window !== "undefined" && (window as any).gtag) {
          // @ts-ignore
          (window as any).gtag("event", "generate_lead", { destination: formData.get("destination") });
        }
      } else {
        if (newWindow) newWindow.close();
        setStatus("error");
        if (res.errors && res.errors.fieldErrors) {
          const firstError = Object.values(res.errors.fieldErrors).flat()[0];
          setErrorMsg(firstError || "Please check fields");
        } else {
          setErrorMsg("Please check fields - consent required");
        }
      }
    } catch (e:any) {
      if (newWindow) newWindow.close();
      setStatus("error");
      setErrorMsg(e.message || "Failed");
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let newWindow: Window | null = null;
    if (mode === "download" && pdfUrl) {
      // Open a blank tab synchronously during user click to bypass popup blockers
      newWindow = window.open("", "_blank");
    }
    const formData = new FormData(e.currentTarget);
    performSubmit(formData, newWindow);
  };

  if (status === "success") {
    return (
      <div className={
        source === "modal"
          ? "p-5 text-center"
          : "rounded-[24px] bg-white border border-[#F1D9D0] p-8 text-center"
      }>
        <div className="w-16 h-16 rounded-full bg-[#FFF0F4] border border-[#FF4A7D]/20 grid place-items-center mx-auto text-[#FF4A7D] text-2xl">✓</div>
        <h3 className="mt-4 font-display font-bold text-2xl text-[#13253D]">
          {mode === "download" ? "Download Started!" : "Received, Naari! We’ve got your back."}
        </h3>
        <p className="mt-2 text-[14px] text-[#3D4A5E] leading-relaxed">
          {mode === "download"
            ? "Your itinerary brochure PDF download has been triggered. If the download did not start automatically, please click the button below."
            : "Our sister will WhatsApp you in 2 hours (10AM-8PM). You’ll get itinerary, hotel sample, inclusions, cancellation timeline. No spam calls."}
        </p>

        {mode === "download" && pdfUrl && (
          <div className="mt-6">
            <a 
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF4A7D] hover:bg-[#E63E6E] text-white font-bold text-sm px-6 py-3.5 shadow-md transition duration-200 active:scale-[0.98]"
            >
              Click here if download didn't start
            </a>
          </div>
        )}

        {mode !== "download" && (
          <div className="mt-6 rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] p-4 text-left text-[13px] leading-relaxed text-[#3D4A5E]">
            <strong>Next steps:</strong><br/>
            1. Check WhatsApp (also spam folder for email)<br/>
            2. If urgent, DM @tripnaari on Instagram<br/>
            3. Hotel name confirmed 7 days before, guaranteed.
          </div>
        )}
      </div>
    );
  }

  // Setup travel month options, dynamically adding the selected date's month if it's missing
  const defaultMonths = [
    {value:"Oct 2026", label:"Oct 2026"}, {value:"Nov 2026", label:"Nov 2026"}, {value:"Dec 2026", label:"Dec 2026"}, {value:"Jan 2027", label:"Jan 2027"}, {value:"Flexible", label:"Flexible"},
  ];
  let monthsOptions = [...defaultMonths];
  if (selectedDate) {
    try {
      const dateObj = new Date(selectedDate);
      if (!isNaN(dateObj.getTime())) {
        const monthName = dateObj.toLocaleDateString("en-US", { month: 'short' });
        const year = dateObj.getFullYear();
        const computedMonth = `${monthName} ${year}`;
        if (!monthsOptions.some(m => m.value === computedMonth)) {
          monthsOptions = [{ value: computedMonth, label: computedMonth }, ...monthsOptions];
        }
      }
    } catch (e) {}
  }

  const formattedSelectedDate = selectedDate ? (() => {
    try {
      const dateObj = new Date(selectedDate);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch (e) {}
    return selectedDate;
  })() : null;

  return (
    <form 
      onSubmit={handleFormSubmit} 
      className={
        source === "modal"
          ? "text-left p-4 sm:p-6"
          : "rounded-[24px] bg-white border border-[#F1D9D0] p-6 md:p-8 card-shadow text-left"
      }
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-xl text-[#13253D]">
          {mode === "download" ? "Download Itinerary PDF" : "Find my trip — free"}
        </h3>
        <div className="text-[10px] rounded-full bg-[#13253D] text-white px-3 py-1 font-bold tracking-widest uppercase">
          {mode === "download" ? "1-step download" : "2 min form"}
        </div>
      </div>

      {/* Info banner for download mode */}
      {mode === "download" && (
        <div className="mb-5 text-[13px] leading-relaxed text-[#3D4A5E] bg-[#FFF8F0] border border-[#F1D9D0] p-3.5 rounded-2xl font-medium">
          Enter your contact details to download the complete PDF brochure.
        </div>
      )}

      {/* Progress Bar */}
      {mode !== "download" && (
        <div className="mb-6">
          <div className="flex justify-between items-center text-[10px] font-bold text-[#13253D]/50 uppercase mb-1.5">
            <span>Step {step} of 3: {step === 1 ? "Contact Details" : step === 2 ? "Preferences" : "About You"}</span>
            <span>{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full h-1 bg-[#FFF0F4] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#FF4A7D] to-[#FF758F] transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {formattedSelectedDate && (
        <div className="mb-5 rounded-2xl bg-[#FFF0F4] border border-[#FF4A7D]/15 p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="text-xs text-[#5B2063]">
            <span className="font-bold text-[#FF4A7D] block uppercase tracking-wider text-[10px] mb-0.5">Selected Departure Date</span>
            <span className="font-semibold text-sm text-[#13253D]">{formattedSelectedDate}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedDate(null);
              setTravelMonth("");
            }}
            className="rounded-full bg-[#FF4A7D]/10 hover:bg-[#FF4A7D]/20 text-[#FF4A7D] px-3 py-1 text-xs font-bold transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Hidden field to submit the exact date */}
      <input type="hidden" name="date" value={selectedDate || ""} />

      {/* STEP 1: Contact Details */}
      <div className={step === 1 ? "grid grid-cols-1 gap-4 animate-in fade-in duration-200" : "hidden"}>
        <Input 
          name="name" 
          label="Your name" 
          required 
          placeholder="Ananya Sharma" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input 
          name="phone" 
          label="Phone / WhatsApp" 
          required 
          placeholder="e.g. 9999999999" 
          value={phone}
          onInput={(e: React.FormEvent<HTMLInputElement>) => {
            e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
          }}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input 
          name="email" 
          label="Email" 
          required 
          type="email" 
          placeholder="you@email.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {mode === "download" && (
          <p className="text-[11px] text-[#3D4A5E]/70 leading-relaxed px-1 my-1">
            By downloading, you consent to TripNaari sending the PDF and trip updates. No spam, unsubscribe anytime.
          </p>
        )}

        {status==="error" && mode === "download" && (
          <div className="mt-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        {mode === "download" ? (
          <Button 
            type="submit" 
            disabled={!isStep1Valid}
            isLoading={status==="loading"}
            className="w-full mt-2 font-bold"
          >
            Get Itinerary & Download PDF →
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={handleNextStep} 
            disabled={!isStep1Valid}
            className="w-full mt-2 font-bold"
          >
            Continue to Trip Details →
          </Button>
        )}
      </div>

      {/* STEP 2: Trip Preferences */}
      <div className={step === 2 && mode !== "download" ? "grid grid-cols-1 gap-4 animate-in fade-in duration-200" : "hidden"}>
        <Input
          name="destination"
          label="Dream destination"
          required={mode !== "download"}
          placeholder="e.g. Kashmir, Kerala, Ladakh"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <Select
          name="travelMonth"
          label="Travel month"
          required={mode !== "download"}
          value={travelMonth}
          onChange={(e) => setTravelMonth(e.target.value)}
          options={monthsOptions}
        />
        <Input 
          name="travelers" 
          label="Number of travellers" 
          placeholder="e.g. 1, 2, 4+"
          value={travelers}
          onChange={(e) => setTravelers(e.target.value)}
        />
        <div className="flex gap-3 mt-2">
          <button 
            type="button" 
            onClick={handlePrevStep}
            className="flex-1 rounded-full border border-[#F1D9D0] text-[#13253D] font-bold text-xs py-3 hover:bg-[#FFF8F0]/30 transition"
          >
            ← Back
          </button>
          <Button 
            type="button" 
            onClick={handleNextStep} 
            disabled={!isStep2Valid}
            className="flex-[2] font-bold"
          >
            Preferences →
          </Button>
        </div>
      </div>

      {/* STEP 3: Personal Preferences */}
      <div className={step === 3 && mode !== "download" ? "grid grid-cols-1 gap-4 animate-in fade-in duration-200" : "hidden"}>
        <Select 
          name="budget" 
          label="Budget per person" 
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          options={[{value:"<10k", label:"< ₹10,000 weekend"}, {value:"10-20k", label:"₹10k-20k"}, {value:"20-35k", label:"₹20k-35k"}, {value:"35k+", label:"₹35k+ (premium/international)"}]} 
        />
        <Select 
          name="travelStyle" 
          label="Who are you?" 
          value={travelStyle}
          onChange={(e) => setTravelStyle(e.target.value)}
          options={[{value:"solo", label:"Solo first timer"}, {value:"mother-daughter", label:"Mother-daughter"}, {value:"friends", label:"Friends group"}, {value:"housewife", label:"Housewife exploring"}, {value:"professional", label:"Professional / entrepreneur"}, {value:"grandmother", label:"Adventurous grandmother"}]} 
        />
        <Textarea 
          name="message" 
          label="Anything we should know? Safety, food, kid-friendly?" 
          placeholder="Jain food, kid 14y, need ground floor..." 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        
        <label className="mt-2 flex gap-2 items-start text-[12px] leading-relaxed text-[#3D4A5E] cursor-pointer">
          <input 
            type="checkbox" 
            name="consent" 
            required={mode !== "download"}
            className="mt-1" 
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>I consent to TripNaari contacting me on WhatsApp/email. I have read cancellation-refund and safety promise. No spam, unsubscribe anytime.</span>
        </label>

        {status==="error" && <div className="mt-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{errorMsg}</div>}

        <div className="flex gap-3 mt-4">
          <button 
            type="button" 
            onClick={handlePrevStep}
            className="flex-1 rounded-full border border-[#F1D9D0] text-[#13253D] font-bold text-xs py-3 hover:bg-[#FFF8F0]/30 transition"
          >
            ← Back
          </button>
          <Button 
            type="submit" 
            size="lg" 
            className="flex-[2] font-bold" 
            isLoading={status==="loading"}
            disabled={!consent}
          >
            Get itinerary on WhatsApp →
          </Button>
        </div>
      </div>

      <div className="mt-4 text-[11px] text-center text-[#3D4A5E]/60">🔒 Data encrypted. 2 hours response 10AM-8PM. Emergency 24x7 for ongoing trips. By MSME & Startup India recognised.</div>
    </form>
  );
}

export default function EnquiryForm(props: { source?: string; defaultDestination?: string; defaultDate?: string; defaultMessage?: string; pdfUrl?: string; mode?: string }) {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-sm text-[#13253D]/60 bg-white rounded-[24px] border border-[#F1D9D0]">
        Loading enquiry form...
      </div>
    }>
      <EnquiryFormInner {...props} />
    </Suspense>
  );
}
