"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import EnquiryForm from "@/components/forms/EnquiryForm";

export default function EnquiryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultDest, setDefaultDest] = useState("");
  const [defaultDate, setDefaultDate] = useState("");
  const [defaultMessage, setDefaultMessage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [mode, setMode] = useState("");

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.destination) {
        setDefaultDest(customEvent.detail.destination);
      } else {
        setDefaultDest("");
      }
      if (customEvent.detail && customEvent.detail.date) {
        setDefaultDate(customEvent.detail.date);
      } else {
        setDefaultDate("");
      }
      if (customEvent.detail && customEvent.detail.message) {
        setDefaultMessage(customEvent.detail.message);
      } else {
        setDefaultMessage("");
      }
      if (customEvent.detail && customEvent.detail.itineraryPdf) {
        setPdfUrl(customEvent.detail.itineraryPdf);
      } else {
        setPdfUrl("");
      }
      if (customEvent.detail && customEvent.detail.mode) {
        setMode(customEvent.detail.mode);
      } else {
        setMode("");
      }
      setIsOpen(true);
      document.body.style.overflow = "hidden";
    };

    window.addEventListener("open-enquiry-modal", handleOpen);
    return () => {
      window.removeEventListener("open-enquiry-modal", handleOpen);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    document.body.style.overflow = "unset";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
         className="absolute inset-0 bg-[#13253D]/80 backdrop-blur-sm transition-opacity"
         onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-[32px] w-full max-w-[640px] max-h-[90vh] overflow-y-auto z-10 shadow-2xl border border-[#F1D9D0] animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button 
           onClick={handleClose}
           className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#FFF8F0] border border-[#F1D9D0] flex items-center justify-center text-[#13253D] hover:text-[#FF4A7D] transition-colors z-20"
         >
          <X className="w-5 h-5" />
        </button>

        {/* Form Container */}
        <div className="p-1 sm:p-2">
          <EnquiryForm 
            source="modal" 
            defaultDestination={defaultDest} 
            defaultDate={defaultDate} 
            defaultMessage={defaultMessage} 
            pdfUrl={pdfUrl}
            mode={mode}
          />
        </div>
      </div>
    </div>
  );
}
