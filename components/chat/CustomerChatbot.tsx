"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  MessageSquare, X, Send, Sparkles, User, HelpCircle, Check, ArrowRight, 
  ChevronDown, ChevronUp, ExternalLink, Ticket, Calendar, ShieldCheck, 
  Star, Tag, PhoneCall
} from "lucide-react";
import { submitEnquiry } from "@/lib/actions";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  triggerForm?: boolean;
  recommendedTripSlug?: string;
  whatsappTripSlug?: string;
  couponCode?: string;
  couponDiscount?: string;
}

interface SuggestionItem {
  label: string;
  prompt: string;
}

interface TripSummary {
  slug: string;
  title: string;
  shortDescription: string;
  heroImage: string;
  durationDays: number;
  durationNights: number;
  priceFrom: number;
  priceOriginal?: number;
  ratingAvg: string;
  ratingCount: number;
  highlights: string[];
}

const defaultSuggestions: SuggestionItem[] = [
  { label: "🎴 Trending Trip Packages", prompt: "Show me your top-rated women-only trip packages with prices and departures." },
  { label: "🎁 Claim ₹1,000 Voucher", prompt: "Do you have any first-time female traveler discount vouchers available?" },
  { label: "📲 WhatsApp PDF Itinerary", prompt: "Can you send me the full day-by-day itinerary to my WhatsApp?" },
  { label: "🏔️ Kashmir Houseboat Special", prompt: "What are the upcoming women-only departures to Kashmir?" },
  { label: "🌴 Kerala Backwater Retreat", prompt: "Show me details and prices for Kerala women-only packages." },
  { label: "🛡️ Solo Safety & Lock Audits", prompt: "How does TripNaari guarantee safety & hotel room lock audits for solo female travelers?" },
  { label: "🎒 Custom Group Booking", prompt: "Do you organize custom private trips for girlfriend groups or families?" }
];

