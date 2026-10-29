"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { 
  ShieldCheck, 
  QrCode, 
  Upload, 
  CheckCircle, 
  Copy, 
  Check, 
  Smartphone, 
  Building2, 
  Clock, 
  Sparkles, 
  AlertCircle,
  FileText,
  User,
  Phone,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import Image from "next/image";

interface PaymentPortalProps {
  initialQuoteId?: string;
  initialTripTitle?: string;
  initialTripSlug?: string;
  initialTravelers?: number;
  initialTotal?: number;
  initialDeposit?: number;
  initialDepartureDate?: string;
  initialPaymentType?: "deposit" | "balance" | "full";
}

export default function PaymentPortal({
  initialQuoteId = "TN-RESERVE-2026",
  initialTripTitle = "Kashmir Blossom Sisterhood",
  initialTripSlug = "kashmir-blossom-sisterhood",
  initialTravelers = 1,
  initialTotal = 32999,
  initialDeposit = 8000,
  initialDepartureDate = "Flexible 2026 Batch",
  initialPaymentType = "deposit",
}: PaymentPortalProps) {
  const [quoteId, setQuoteId] = useState(initialQuoteId);
  const [tripTitle, setTripTitle] = useState(initialTripTitle);
  const [travelers, setTravelers] = useState(initialTravelers);
  const [totalPrice, setTotalPrice] = useState(initialTotal);
  const [depositAmount, setDepositAmount] = useState(initialDeposit);
  const [paymentType, setPaymentType] = useState<"deposit" | "balance" | "full">(initialPaymentType);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [payerNotes, setPayerNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // UI States
  const [activeTab, setActiveTab] = useState<"upi" | "bank">("upi");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedProof, setSubmittedProof] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Amount payable based on selection
  const payableAmount = paymentType === "deposit" 
    ? depositAmount 
    : paymentType === "balance" 
    ? Math.max(0, totalPrice - depositAmount)
    : totalPrice;

  // Generate UPI QR Code on amount change
  useEffect(() => {
    const upiId = "tripnaari@okhdfcbank";
    const payeeName = "TripNaari Women Travel";
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${payableAmount}&cu=INR&tn=${encodeURIComponent(quoteId)}`;

    QRCode.toDataURL(upiUri, {
      width: 280,
      margin: 2,
      color: {
        dark: "#13253D",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error("QR Gen error", err));
  }, [payableAmount, quoteId]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit.");
        return;
      }
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim() || !utrNumber.trim()) {
      setErrorMessage("Please fill in your Name, Phone Number, and 12-digit UTR number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("quoteId", quoteId);
      formData.append("customerName", customerName);
      formData.append("customerPhone", customerPhone);
      formData.append("customerEmail", customerEmail);
      formData.append("tripTitle", tripTitle);
      formData.append("tripSlug", initialTripSlug);
      formData.append("departureDate", initialDepartureDate);
      formData.append("travelersCount", travelers.toString());
      formData.append("amountPaid", payableAmount.toString());
      formData.append("paymentType", paymentType);
      formData.append("paymentMethod", activeTab === "upi" ? "upi_qr" : "bank_transfer");
      formData.append("utrNumber", utrNumber);
      if (payerNotes) formData.append("payerNotes", payerNotes);
      if (selectedFile) formData.append("receiptFile", selectedFile);

      const res = await fetch("/api/payment-proof", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit payment proof");
      }

      setSubmittedProof(data.proof);
      setSubmitSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl shadow-xl border border-gray-100 text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        
        <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          Proof Received • Verification In Progress
        </span>

        <h2 className="text-2xl md:text-3xl font-display font-bold text-[#13253D] mt-2">
          Thank You, {customerName}! 🌸
        </h2>
        <p className="text-gray-600 text-sm md:text-base mt-2 max-w-lg mx-auto">
          We have received your payment proof of <strong className="text-[#13253D]">₹{payableAmount.toLocaleString("en-IN")}</strong> for <strong>{tripTitle}</strong> (UTR: {utrNumber}).
        </p>

        <div className="bg-[#FAF7F2] rounded-2xl p-5 my-6 text-left border border-[#E9E4DC] space-y-2 text-xs md:text-sm">
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-500">Quotation ID:</span>
            <span className="font-semibold text-gray-800">{quoteId}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-500">Selected Trip:</span>
            <span className="font-semibold text-gray-800">{tripTitle}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-500">Amount Submitted:</span>
            <span className="font-bold text-emerald-600">₹{payableAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-500">Transaction Reference:</span>
            <span className="font-mono text-gray-800">{utrNumber}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Verification Speed:</span>
            <span className="text-[#FF4A7D] font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Typically 15–30 Minutes
            </span>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs text-rose-900 text-left flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#FF4A7D] shrink-0 mt-0.5" />
          <p>
            Once verified against our bank statement, your <strong>Digital Boarding Pass & QR Ticket</strong> will be automatically issued and sent directly to your WhatsApp (<strong className="font-mono">{customerPhone}</strong>).
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/919282794457?text=${encodeURIComponent(`Hi TripNaari, I just uploaded my payment proof (UTR: ${utrNumber}) for ${tripTitle}. Kindly confirm!`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#1EBE5D] transition shadow-md"
          >
            Notify Team on WhatsApp
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition"
          >
            Return to TripNaari Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#13253D] to-[#1F3A60] rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-[#FF4A7D]" /> Official TripNaari Payment Verification Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
              Secure Tour Payment & Reservation
            </h1>
            <p className="text-gray-300 text-xs md:text-sm mt-1 max-w-xl">
              Pay via zero-fee UPI QR, GPay, PhonePe, or Net Banking, then submit your transaction UTR reference below to lock your seat.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shrink-0 text-right">
            <span className="text-[11px] text-gray-300 uppercase tracking-wider block">Quote ID</span>
            <span className="font-mono font-bold text-white text-sm md:text-base">{quoteId}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Trip Summary & QR Code Payment */}
        <div className="lg:col-span-5 space-y-6">
          {/* Trip Summary Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-display font-bold text-lg text-[#13253D] mb-4 flex items-center justify-between">
              <span>Booking Summary</span>
              <span className="text-xs font-semibold bg-rose-50 text-[#FF4A7D] px-2.5 py-1 rounded-full border border-rose-100">
                Women-Only Batch
              </span>
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Destination</span>
                <span className="font-bold text-gray-800 text-right">{tripTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Departure</span>
                <span className="font-medium text-gray-800">{initialDepartureDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Travelers</span>
                <span className="font-medium text-gray-800">{travelers} Person(s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Total Package</span>
                <span className="font-medium text-gray-800">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Payment Type Switcher */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Select What You Are Paying Today:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentType("deposit")}
                  className={`p-3 rounded-2xl border text-left transition font-semibold ${
                    paymentType === "deposit"
                      ? "border-[#FF4A7D] bg-rose-50/70 text-[#FF4A7D] ring-2 ring-[#FF4A7D]/20"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="block font-bold">25% Seat Deposit</span>
                  <span className="text-sm font-extrabold text-[#13253D]">₹{depositAmount.toLocaleString("en-IN")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType("full")}
                  className={`p-3 rounded-2xl border text-left transition font-semibold ${
                    paymentType === "full"
                      ? "border-[#FF4A7D] bg-rose-50/70 text-[#FF4A7D] ring-2 ring-[#FF4A7D]/20"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="block font-bold">Full Package</span>
                  <span className="text-sm font-extrabold text-[#13253D]">₹{totalPrice.toLocaleString("en-IN")}</span>
                </button>
              </div>

              {totalPrice > depositAmount && paymentType === "deposit" && (
                <p className="text-[11px] text-gray-500 mt-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  Remaining balance of <strong>₹{(totalPrice - depositAmount).toLocaleString("en-IN")}</strong> will be due 14 days before departure.
                </p>
              )}
            </div>
          </div>

          {/* Payment Methods (UPI QR vs Bank) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex gap-2 border-b border-gray-100 pb-3 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab("upi")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === "upi" ? "bg-[#13253D] text-white shadow" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Instant UPI QR
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bank")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === "bank" ? "bg-[#13253D] text-white shadow" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Bank NEFT / IMPS
              </button>
            </div>

            {activeTab === "upi" ? (
              <div className="text-center space-y-4">
                <div className="inline-block p-3 bg-white rounded-2xl border-2 border-dashed border-rose-200 shadow-sm">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="TripNaari UPI QR Code"
                      className="w-48 h-48 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-gray-400">
                      Generating QR...
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-xs text-gray-500 block">Scan with any UPI App</span>
                  <div className="flex items-center justify-center gap-1 text-[#13253D] font-mono text-xs font-bold bg-gray-50 py-1.5 px-3 rounded-xl border border-gray-200 max-w-xs mx-auto mt-1">
                    <span>tripnaari@okhdfcbank</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("tripnaari@okhdfcbank", "upi")}
                      className="text-gray-400 hover:text-gray-700 ml-1 p-0.5"
                      title="Copy UPI ID"
                    >
                      {copiedField === "upi" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`upi://pay?pa=tripnaari@okhdfcbank&pn=TripNaari%20Women%20Travel&am=${payableAmount}&cu=INR&tn=${encodeURIComponent(quoteId)}`}
                    className="inline-flex items-center gap-2 bg-[#FF4A7D] hover:bg-[#E03A6A] text-white text-xs font-bold px-4 py-2.5 rounded-full transition shadow-md shadow-[#FF4A7D]/20"
                  >
                    <Smartphone className="w-4 h-4" /> Open in PhonePe / GPay
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-gray-500">Account Name:</span>
                    <span className="font-bold text-gray-800">TripNaari Travels Pvt Ltd</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-gray-500">Bank Name:</span>
                    <span className="font-semibold text-gray-800">HDFC Bank</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-gray-500">Account Number:</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-gray-800">
                      <span>50200084928172</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("50200084928172", "acc")}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        {copiedField === "acc" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500">IFSC Code:</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-gray-800">
                      <span>HDFC0001234</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("HDFC0001234", "ifsc")}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        {copiedField === "ifsc" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 italic">
                  Note: NEFT/IMPS transfers are credited instantly. Please save the UTR reference number for the form on the right.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Verification Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#FF4A7D] text-white flex items-center justify-center text-xs font-bold">2</span>
              <h2 className="text-xl font-display font-bold text-[#13253D]">
                Submit Payment Verification
              </h2>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mb-6">
              Enter your transfer details and upload your payment screenshot. Our team will verify it against the bank ledger and issue your official boarding pass.
            </p>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProof} className="space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Payer Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Roshni Patel"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF4A7D]/30 focus:border-[#FF4A7D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98201 XXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF4A7D]/30 focus:border-[#FF4A7D]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="roshni.patel@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF4A7D]/30 focus:border-[#FF4A7D]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  12-Digit UPI UTR / RRN / Bank Reference Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 428901928371 (Found on GPay / PhonePe receipt)"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full px-3 py-2.5 font-mono text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF4A7D]/30 focus:border-[#FF4A7D]"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Shown as &quot;UPI Ref ID&quot; or &quot;UTR&quot; on your successful payment screen.
                </span>
              </div>

              {/* Upload Screenshot */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Payment Screenshot or Bank Receipt
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:border-[#FF4A7D] hover:bg-rose-50/20 transition"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  {filePreview ? (
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={filePreview}
                        alt="Receipt preview"
                        className="w-16 h-16 object-cover rounded-xl border border-gray-200"
                      />
                      <div className="text-left text-xs">
                        <span className="font-bold text-gray-800 block truncate max-w-xs">
                          {selectedFile?.name}
                        </span>
                        <span className="text-gray-400">Click to change file</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                      <span className="text-xs font-semibold text-gray-600 block">
                        Click to upload payment screenshot
                      </span>
                      <span className="text-[10px] text-gray-400 block">PNG, JPG, PDF up to 10MB</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Dietary / Roommate Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pure Veg meal preference, traveling with my sister Sunita."
                  value={payerNotes}
                  onChange={(e) => setPayerNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF4A7D]/30 focus:border-[#FF4A7D]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#13253D] hover:bg-[#1C365A] text-white py-3.5 rounded-2xl font-bold transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting & Verifying...</span>
                  ) : (
                    <>
                      <span>Submit Payment Proof (₹{payableAmount.toLocaleString("en-IN")})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted 256-Bit SSL Transfer • 100% Verified Women-Only Booking</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
