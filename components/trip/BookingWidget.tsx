"use client";
import { useState } from "react";
import { Zap, ChevronDown, FileText, MessageCircle, Calendar } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface Departure {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  price?: number;
  seatsBooked: number;
  seatsTotal: number;
}

interface BookingWidgetProps {
  priceFrom: number;
  priceOriginal?: number;
  departures: Departure[];
  tripSlug: string;
  tripTitle: string;
  itineraryPdf?: string;
}

export default function BookingWidget({
  priceFrom,
  priceOriginal,
  departures,
  tripSlug,
  tripTitle,
  itineraryPdf,
}: BookingWidgetProps) {
  // Sort departures by date
  const sortedDepartures = [...departures].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Set default selected batch
  const initialBatch = sortedDepartures.find((d) => d.status !== "sold_out" && d.status !== "cancelled") || sortedDepartures[0];
  const [selectedBatch, setSelectedBatch] = useState<Departure | null>(initialBatch || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Format batch option label
  const getBatchLabelNoStatus = (d: Departure) => {
    const start = new Date(d.startDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' });
    const end = new Date(d.endDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });
    return `${start} — ${end}`;
  };

  const getBatchLabelFormatted = (d: Departure) => {
    const dates = getBatchLabelNoStatus(d);
    let statusText = "";
    if (d.status === "filling_fast") statusText = " (Filling Fast)";
    else if (d.status === "sold_out") statusText = " (Sold Out)";
    else if (d.status === "cancelled") statusText = " (Cancelled)";
    else statusText = " (Open)";
    return `${dates}${statusText}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "filling_fast":
        return <span className="bg-[#FFF0F4] text-[#FF4A7D] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#FF4A7D]/10 tracking-wide uppercase">Filling Fast</span>;
      case "sold_out":
        return <span className="bg-gray-100 text-gray-400 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wide uppercase">Sold Out</span>;
      case "cancelled":
        return <span className="bg-red-50 text-red-500 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wide uppercase">Cancelled</span>;
      default:
        return <span className="bg-[#E8FDF3] text-[#007038] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#A7F3D0]/20 tracking-wide uppercase">Open</span>;
    }
  };

  const handleBookNow = () => {
    // Open the enquiry modal by dispatching the custom event
    const eventDetail = {
      destination: tripSlug,
      date: selectedBatch ? selectedBatch.startDate : "",
    };
    window.dispatchEvent(
      new CustomEvent("open-enquiry-modal", { detail: eventDetail })
    );
  };

  const handleTalkToExpert = () => {
    const batchInfo = selectedBatch
      ? ` starting on ${new Date(selectedBatch.startDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}`
      : "";
    const text = encodeURIComponent(
      `Hi TripNaari, I am interested in the ${tripTitle} trip${batchInfo}. Please share details.`
    );
    window.open(`https://wa.me/919282794457?text=${text}`, "_blank");
  };

  const handleDownloadPdf = () => {
    const eventDetail = {
      destination: tripSlug,
      date: selectedBatch ? selectedBatch.startDate : "",
      message: `Requested PDF brochure for ${tripTitle}.`,
      itineraryPdf: itineraryPdf || "/uploads/itinerary-placeholder.pdf",
      mode: "download",
    };
    window.dispatchEvent(
      new CustomEvent("open-enquiry-modal", { detail: eventDetail })
    );
  };

  // Determine price based on selected batch
  const currentPrice = selectedBatch?.price || priceFrom;
  const emiCost = Math.round(currentPrice / 10); // Rough EMI estimate for label

  return (
    <div className="rounded-[32px] bg-white border border-[#F1D9D0] p-6 shadow-[0_20px_50px_rgba(255,74,125,0.05),0_4px_12px_rgba(19,37,61,0.02)] space-y-6">
      
      {/* Easy EMI plans available banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#E8FDF3] to-[#F0FDF4] border border-[#DCFCE7] px-4 py-3.5 flex items-center gap-3 shadow-[0_2px_8px_rgba(37,211,102,0.03)]">
        <Zap className="w-5 h-5 text-[#00A854] shrink-0 fill-[#00A854]/10 animate-pulse" />
        <span className="text-[13px] font-[800] text-[#007038] tracking-tight">
          Easy EMI plans available from {formatINR(emiCost)}/month
        </span>
      </div>

      {/* Pricing display */}
      <div className="space-y-1.5">
        <div className="text-[10px] tracking-[0.15em] font-[900] text-[#3D4A5E]/50 uppercase">
          ALL-INCLUSIVE CUSTOM PRICE
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-4xl font-[900] text-[#6D0C24] tracking-tight">
            {formatINR(currentPrice)}
          </span>
          <span className="text-sm font-bold text-[#3D4A5E]/60">
            / person
          </span>
        </div>
        {priceOriginal && priceOriginal > currentPrice && (
          <div className="flex items-center gap-2 mt-1">
            <span className="line-through text-sm font-medium text-[#3D4A5E]/40">
              {formatINR(priceOriginal)}
            </span>
            <span className="bg-[#FF4A7D]/10 text-[#FF4A7D] text-[10px] font-extrabold px-3 py-1 rounded-full border border-[#FF4A7D]/15">
              Save {formatINR(priceOriginal - currentPrice)}
            </span>
          </div>
        )}
      </div>

      {/* Available travel batches selector */}
      <div className="space-y-2.5 relative">
        <div className="text-[10px] tracking-[0.15em] font-[900] text-[#3D4A5E]/50 uppercase">
          AVAILABLE TRAVEL BATCHES (2026)
        </div>
        
        {sortedDepartures.length > 0 ? (
          <div>
            {/* Custom styled select replacement */}
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`w-full rounded-2xl border ${
                dropdownOpen ? "border-[#FF4A7D] ring-4 ring-[#FF4A7D]/5 bg-white" : "border-[#F1D9D0] bg-[#FFF8F0]/10 hover:bg-[#FFF8F0]/30"
              } px-4 py-4 flex items-center justify-between text-left text-[13px] font-[800] text-[#13253D] transition-all duration-300 outline-none shadow-sm`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#FF4A7D] shrink-0" />
                <span>{selectedBatch ? getBatchLabelFormatted(selectedBatch) : "Select a batch"}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#13253D]/50 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-[#F1D9D0] rounded-2xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-[#F1D9D0]/30 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                {sortedDepartures.map((d) => {
                  const isSelected = selectedBatch?.id === d.id;
                  const isClosed = d.status === "sold_out" || d.status === "cancelled";
                  return (
                    <button
                      key={d.id}
                      type="button"
                      disabled={isClosed}
                      onClick={() => {
                        setSelectedBatch(d);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3.5 text-[13px] font-[800] transition-all duration-200 flex justify-between items-center ${
                        isSelected ? "bg-[#FFF0F4]/60 text-[#FF4A7D]" : "text-[#13253D] hover:bg-[#FFF8F0]/30"
                      } ${isClosed ? "opacity-40 cursor-not-allowed bg-gray-50/50" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className={`w-4.5 h-4.5 shrink-0 ${isSelected ? "text-[#FF4A7D]" : "text-[#3D4A5E]/40"}`} />
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-[#13253D]">{getBatchLabelNoStatus(d)}</span>
                          <span className="text-[11px] text-[#3D4A5E]/70 font-semibold mt-0.5">
                            Price: <span className="text-[#800F2D]">{formatINR(d.price || priceFrom)}</span>
                            {d.price && d.price < priceFrom ? (
                              <span className="ml-2 text-[9px] bg-green-50 text-green-700 border border-green-200 px-1 py-0.2 rounded font-bold uppercase">Off-season Deal</span>
                            ) : d.price && d.price > priceFrom ? (
                              <span className="ml-2 text-[9px] bg-[#FFF0F4] text-[#FF4A7D] border border-[#FF4A7D]/10 px-1 py-0.2 rounded font-bold uppercase">Peak Season</span>
                            ) : null}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {getStatusBadge(d.status)}
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A7D] shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-dashed border-[#F1D9D0] bg-[#FFF8F0]/10 px-4 py-4 text-center text-xs font-bold text-[#3D4A5E]/70">
            No fixed departures. Please request custom dates.
          </div>
        )}
      </div>

      {/* Call to action buttons */}
      <div className="space-y-3 pt-2">
        {/* Book This Curated Circuit */}
        <button
          type="button"
          onClick={handleBookNow}
          disabled={selectedBatch?.status === "sold_out" || selectedBatch?.status === "cancelled"}
          className="w-full text-center rounded-2xl bg-gradient-to-r from-[#FF4A7D] via-[#FF608F] to-[#E63E6E] hover:from-[#E63E6E] hover:to-[#D22A5A] text-white font-[800] text-sm py-4 shadow-[0_6px_25px_-4px_rgba(255,74,125,0.35)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          Book This Curated Circuit
        </button>

        {/* Download Itinerary Brochure PDF */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FFF0F4] hover:bg-[#FFE0E9] text-[#FF4A7D] font-[800] text-xs py-3.5 border border-[#FF4A7D]/10 hover:border-[#FF4A7D]/20 transition-all duration-300 active:scale-[0.99]"
        >
          <FileText className="w-4 h-4 text-[#FF4A7D]" />
          Download Itinerary Brochure PDF
        </button>

        {/* Talk to an Expert */}
        <button
          type="button"
          onClick={handleTalkToExpert}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#E8FDF3] hover:bg-[#DCFCE7] text-[#075E54] font-[800] text-xs py-3.5 border border-[#25D366]/10 hover:border-[#25D366]/20 transition-all duration-300 active:scale-[0.99]"
        >
          <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]/10" />
          Talk to an Expert
        </button>
      </div>
    </div>
  );
}
