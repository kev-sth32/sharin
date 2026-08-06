"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Send, Sparkles, User, HelpCircle, Check, ArrowRight } from "lucide-react";
import { submitEnquiry } from "@/lib/actions";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  triggerForm?: boolean;
}

export default function CustomerChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! 🙏 Welcome to TripNaari. I am NaariAI, your travel companion. I can help you find safe women-only packages, check active departures, and answer any queries you have. What destinations are you dreaming of?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Form State
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    destination: "",
    travelMonth: "September 2026",
    travelers: "1",
    budget: "₹20,000 - ₹30,000",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat count and rate limit from localStorage (persists for 24 hours)
  useEffect(() => {
    try {
      const storedCount = localStorage.getItem("tripnaari_chat_count");
      const storedTime = localStorage.getItem("tripnaari_chat_timestamp");
      const now = Date.now();

      if (storedCount && storedTime) {
        // If 24 hours have passed, reset rate limits
        if (now - parseInt(storedTime) > 24 * 3600 * 1000) {
          localStorage.setItem("tripnaari_chat_count", "0");
          localStorage.setItem("tripnaari_chat_timestamp", now.toString());
          setChatCount(0);
        } else {
          const count = parseInt(storedCount);
          setChatCount(count);
          if (count >= 10) {
            setIsRateLimited(true);
          }
        }
      } else {
        localStorage.setItem("tripnaari_chat_count", "0");
        localStorage.setItem("tripnaari_chat_timestamp", now.toString());
      }
    } catch (e) {
      console.warn("localStorage not available", e);
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (pathname.startsWith("/admin")) return null;

  const incrementRateLimit = () => {
    try {
      const newCount = chatCount + 1;
      setChatCount(newCount);
      localStorage.setItem("tripnaari_chat_count", newCount.toString());
      if (newCount >= 10) {
        setIsRateLimited(true);
      }
    } catch (e) {
      console.warn("Failed to update localStorage", e);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    if (isRateLimited) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "🔒 You have reached your daily chat limit of 10 messages. To get instant support, please feel free to fill out the Inquiry Form below or contact our support team directly via WhatsApp!"
        }
      ]);
      return;
    }

    if (!textToSend) setInput("");

    const newMessages = [...messages, { role: "user" as const, content: query }];
    setMessages(newMessages);
    setIsLoading(true);
    incrementRateLimit();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "customer",
          messages: newMessages
        })
      });

      const data = await response.json();
      if (response.ok && data.reply) {
        let replyContent = data.reply;
        let triggerForm = false;

        // Check if response contains the form trigger token
        if (replyContent.includes("[SHOW_ENQUIRY_FORM]")) {
          replyContent = replyContent.replace("[SHOW_ENQUIRY_FORM]", "").trim();
          triggerForm = true;

          // Attempt to extract destination name if mentioned in the query
          const destinations = ["kashmir", "kerala", "meghalaya", "rajasthan", "spiti", "ladakh"];
          const matchedDest = destinations.find(d => query.toLowerCase().includes(d));
          if (matchedDest) {
            setFormData(prev => ({ 
              ...prev, 
              destination: matchedDest.charAt(0).toUpperCase() + matchedDest.slice(1) 
            }));
          }
        }

        setMessages(prev => [
          ...prev, 
          { 
            role: "assistant", 
            content: replyContent || "I'd be happy to help you coordinate that booking! Please share your contact details below:", 
            triggerForm 
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "I apologize, but I am experiencing some difficulties. Please call or WhatsApp our helpline at +91 98765 43210 for immediate support!" }
        ]);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "I'm having trouble connecting to my servers. Please try again in a few seconds or message us on WhatsApp!" }
      ]);
    } finally {
      setIsLoading(false);
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

  const suggestions = [
    { label: "Is solo travel safe here?", prompt: "How does TripNaari ensure safety for a first-time solo female traveler?" },
    { label: "Do you have Kashmir departures?", prompt: "What are the upcoming women-only departures to Kashmir?" },
    { label: "What is your refund policy?", prompt: "What is your refund policy and cancellation timeline?" }
  ];

  return (
    <>
      {/* Floating Chat Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#13253D] text-white hover:bg-[#FF4A7D] transition-all duration-300 shadow-xl border border-white/20 hover:scale-105"
        title="Chat with NaariAI"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6 text-white" />}
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[90%] sm:w-[380px] h-[500px] bg-white border border-[#F1D9D0] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#13253D] to-[#203D64] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF4A7D] flex items-center justify-center text-white font-bold text-xs shadow-md">
                🌸
              </div>
              <div>
                <h3 className="font-bold text-xs flex items-center gap-1.5 leading-none">
                  NaariAI Assistant <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </h3>
                <span className="text-[10px] text-white/70 mt-0.5 block font-medium">TripNaari Safety & Travel Guide</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white rounded-lg p-1 hover:bg-white/10 transition">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFF8F0]/20">
            {messages.map((m, idx) => {
              if (m.role === "system") {
                return (
                  <div key={idx} className="flex justify-center">
                    <span className="text-[10px] bg-[#E2F7E4] text-[#1D7A27] px-3 py-1 rounded-full font-bold border border-[#C6ECCB]">
                      {m.content}
                    </span>
                  </div>
                );
              }

              const isUser = m.role === "user";
              return (
                <div key={idx} className="space-y-2">
                  <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                      isUser 
                        ? "bg-[#13253D] text-white rounded-tr-none" 
                        : "bg-white border border-[#F1D9D0] text-[#13253D] rounded-tl-none font-medium"
                    }`}>
                      <div className="whitespace-pre-line leading-relaxed">
                        {m.content}
                      </div>
                    </div>
                  </div>

                  {/* Render Inquiry Form inside chat if triggered */}
                  {!isUser && m.triggerForm && !formSubmitted && (
                    <div className="flex justify-start">
                      <div className="w-[90%] bg-white border border-[#FF4A7D]/30 rounded-2xl p-4 shadow-md mt-1 animate-in fade-in zoom-in-95 duration-200">
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
                            className="w-full bg-[#13253D] hover:bg-[#FF4A7D] text-white text-[11px] font-bold py-2 rounded-lg transition disabled:opacity-50 mt-1 shadow-sm"
                          >
                            {formLoading ? "Sending Details..." : "Confirm & Send enquiry"}
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
                    <span className="text-[10px] text-[#3D4A5E] font-medium">NaariAI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {!isLoading && messages.length < 5 && (
            <div className="px-4 py-2 bg-white border-t border-[#F1D9D0] shrink-0">
              <div className="text-[9px] font-extrabold uppercase text-[#3D4A5E]/60 tracking-wider mb-1.5 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-[#FF4A7D]" /> Common Questions
              </div>
              <div className="flex flex-col gap-1">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s.prompt)}
                    className="text-[10.5px] text-[#13253D] hover:text-[#FF4A7D] border border-[#F1D9D0] hover:border-[#FF4A7D]/30 bg-[#FFF8F0]/30 hover:bg-[#FFF0F4] px-2.5 py-1.5 rounded-lg text-left transition font-semibold flex items-center justify-between"
                  >
                    <span>{s.label}</span>
                    <ArrowRight className="w-3 h-3 text-[#FF4A7D]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Panel */}
          <div className="p-3 border-t border-[#F1D9D0] bg-white flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isRateLimited ? "Limit reached for today." : "Ask anything about our trips..."}
              disabled={isLoading || isRateLimited}
              className="flex-1 border border-[#F1D9D0] rounded-full px-4 py-2 text-xs focus:outline-none focus:border-[#FF4A7D]/40 font-medium text-[#13253D]"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || isRateLimited}
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
