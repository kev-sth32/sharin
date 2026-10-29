"use client";

import { useState, useEffect, useRef } from "react";
import { 
  QrCode, 
  Camera, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  MapPin, 
  Calendar, 
  RefreshCw, 
  Clock, 
  ShieldCheck, 
  Phone,
  Sparkles,
  Check,
  X
} from "lucide-react";

interface PassItem {
  id: number;
  ticketId: string;
  tripTitle: string;
  tripSlug: string;
  passengerName: string;
  passengerPhone: string;
  departureDate: string;
  travelersCount: number;
  totalAmount: number;
  depositPaid: number;
  balanceDue: number;
  balanceStatus: "cleared" | "pending";
  checkInStatus: "confirmed" | "checked_in";
  checkedInAt?: string;
  checkedInBy?: string;
  emergencyContact?: string;
}

export default function CheckInManager() {
  const [passes, setPasses] = useState<PassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBatch, setFilterBatch] = useState("all");
  const [ticketInput, setTicketInput] = useState("");
  const [scannedResult, setScannedResult] = useState<PassItem | null>(null);
  const [scanMessage, setScanMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loadPasses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/check-in");
      const data = await res.json();
      if (data.success && data.passes) {
        setPasses(data.passes);
      }
    } catch (err) {
      console.error("Failed to load passes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPasses();
  }, []);

  // Cleanup video stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Camera Scanning with BarcodeDetector
  const startCameraScanner = async () => {
    setScanMessage(null);
    setIsScanningActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Check if BarcodeDetector is supported
      if ("BarcodeDetector" in window) {
        // @ts-ignore
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const scanInterval = setInterval(async () => {
          if (!videoRef.current || !isScanningActive) {
            clearInterval(scanInterval);
            return;
          }
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const rawVal = barcodes[0].rawValue;
              // Extract ticket ID
              const match = rawVal.match(/TN-PASS-\d+/i) || rawVal.match(/TN-PASS-[a-zA-Z0-9]+/i);
              const foundId = match ? match[0] : rawVal.trim();
              clearInterval(scanInterval);
              stopCameraScanner();
              handleVerifyAndCheckIn(foundId);
            }
          } catch {}
        }, 300);
      }
    } catch (err: any) {
      console.warn("Camera access error:", err);
      setIsScanningActive(false);
      setScanMessage({
        type: "error",
        text: "Could not access camera. Please enter Ticket ID manually below."
      });
    }
  };

  const stopCameraScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanningActive(false);
  };

  const handleVerifyAndCheckIn = async (ticketIdToProcess: string) => {
    if (!ticketIdToProcess.trim()) return;
    setActionLoading(true);
    setScanMessage(null);

    try {
      const res = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticketIdToProcess.trim(),
          checkedInBy: "Sneha Kapur (Certified Trip Leader)",
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setScanMessage({
          type: "error",
          text: data.error || `Ticket ${ticketIdToProcess} not found or invalid.`
        });
        setScannedResult(null);
      } else {
        setScannedResult(data.pass);
        setScanMessage({
          type: "success",
          text: `✓ Passenger ${data.pass.passengerName} checked in successfully!`
        });
        // Update local list
        setPasses(prev => prev.map(p => p.ticketId === data.pass.ticketId ? data.pass : p));
        setTicketInput("");
      }
    } catch (err: any) {
      setScanMessage({ type: "error", text: err.message || "Network error checking in ticket." });
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered passes for manifest table
  const filteredPasses = passes.filter(p => {
    const matchesSearch = 
      p.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.passengerPhone.includes(searchQuery) ||
      p.ticketId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBatch = filterBatch === "all" || p.tripTitle.toLowerCase().includes(filterBatch.toLowerCase());
    return matchesSearch && matchesBatch;
  });

  const checkedInCount = passes.filter(p => p.checkInStatus === "checked_in").length;
  const totalCount = passes.length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-[#13253D] to-[#1E3A60] rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider mb-1">
            <QrCode className="w-4 h-4 text-[#FF4A7D]" /> Trip Leader Gate Check-In Center
          </div>
          <h1 className="text-2xl font-display font-bold text-white">
            On-Site Departure & Boarding Scanner
          </h1>
          <p className="text-gray-300 text-xs mt-1">
            Scan passenger QR tickets at airport gate or assembly meeting point, verify IDs, and track live check-ins.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
          <div className="text-center">
            <span className="text-[11px] text-gray-300 uppercase tracking-wider block">Checked In</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">{checkedInCount}</span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center">
            <span className="text-[11px] text-gray-300 uppercase tracking-wider block">Total Booked</span>
            <span className="text-2xl font-bold font-mono text-white">{totalCount}</span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center">
            <span className="text-[11px] text-gray-300 uppercase tracking-wider block">Manifest Rate</span>
            <span className="text-xl font-bold text-[#FF4A7D]">
              {totalCount > 0 ? `${Math.round((checkedInCount / totalCount) * 100)}%` : "0%"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live QR Scanner & Manual Ticket Check */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-display font-bold text-lg text-[#13253D] flex items-center justify-between">
              <span>Gate Scanner</span>
              <span className="text-xs bg-rose-50 text-[#FF4A7D] font-bold px-2.5 py-1 rounded-full">
                Live Camera
              </span>
            </h3>

            {/* Video Viewfinder Container */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center border-2 border-dashed border-gray-300">
              {isScanningActive ? (
                <>
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                  <div className="absolute inset-0 pointer-events-none border-2 border-[#FF4A7D] m-8 rounded-xl animate-pulse" />
                  <button
                    onClick={stopCameraScanner}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center p-4">
                  <Camera className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <button
                    onClick={startCameraScanner}
                    className="bg-[#FF4A7D] hover:bg-[#E03A6A] text-white text-xs font-bold px-4 py-2 rounded-full transition shadow-md"
                  >
                    Activate Camera Scanner
                  </button>
                  <p className="text-[10px] text-gray-400 mt-2">Requires camera permissions on mobile phone</p>
                </div>
              )}
            </div>

            {/* Manual Ticket Input */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Or Search / Scan Ticket ID:
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyAndCheckIn(ticketInput);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="e.g. TN-PASS-847291"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF4A7D]/30 uppercase"
                />
                <button
                  type="submit"
                  disabled={actionLoading || !ticketInput.trim()}
                  className="bg-[#13253D] hover:bg-[#1C365A] text-white text-xs font-bold px-4 py-2 rounded-xl transition disabled:opacity-50"
                >
                  {actionLoading ? "Checking..." : "Verify & Check-In"}
                </button>
              </form>
            </div>

            {/* Result / Scan Message Alert */}
            {scanMessage && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                  scanMessage.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
              >
                {scanMessage.type === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="font-medium">{scanMessage.text}</span>
              </div>
            )}

            {/* Scanned Passenger Card Preview */}
            {scannedResult && (
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E9E4DC] text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-sm text-[#13253D] block">{scannedResult.passengerName}</span>
                    <span className="text-gray-500 font-mono">{scannedResult.passengerPhone}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    CHECKED-IN
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-2 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-400 block">Expedition</span>
                    <span className="font-semibold text-gray-800">{scannedResult.tripTitle}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Travelers</span>
                    <span className="font-semibold text-gray-800">{scannedResult.travelersCount} Person(s)</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Balance Status</span>
                    {scannedResult.balanceDue > 0 ? (
                      <span className="text-rose-600 font-bold">₹{scannedResult.balanceDue.toLocaleString("en-IN")} Pending</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">Cleared</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400 block">Checked In At</span>
                    <span className="font-medium text-gray-700">
                      {scannedResult.checkedInAt ? new Date(scannedResult.checkedInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Passenger Manifest Table */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-lg text-[#13253D]">
                  Passenger Manifest
                </h3>
                <p className="text-xs text-gray-400">
                  Confirmed travelers registered for upcoming departures.
                </p>
              </div>

              <button
                onClick={loadPasses}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#13253D] bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {/* Search & Batch Filter */}
            <div className="flex flex-col sm:flex-row gap-2 text-xs">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search passenger name, phone, ticket ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF4A7D]/30"
                />
              </div>

              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4A7D]/30"
              >
                <option value="all">All Trips</option>
                <option value="kashmir">Kashmir</option>
                <option value="ladakh">Ladakh</option>
                <option value="meghalaya">Meghalaya</option>
                <option value="kerala">Kerala</option>
              </select>
            </div>

            {/* Manifest List */}
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden max-h-[460px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-xs text-gray-400">Loading passenger manifest...</div>
              ) : filteredPasses.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">No matching passengers found.</div>
              ) : (
                filteredPasses.map((p) => (
                  <div
                    key={p.ticketId}
                    className={`p-4 flex items-center justify-between gap-4 transition ${
                      p.checkInStatus === "checked_in" ? "bg-emerald-50/40" : "hover:bg-gray-50/70"
                    }`}
                  >
                    <div className="space-y-1 text-xs min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 truncate">{p.passengerName}</span>
                        <span className="font-mono text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {p.ticketId}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">
                        {p.tripTitle} • {p.departureDate}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span>Phone: {p.passengerPhone}</span>
                        <span>•</span>
                        <span>{p.travelersCount} Person(s)</span>
                        <span>•</span>
                        {p.balanceDue > 0 ? (
                          <span className="text-rose-600 font-bold">₹{p.balanceDue.toLocaleString("en-IN")} Due</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">Balance Cleared</span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {p.checkInStatus === "checked_in" ? (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                            <Check className="w-3 h-3 text-emerald-600" /> Checked In
                          </span>
                          <span className="block text-[9px] text-gray-400 mt-0.5">
                            {p.checkedInAt ? new Date(p.checkedInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Today"}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleVerifyAndCheckIn(p.ticketId)}
                          disabled={actionLoading}
                          className="bg-[#13253D] hover:bg-[#1E3A60] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-sm"
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
