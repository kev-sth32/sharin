"use client";

import { useState, useEffect, useTransition } from "react";
import { unlockTripDetails } from "@/lib/actions";
import { ShieldCheck, Lock, Loader2 } from "lucide-react";

interface LeadGateProps {
  tripTitle: string;
  itineraryPdf?: string;
}

export default function LeadGate({ tripTitle, itineraryPdf }: LeadGateProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const isUnlocked = localStorage.getItem("tn_unlocked_trips") === "true";
    if (isUnlocked) {
      setIsLocked(false);
    } else {
      // Add visible-but-unreadable, scroll-lock classes to details section
      const content = document.getElementById("trip-details-content");
      if (content) {
        // Explicitly remove blur-md in case it was left over from a previous session/code state
        content.classList.remove("blur-md", "blur");
        content.classList.add("opacity-40", "pointer-events-none", "select-none", "max-h-[380px]", "overflow-hidden", "relative");

        // Dynamically add gradient overlay at the bottom of the content container
        if (!document.getElementById("leadgate-fade-overlay")) {
          const overlay = document.createElement("div");
          overlay.id = "leadgate-fade-overlay";
          overlay.className = "absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FFF8F0] to-transparent z-10 pointer-events-none";
          content.appendChild(overlay);
        }
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
          // Remove locking classes from details section
          const content = document.getElementById("trip-details-content");
          if (content) {
            content.classList.remove("opacity-40", "blur-md", "blur", "pointer-events-none", "select-none", "max-h-[380px]", "overflow-hidden");
            const overlay = document.getElementById("leadgate-fade-overlay");
            if (overlay) overlay.remove();
          }

          // Auto-download PDF if configured
          if (itineraryPdf) {
            const link = document.createElement("a");
            link.href = itineraryPdf;
            link.setAttribute("download", `${tripTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-itinerary.pdf`);
            link.setAttribute("target", "_blank");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
    <div className="relative z-40 -mt-28 mb-20 max-w-[500px] mx-auto px-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="bg-white rounded-[32px] p-5 sm:p-6 md:p-8 border border-[#FF4A7D]/25 shadow-[0_25px_60px_rgba(255,74,125,0.15)] text-[#13253D] w-full">
        <div className="flex justify-center mb-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-[#FF4A7D]/10 animate-ping" />
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4A7D] to-[#FF758F] flex items-center justify-center text-white shadow-md border border-[#FF4A7D]/25">
              <Lock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#FF4A7D] bg-[#FFF0F4] border border-[#FF4A7D]/15 px-3 py-1 rounded-full">
            🔐 Detailed Itinerary & Hotels Gated
          </span>
          <h3 className="font-display font-[800] text-[22px] md:text-[24px] leading-tight text-[#13253D] pt-1">
            Unlock & Download Itinerary
          </h3>
          <p className="text-xs text-[#3D4A5E] leading-relaxed max-w-sm mx-auto">
            Get the full day-by-day plan, inclusions, hotel previews, and automatically download the PDF itinerary for <strong className="text-[#13253D]">{tripTitle}</strong> instantly.
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
              className="w-full mt-1.5 rounded-xl border border-[#F1D9D0] bg-[#FFF8F0]/30 px-3.5 py-2.5 text-sm text-[#13253D] font-semibold focus:outline-none focus:border-[#FF4A7D] focus:ring-2 focus:ring-[#FF4A7D]/10 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#13253D]/50 block pl-1">Email Address</label>
            <input 
              required
              type="email" 
              name="email" 
              placeholder="name@gmail.com"
              className="w-full mt-1.5 rounded-xl border border-[#F1D9D0] bg-[#FFF8F0]/30 px-3.5 py-2.5 text-sm text-[#13253D] font-semibold focus:outline-none focus:border-[#FF4A7D] focus:ring-2 focus:ring-[#FF4A7D]/10 transition-all"
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
              className="w-full mt-1.5 rounded-xl border border-[#F1D9D0] bg-[#FFF8F0]/30 px-3.5 py-2.5 text-sm text-[#13253D] font-semibold focus:outline-none focus:border-[#FF4A7D] focus:ring-2 focus:ring-[#FF4A7D]/10 transition-all"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 text-center font-bold">{errorMsg}</p>
          )}

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full text-center rounded-full bg-gradient-to-r from-[#FF4A7D] to-[#FF758F] hover:from-[#E63E6E] hover:to-[#FF4A7D] disabled:opacity-70 text-white font-extrabold text-[14px] py-4 transition-all duration-300 shadow-[0_4px_15px_rgba(255,74,125,0.3)] hover:shadow-[0_6px_20px_rgba(255,74,125,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transform"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Unlocking...
              </>
            ) : (
              "Unlock & Download Itinerary →"
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
