"use client";

import { useState, useEffect, useTransition } from "react";
import { unlockTripDetails } from "@/lib/actions";
import { ShieldCheck, Lock, Loader2 } from "lucide-react";

interface LeadGateProps {
  tripTitle: string;
}

export default function LeadGate({ tripTitle }: LeadGateProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const isUnlocked = localStorage.getItem("tn_unlocked_trips") === "true";
    if (isUnlocked) {
      setIsLocked(false);
    } else {
      // Add blur and scroll-lock classes to details section
      const content = document.getElementById("trip-details-content");
      if (content) {
        content.classList.add("blur-md", "pointer-events-none", "select-none", "max-h-[500px]", "overflow-hidden");
      }
    }
  }, []);

  const handleUnlock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await unlockTripDetails(formData);
        if (res.success) {
          localStorage.setItem("tn_unlocked_trips", "true");
          setIsLocked(false);
          // Remove blur from details section
          const content = document.getElementById("trip-details-content");
          if (content) {
            content.classList.remove("blur-md", "pointer-events-none", "select-none", "max-h-[500px]", "overflow-hidden");
          }
        } else {
          setErrorMsg(res.error || "An error occurred. Please try again.");
        }
      } catch (err) {
        setErrorMsg("Failed to connect. Please check your connection.");
      }
    });
  };

  if (!isLocked) return null;

  return (
    <div className="relative z-40 -mt-8 mb-20 max-w-[550px] mx-auto px-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-[#FF4A7D]/20 shadow-[0_20px_50px_rgba(255,74,125,0.12)] text-[#13253D]">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] border border-[#FF4A7D]/20 flex items-center justify-center text-[#FF4A7D]">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#FF4A7D]">
            🔐 Detailed Itinerary & Hotels Gated
          </span>
          <h3 className="font-display font-[800] text-[22px] md:text-[24px] leading-tight text-[#13253D]">
            Unlock Full Trip Details
          </h3>
          <p className="text-xs text-[#3D4A5E] leading-relaxed max-w-sm mx-auto">
            Unlock the day-by-day sisterhood plan, dynamic inclusion details, and verified hotel previews for <strong className="text-[#13253D]">{tripTitle}</strong> instantly.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="mt-6 space-y-4">
          <input type="hidden" name="destination" value={tripTitle} />
          
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#13253D]/50 block pl-1">Your Name</label>
            <input 
              required
              type="text" 
              name="name" 
              placeholder="e.g. Priyanjali Sharma"
              className="w-full mt-1.5 rounded-xl border border-[#F1D9D0] bg-[#FFF8F0]/30 px-3.5 py-2.5 text-sm text-[#13253D] font-semibold focus:outline-none focus:border-[#FF4A7D]"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#13253D]/50 block pl-1">Email Address</label>
            <input 
              required
              type="email" 
              name="email" 
              placeholder="name@gmail.com"
              className="w-full mt-1.5 rounded-xl border border-[#F1D9D0] bg-[#FFF8F0]/30 px-3.5 py-2.5 text-sm text-[#13253D] font-semibold focus:outline-none focus:border-[#FF4A7D]"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#13253D]/50 block pl-1">WhatsApp / Phone Number</label>
            <input 
              required
              type="tel" 
              name="phone" 
              placeholder="e.g. 9999999999"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
              }}
              className="w-full mt-1.5 rounded-xl border border-[#F1D9D0] bg-[#FFF8F0]/30 px-3.5 py-2.5 text-sm text-[#13253D] font-semibold focus:outline-none focus:border-[#FF4A7D]"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 text-center font-bold">{errorMsg}</p>
          )}

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full text-center rounded-full bg-[#FF4A7D] hover:bg-[#800F2D] disabled:bg-[#FF4A7D]/70 text-white font-extrabold text-[14px] py-3.5 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Unlocking...
              </>
            ) : (
              "Unlock Details Instantly →"
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[#F1D9D0]/50 flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#800F2D] leading-none">
          <ShieldCheck className="w-4 h-4 text-[#FF4A7D]" />
          <span>Startup India Recognised • 100% Privacy</span>
        </div>
      </div>
    </div>
  );
}
