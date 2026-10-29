"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Users, 
  Phone, 
  Printer, 
  CheckCircle, 
  AlertTriangle,
  QrCode,
  Sparkles,
  Heart,
  Share2,
  Clock,
  Compass
} from "lucide-react";

interface BoardingPassProps {
  pass: {
    ticketId: string;
    tripTitle: string;
    tripSlug: string;
    passengerName: string;
    passengerPhone: string;
    passengerEmail?: string;
    emergencyContact?: string;
    departureDate: string;
    travelersCount: number;
    tripLeaderName: string;
    pickupLocation: string;
    totalAmount: number;
    depositPaid: number;
    balanceDue: number;
    balanceDueDate?: string;
    balanceStatus: "cleared" | "pending";
    checkInStatus: "confirmed" | "checked_in";
    checkedInAt?: string;
    qrCodeDataUrl?: string;
    createdAt: string;
  };
}

export default function BoardingPassCard({ pass }: BoardingPassProps) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `TripNaari Boarding Pass - ${pass.tripTitle}`,
        text: `My verified boarding pass for ${pass.tripTitle}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6 px-4 font-sans print:my-0 print:px-0">
      {/* Action Bar (Hidden in Print) */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <a
          href="/"
          className="text-xs font-bold text-gray-500 hover:text-[#13253D] flex items-center gap-1"
        >
          ← Return to TripNaari
        </a>

        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? "Link Copied!" : "Share Pass"}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-[#13253D] hover:bg-[#1C365A] text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main Boarding Pass Card */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 relative print:shadow-none print:border-2 print:border-gray-300">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#13253D] via-[#1E3A60] to-[#13253D] p-6 text-white relative">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl tracking-tight text-white">
                  Trip<span className="text-[#FF4A7D]">Naari</span>
                </span>
                <span className="bg-[#FF4A7D]/20 border border-[#FF4A7D]/40 text-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Women-Only Expedition
                </span>
              </div>
              <p className="text-gray-300 text-xs mt-1">Official Boarding Pass & Reservation Voucher</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-300 uppercase tracking-widest block font-bold">Ticket ID</span>
              <span className="font-mono text-base font-extrabold text-[#FF4A7D] tracking-wider">
                {pass.ticketId}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-4 flex items-center gap-2">
            {pass.checkInStatus === "checked_in" ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Checked-In at Gate
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-200 border border-rose-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#FF4A7D]" /> Seat Confirmed • Ready for Assembly
              </span>
            )}
          </div>
        </div>

        {/* Flight-Style Notch Dividers */}
        <div className="relative bg-white py-2">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FAF7F2] border-r border-gray-200 print:hidden" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FAF7F2] border-l border-gray-200 print:hidden" />
          <div className="border-b-2 border-dashed border-gray-200 mx-6" />
        </div>

        {/* Passenger & Trip Details */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-semibold">Passenger</span>
              <span className="text-base font-bold text-[#13253D] block truncate">{pass.passengerName}</span>
              <span className="text-xs text-gray-500 font-mono">{pass.passengerPhone}</span>
            </div>

            <div>
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-semibold">Travelers</span>
              <span className="text-base font-bold text-[#13253D] block">{pass.travelersCount} Seat(s)</span>
              <span className="text-xs text-[#FF4A7D] font-semibold">Female Travelers</span>
            </div>

            <div>
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-semibold">Departure Date</span>
              <span className="text-base font-bold text-[#13253D] block">{pass.departureDate}</span>
              <span className="text-xs text-gray-500">Scheduled Departure</span>
            </div>

            <div>
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-semibold">Trip Leader</span>
              <span className="text-base font-bold text-[#13253D] block truncate">{pass.tripLeaderName.split("(")[0]}</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Lead
              </span>
            </div>
          </div>

          {/* Destination Banner */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE6DD] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#13253D] text-white flex items-center justify-center font-bold">
                <Compass className="w-5 h-5 text-[#FF4A7D]" />
              </div>
              <div>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-bold">Confirmed Expedition</span>
                <span className="text-base font-display font-bold text-[#13253D]">{pass.tripTitle}</span>
              </div>
            </div>
          </div>

          {/* QR Code & Assembly Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
            {/* QR Code Container */}
            <div className="md:col-span-5 text-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
              {pass.qrCodeDataUrl ? (
                <img
                  src={pass.qrCodeDataUrl}
                  alt={`QR Code for ${pass.ticketId}`}
                  className="w-44 h-44 mx-auto rounded-xl shadow-sm border border-gray-200 bg-white p-2"
                />
              ) : (
                <div className="w-44 h-44 mx-auto flex items-center justify-center bg-gray-200 rounded-xl text-xs text-gray-500">
                  QR Loading...
                </div>
              )}
              <span className="text-[11px] text-gray-500 font-mono font-bold mt-2 block">
                SCAN FOR GATE CHECK-IN
              </span>
              <span className="text-[10px] text-gray-400">Offline Scannable by Tour Leader</span>
            </div>

            {/* Assembly & Balance Notes */}
            <div className="md:col-span-7 space-y-4 text-xs">
              <div>
                <span className="text-gray-400 uppercase tracking-wider font-bold block mb-1">
                  Assembly & Meeting Point:
                </span>
                <p className="font-semibold text-gray-800 bg-rose-50/50 p-3 rounded-xl border border-rose-100 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#FF4A7D] shrink-0 mt-0.5" />
                  <span>{pass.pickupLocation}</span>
                </p>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Package:</span>
                  <span className="font-bold text-gray-800">₹{pass.totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deposit Paid:</span>
                  <span className="font-bold text-emerald-600">₹{pass.depositPaid.toLocaleString("en-IN")} (Verified)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200">
                  <span className="text-gray-500">Remaining Balance:</span>
                  {pass.balanceDue > 0 ? (
                    <span className="font-bold text-[#FF4A7D]">
                      ₹{pass.balanceDue.toLocaleString("en-IN")} (Due {pass.balanceDueDate})
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Fully Cleared
                    </span>
                  )}
                </div>
              </div>

              {/* SOS Emergency Hotline */}
              <div className="flex items-center gap-2 text-gray-600 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E9E4DC]">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>24/7 SOS Desk:</strong> {pass.emergencyContact}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 text-center text-[11px] text-gray-400">
          <p>
            TripNaari Experiences Pvt Ltd • Valid Photo ID required at assembly • Strictly Women-Only Safe Space
          </p>
        </div>
      </div>
    </div>
  );
}