export default function CustomerChatbot() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! 🙏 Welcome to TripNaari. I am NaariAI, your travel companion & sales advisor. I can help you find safe women-only packages, check active departures, send PDF itineraries on WhatsApp, and answer any safety queries you have. What destinations are you dreaming of?"
    }
  ]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(defaultSuggestions);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Active Catalog Data for Visual Cards
  const [tripsCatalog, setTripsCatalog] = useState<TripSummary[]>([]);
  
  // Proactive Sales Nudge State
  const [proactiveNudgeVisible, setProactiveNudgeVisible] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState("💬 Need help planning your dream trip? Ask NaariAI for instant itineraries & ₹1,000 off!");
  const hasTriggeredNudge = useRef(false);

  // Form State
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    destination: "",
    travelMonth: "October 2026",
    travelers: "1",
    budget: "₹20,000 - ₹30,000",
  });

  const [conversationId, setConversationId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Initialize conversationId
  useEffect(() => {
    let id = sessionStorage.getItem("tripnaari_ai_conv_id");
    if (!id) {
      id = "conv_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      sessionStorage.setItem("tripnaari_ai_conv_id", id);
    }
    setConversationId(id);
  }, []);

  // Load dynamic welcome message, qaPairs, & trip summaries from AI Settings API
  useEffect(() => {
    async function fetchAISettings() {
      try {
        const response = await fetch("/api/chat/settings");
        if (response.ok) {
          const data = await response.json();

          if (data.tripsSummary && Array.isArray(data.tripsSummary)) {
            setTripsCatalog(data.tripsSummary);
          }

          // Page-Aware Customization & High-Converting Sales Shortcuts
          const currentTripSlug = pathname.startsWith("/trips/") ? pathname.replace("/trips/", "").split("/")[0] : null;
          const matchingTrip = data.tripsSummary?.find((t: any) => t.slug === currentTripSlug);

          if (matchingTrip) {
            setMessages([
              {
                role: "assistant",
                content: `Namaste! 🙏 I notice you're looking at **${matchingTrip.title}**!\n\nWe have upcoming departures for this trip with certified female trip leaders & verified hotel lock audits. Would you like me to send you the day-by-day itinerary or check available slots?`,
                recommendedTripSlug: matchingTrip.slug
              }
            ]);
            setFormData(prev => ({ ...prev, destination: matchingTrip.title }));
            setNudgeMessage(`💬 Looking at ${matchingTrip.title}? Ask NaariAI for instant WhatsApp itinerary & ₹1,000 voucher!`);
            
            // Contextually tailored sales shortcuts for active trip page
            setSuggestions([
              { label: "📲 WhatsApp PDF Itinerary", prompt: `Send me the complete day-by-day PDF itinerary for ${matchingTrip.title} on WhatsApp.` },
              { label: "🎁 Claim ₹1,000 Voucher", prompt: `Can I apply the ₹1,000 solo traveler discount voucher for ${matchingTrip.title}?` },
              { label: "⚡ Departure Dates & Slots", prompt: `What are the upcoming departure dates and remaining seats for ${matchingTrip.title}?` },
              { label: "🛡️ Hotel Lock Audit & Safety", prompt: `How is safety and room sharing arranged for ${matchingTrip.title}?` },
              { label: "🎒 Reserve ₹5,000 Token Slot", prompt: `How can I reserve a slot for ${matchingTrip.title} with a token advance?` }
            ]);
          } else if (data.welcomeMessage) {
            setMessages([
              {
                role: "assistant",
                content: data.welcomeMessage
              }
            ]);
            if (data.qaPairs && Array.isArray(data.qaPairs) && data.qaPairs.length > 0) {
              const loadedQuestions: SuggestionItem[] = data.qaPairs.slice(0, 6).map((q: any) => ({
                label: q.question.length > 32 ? q.question.substring(0, 32) + "..." : q.question,
                prompt: q.question
              }));
              setSuggestions(loadedQuestions);
            }
          }
        }
      } catch (error) {
        console.warn("Failed to load dynamic welcome message", error);
      }
    }
    fetchAISettings();
  }, [pathname]);

  // Proactive Sales Nudge & Exit Intent Triggers
  useEffect(() => {
    if (isOpen || hasTriggeredNudge.current) return;

    // Timer Trigger (show after 15 seconds)
    const timer = setTimeout(() => {
      if (!isOpen && !hasTriggeredNudge.current) {
        setProactiveNudgeVisible(true);
        hasTriggeredNudge.current = true;
      }
    }, 15000);

    // Exit Intent Handler (desktop mouse leave)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !isOpen && !hasTriggeredNudge.current) {
        setProactiveNudgeVisible(true);
        hasTriggeredNudge.current = true;
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isOpen]);

  // Track if StickyCTA is active and visible
  const [isStickyCTAVisible, setIsStickyCTAVisible] = useState(false);

  useEffect(() => {
    const handleToggleChat = () => {
      setIsOpen(prev => !prev);
      setProactiveNudgeVisible(false);
    };
    const handleStickyChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.visible !== "undefined") {
        setIsStickyCTAVisible(customEvent.detail.visible);
      }
    };

    window.addEventListener("toggle-chat", handleToggleChat);
    window.addEventListener("sticky-cta-change", handleStickyChange);

    return () => {
      window.removeEventListener("toggle-chat", handleToggleChat);
      window.removeEventListener("sticky-cta-change", handleStickyChange);
    };
  }, []);

  // Reset scroll to top when chat opens or single welcome message is loaded
  useEffect(() => {
    if (isOpen && messages.length <= 1 && chatBodyRef.current) {
      chatBodyRef.current.scrollTop = 0;
    }
    if (isOpen) {
      setProactiveNudgeVisible(false);
    }
  }, [isOpen, messages]);

  // Scroll to bottom only when new user or assistant messages arrive
  useEffect(() => {
    if (messages.length > 1 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (pathname.startsWith("/admin")) return null;

  const openWhatsAppWithLead = (tripSlug?: string, customText?: string) => {
    const trip = tripsCatalog.find(t => t.slug === tripSlug);
    const tripName = trip ? trip.title : (tripSlug || "Women-Only Trips");
    const msg = customText || `Hi TripNaari Team! I am interested in the ${tripName} package. Please share the full PDF itinerary and pricing details.`;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/919861806115?text=${encoded}`, "_blank");
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading || isTyping) return;

    if (!textToSend) setInput("");

    const newMessages = [...messages, { role: "user" as const, content: query }];
    setMessages(newMessages);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "customer",
          messages: newMessages,
          conversationId,
          context: {
            pathname: window.location.pathname,
            source: "website_chatbot"
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to connect to API");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let streamedReply = "";
      let displayedReply = "";
      let textQueue: string[] = [];

      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "" }
      ]);

      const typewriterInterval = setInterval(() => {
        if (textQueue.length > 0) {
          const batchSize = textQueue.length > 30 ? 6 : (textQueue.length > 15 ? 4 : (textQueue.length > 5 ? 2 : 1));
          let charsToAppend = "";
          for (let i = 0; i < batchSize; i++) {
            const char = textQueue.shift();
            if (char) charsToAppend += char;
          }
          displayedReply += charsToAppend;

          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              last.content = displayedReply;
            }
            return updated;
          });
        } else if (done) {
          clearInterval(typewriterInterval);
          setIsTyping(false);
        }
      }, 35);

      try {
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            streamedReply += chunk;
            textQueue.push(...chunk.split(""));
          }
        }
      } catch (streamError) {
        console.error("Stream reading interrupted:", streamError);
        done = true;
        setIsTyping(false);
      }

      const checkFinishedInterval = setInterval(() => {
        if (done && textQueue.length === 0) {
          clearInterval(checkFinishedInterval);

          let cleanReply = streamedReply;

          // Parse [RECOMMEND_TRIP:slug]
          const tripMatch = cleanReply.match(/\[RECOMMEND_TRIP:([a-zA-Z0-9_-]+)\]/);
          let recommendedTripSlug: string | undefined = undefined;
          if (tripMatch) {
            recommendedTripSlug = tripMatch[1];
            cleanReply = cleanReply.replace(tripMatch[0], "").trim();
          }

          // Parse [WHATSAPP_LEAD_BUTTON:slug]
          const waMatch = cleanReply.match(/\[WHATSAPP_LEAD_BUTTON:([a-zA-Z0-9_-]+)\]/);
          let whatsappTripSlug: string | undefined = undefined;
          if (waMatch) {
            whatsappTripSlug = waMatch[1];
            cleanReply = cleanReply.replace(waMatch[0], "").trim();
          }

          // Parse [COUPON_OFFER:CODE:DISCOUNT]
          const couponMatch = cleanReply.match(/\[COUPON_OFFER:([a-zA-Z0-9_-]+):([^\]]+)\]/);
          let couponCode: string | undefined = undefined;
          let couponDiscount: string | undefined = undefined;
          if (couponMatch) {
            couponCode = couponMatch[1];
            couponDiscount = couponMatch[2];
            cleanReply = cleanReply.replace(couponMatch[0], "").trim();
          }

          // Parse [SHOW_ENQUIRY_FORM]
          let triggerForm = false;
          if (cleanReply.includes("[SHOW_ENQUIRY_FORM]")) {
            triggerForm = true;
            cleanReply = cleanReply.replace("[SHOW_ENQUIRY_FORM]", "").trim();

            const destinations = ["kashmir", "kerala", "meghalaya", "rajasthan", "spiti", "ladakh", "goa"];
            const matchedDest = destinations.find(d => query.toLowerCase().includes(d));
            if (matchedDest) {
              setFormData(prev => ({
                ...prev,
                destination: matchedDest.charAt(0).toUpperCase() + matchedDest.slice(1)
              }));
            }
          }

          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              last.content = cleanReply;
              last.triggerForm = triggerForm;
              last.recommendedTripSlug = recommendedTripSlug;
              last.whatsappTripSlug = whatsappTripSlug;
              last.couponCode = couponCode;
              last.couponDiscount = couponDiscount;
            }
            return updated;
          });
        }
      }, 100);

    } catch (e) {
      console.error("Chat error:", e);
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "I apologize, but I am experiencing some difficulties. Please call or WhatsApp our helpline at +91 98618 06115 for immediate support!" }
      ]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) return;

    setFormLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("email", formData.email);
      fd.append("phone", formData.phone);
      fd.append("destination", formData.destination);
      fd.append("travelMonth", formData.travelMonth);
      fd.append("travelers", formData.travelers);
      fd.append("budget", formData.budget);
      fd.append("consent", "true");
      fd.append("message", "Created via NaariAI Website Chatbot");

      const result = await submitEnquiry(fd);
      if (result.success) {
        setFormSubmitted(true);
        setMessages(prev => [
          ...prev,
          {
            role: "system",
            content: "✅ Enquiry logged successfully! A TripNaari coordinator will ping you shortly."
          }
        ]);
      } else {
        alert("Failed to submit inquiry. Please double check your mobile number and email!");
      }
    } catch (e) {
      console.error(e);
      alert("Submission error. Please check your internet connection.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[75] sm:hidden transition-opacity"
        />
      )}

      {/* Proactive Sales Nudge Callout Bubble */}
      {proactiveNudgeVisible && !isOpen && (
        <div 
          onClick={() => setIsOpen(true)}
          className={`fixed ${isStickyCTAVisible ? "bottom-[calc(140px+max(16px,env(safe-area-inset-bottom)))]" : "bottom-24"} right-6 z-[79] max-w-[280px] bg-[#13253D] text-white p-3.5 rounded-2xl shadow-2xl border border-[#FF4A7D]/40 cursor-pointer animate-in fade-in slide-in-from-bottom-3 duration-300 hover:scale-102 group`}
        >
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#FF4A7D] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 shadow-md">
              🌸
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-extrabold text-[#FF85A5] uppercase tracking-wider">NaariAI Sales Assistant</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setProactiveNudgeVisible(false); }}
                  className="text-white/60 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[11px] font-medium leading-tight text-white/95">
                {nudgeMessage}
              </p>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#FF85A5] group-hover:translate-x-1 transition-transform">
                <span>Start Chat Now</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
          {/* Pointer Triangle */}
          <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#13253D]" />
        </div>
      )}

      {/* Floating Chat Bubble */}
      <button
        onClick={() => { setIsOpen(!isOpen); setProactiveNudgeVisible(false); }}
        className={`fixed ${isStickyCTAVisible ? "bottom-[calc(76px+max(16px,env(safe-area-inset-bottom)))]" : "bottom-6"} right-6 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-[#13253D] text-white hover:bg-[#FF4A7D] transition-all duration-300 shadow-xl border border-white/20 hover:scale-105 group`}
        title="Chat with NaariAI Sales Machine"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4A7D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF4A7D]"></span>
            </span>
          </div>
        )}
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <div className={`fixed inset-x-3 bottom-3 sm:inset-x-auto ${isStickyCTAVisible ? "sm:bottom-[calc(96px+max(16px,env(safe-area-inset-bottom)))]" : "sm:bottom-24"} sm:right-6 z-[80] sm:w-[390px] h-[540px] max-h-[calc(100vh-80px)] bg-white border border-[#F1D9D0] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300`}>

          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#13253D] via-[#1C3556] to-[#203D64] text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF4A7D] to-[#E0265B] flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/20">
                  🌸
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#13253D]" />
              </div>
              <div>
                <h3 className="font-bold text-xs flex items-center gap-1.5 leading-none">
                  NaariAI Sales Machine <Sparkles className="w-3 h-3 text-[#FF85A5]" />
                </h3>
                <span className="text-[10px] text-white/75 mt-0.5 block font-medium">Safe Women-Only Trips • 24/7 Support</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white rounded-lg p-1 hover:bg-white/10 transition">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Messages Body */}
          <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFF8F0]/20 scrollbar-thin">
            {messages.map((m, idx) => {
              if (m.role === "system") {
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] bg-[#E2F7E4] text-[#1D7A27] px-3.5 py-1.5 rounded-full font-bold border border-[#C6ECCB] shadow-2xs">
                      {m.content}
                    </span>
                    {/* Instant WhatsApp Action After Form Submission */}
                    <button
                      onClick={() => openWhatsAppWithLead(formData.destination)}
                      className="text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition transform hover:scale-102"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Direct WhatsApp Priority Chat
                    </button>
                  </div>
                );
              }

              const isUser = m.role === "user";
              const tripData = m.recommendedTripSlug ? tripsCatalog.find(t => t.slug === m.recommendedTripSlug) : null;

              return (
                <div key={idx} className="space-y-3">
                  <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${isUser
                        ? "bg-[#13253D] text-white rounded-tr-none"
                        : "bg-white border border-[#F1D9D0] text-[#13253D] rounded-tl-none font-medium"
                      }`}>
                      <div className="whitespace-pre-line leading-relaxed">
                        {m.content}
                      </div>
                    </div>
                  </div>

                  {/* VISUAL TRIP CARD COMPONENT */}
                  {!isUser && tripData && (
                    <div className="flex justify-start">
                      <div className="w-[94%] bg-white border border-[#F1D9D0] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all animate-in fade-in zoom-in-95 duration-300">
                        {/* Trip Cover Image Header */}
                        <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={tripData.heroImage} 
                            alt={tripData.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          <div className="absolute top-2 left-2 bg-[#FF4A7D] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <ShieldCheck className="w-3 h-3" /> Women-Only Group
                          </div>

                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                            <Star className="w-3 h-3 fill-amber-300" /> {tripData.ratingAvg} ({tripData.ratingCount})
                          </div>

                          <div className="absolute bottom-2 left-3 right-3 text-white">
                            <h4 className="font-bold text-xs line-clamp-1 text-white drop-shadow-sm">{tripData.title}</h4>
                            <p className="text-[10px] text-white/80 font-medium flex items-center gap-2">
                              <span>🗓️ {tripData.durationDays}D / {tripData.durationNights}N</span>
                              <span>•</span>
                              <span className="text-emerald-300 font-extrabold">⚡ 3 Seats Left</span>
                            </p>
                          </div>
                        </div>

                        {/* Card Body & Pricing */}
                        <div className="p-3 bg-white space-y-2.5">
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                            {tripData.shortDescription}
                          </p>

                          {/* Highlights Pills */}
                          {tripData.highlights && tripData.highlights.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {tripData.highlights.slice(0, 3).map((h, hIdx) => (
                                <span key={hIdx} className="text-[9px] bg-[#FFF8F0] text-[#13253D] font-bold px-2 py-0.5 rounded-md border border-[#F1D9D0]">
                                  ✓ {h}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Price Tag & Actions */}
                          <div className="pt-2 border-t border-[#F1D9D0]/60 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] text-slate-400 block font-semibold leading-none">Starting From</span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-sm font-extrabold text-[#13253D]">₹{tripData.priceFrom.toLocaleString("en-IN")}</span>
                                {tripData.priceOriginal && (
                                  <span className="text-[10px] text-slate-400 line-through">₹{tripData.priceOriginal.toLocaleString("en-IN")}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => openWhatsAppWithLead(tripData.slug)}
                                className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition"
                                title="Get PDF Itinerary on WhatsApp"
                              >
                                📲 WhatsApp
                              </button>
                              <button
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, destination: tripData.title }));
                                  setMessages(prev => {
                                    const updated = [...prev];
                                    const last = updated[updated.length - 1];
                                    if (last) last.triggerForm = true;
                                    return updated;
                                  });
                                }}
                                className="bg-[#13253D] hover:bg-[#FF4A7D] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition shadow-xs"
                              >
                                Reserve Seat
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WHATSAPP ACTION BUTTON */}
                  {!isUser && m.whatsappTripSlug && !tripData && (
                    <div className="flex justify-start">
                      <button
                        onClick={() => openWhatsAppWithLead(m.whatsappTripSlug)}
                        className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-md transition transform hover:scale-102"
                      >
                        <PhoneCall className="w-4 h-4" /> Get PDF Itinerary & Pricing on WhatsApp
                      </button>
                    </div>
                  )}

                  {/* COUPON VOUCHER CARD */}
                  {!isUser && m.couponCode && (
                    <div className="flex justify-start">
                      <div className="w-[90%] bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white rounded-2xl p-3 shadow-md border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-amber-200" />
                            <div>
                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-200 block leading-none">First Traveler Voucher</span>
                              <h4 className="font-extrabold text-xs">{m.couponDiscount || "₹1,000 OFF"} Voucher</h4>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(m.couponCode || "SOLO1000");
                              alert(`Coupon code "${m.couponCode || "SOLO1000"}" copied! Apply during booking.`);
                            }}
                            className="bg-white text-[#13253D] font-extrabold text-[10px] px-2.5 py-1 rounded-lg shadow-xs hover:bg-amber-100 transition"
                          >
                            Copy: {m.couponCode}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Render Inquiry Form inside chat if triggered */}
                  {!isUser && m.triggerForm && !formSubmitted && (
                    <div className="flex justify-start">
                      <div className="w-[92%] bg-white border border-[#FF4A7D]/30 rounded-2xl p-4 shadow-md mt-1 animate-in fade-in zoom-in-95 duration-200">
                        <h4 className="text-xs font-bold text-[#13253D] flex items-center gap-1 mb-2.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#FF4A7D]" /> Request Callback & Itinerary
                        </h4>

                        <form onSubmit={handleFormSubmit} className="space-y-2">
                          <div>
                            <input
                              type="text"
                              required
                              placeholder="Your Name *"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full text-[11px] rounded-lg border border-[#F1D9D0] px-2.5 py-2 outline-none focus:border-[#FF4A7D]/40 font-medium text-[#13253D] bg-[#FFF8F0]/10"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="email"
                              required
                              placeholder="Email Address *"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full text-[11px] rounded-lg border border-[#F1D9D0] px-2.5 py-2 outline-none focus:border-[#FF4A7D]/40 font-medium text-[#13253D] bg-[#FFF8F0]/10"
                            />
                            <input
                              type="tel"
                              required
                              placeholder="Phone / WhatsApp *"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full text-[11px] rounded-lg border border-[#F1D9D0] px-2.5 py-2 outline-none focus:border-[#FF4A7D]/40 font-medium text-[#13253D] bg-[#FFF8F0]/10"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Destination (e.g. Kashmir)"
                              value={formData.destination}
                              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                              className="w-full text-[11px] rounded-lg border border-[#F1D9D0] px-2.5 py-2 outline-none focus:border-[#FF4A7D]/40 font-medium text-[#13253D] bg-[#FFF8F0]/10"
                            />
                            <input
                              type="text"
                              placeholder="Travel Month (e.g. Oct)"
                              value={formData.travelMonth}
                              onChange={(e) => setFormData({ ...formData, travelMonth: e.target.value })}
                              className="w-full text-[11px] rounded-lg border border-[#F1D9D0] px-2.5 py-2 outline-none focus:border-[#FF4A7D]/40 font-medium text-[#13253D] bg-[#FFF8F0]/10"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={formLoading}
                            className="w-full bg-[#13253D] hover:bg-[#FF4A7D] text-white text-[11px] font-bold py-2 rounded-lg transition disabled:opacity-50 mt-1 shadow-sm flex items-center justify-center gap-1.5"
                          >
                            {formLoading ? "Sending Details..." : "Confirm & Send Enquiry"}
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#F1D9D0] text-[#13253D] rounded-2xl rounded-tl-none p-3 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1.5 bg-[#FF4A7D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-1.5 bg-[#FF4A7D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-1.5 bg-[#FF4A7D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px] text-[#3D4A5E] font-medium">NaariAI Sales Machine is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions - Horizontal Scroll Chips */}
          {!isLoading && !isTyping && messages.length < 5 && (
            <div className="px-3 py-1.5 bg-[#FFF8F0]/40 border-t border-[#F1D9D0]/60 shrink-0 transition-all">
              <div className="text-[9px] font-extrabold uppercase text-[#3D4A5E]/70 tracking-wider flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="flex items-center gap-1 hover:text-[#FF4A7D] transition cursor-pointer select-none"
                  title={showSuggestions ? "Minimize Quick Questions" : "Expand Quick Questions"}
                >
                  <Sparkles className="w-3 h-3 text-[#FF4A7D]" />
                  <span>Quick Sales Shortcuts</span>
                  {showSuggestions ? (
                    <ChevronDown className="w-3 h-3 text-[#FF4A7D]" />
                  ) : (
                    <ChevronUp className="w-3 h-3 text-[#FF4A7D]" />
                  )}
                </button>
                <div className="flex items-center gap-2">
                  {showSuggestions && <span className="text-[9px] text-[#FF4A7D] font-semibold">Swipe →</span>}
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="text-[9px] text-[#FF4A7D] font-extrabold bg-[#FFF0F4] hover:bg-[#FF4A7D] hover:text-white px-2 py-0.5 rounded-md border border-[#FF4A7D]/20 transition-all cursor-pointer"
                  >
                    {showSuggestions ? "Minimize" : "Expand"}
                  </button>
                </div>
              </div>
              {showSuggestions && (
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1.5 px-0.5 animate-in fade-in duration-200">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(s.prompt)}
                      className="text-[11px] font-bold text-[#13253D] border border-[#F1D9D0] hover:border-[#FF4A7D]/40 bg-white hover:bg-[#FFF0F4] hover:text-[#FF4A7D] px-3 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <span>{s.label}</span>
                      <ArrowRight className="w-3 h-3 text-[#FF4A7D] shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Input Panel */}
          <div className="p-3 pb-[max(12px,env(safe-area-inset-bottom))] border-t border-[#F1D9D0] bg-white flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask for trip pricing, itineraries, or vouchers..."
              disabled={isLoading || isTyping}
              className="flex-1 border border-[#F1D9D0] rounded-full px-4 py-2 text-xs focus:outline-none focus:border-[#FF4A7D]/40 font-medium text-[#13253D]"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || isTyping}
              className="rounded-full bg-[#13253D] hover:bg-[#FF4A7D] text-white p-2 transition disabled:opacity-50 shrink-0"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

