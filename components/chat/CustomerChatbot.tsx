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
  const [isTyping, setIsTyping] = useState(false);
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

  const [conversationId, setConversationId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversationId
  useEffect(() => {
    let id = sessionStorage.getItem("tripnaari_ai_conv_id");
    if (!id) {
      id = "conv_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      sessionStorage.setItem("tripnaari_ai_conv_id", id);
    }
    setConversationId(id);
  }, []);

  // Load dynamic welcome message from AI Settings
  useEffect(() => {
    async function fetchAISettings() {
      try {
        const response = await fetch("/api/chat/settings");
        if (response.ok) {
          const data = await response.json();
          if (data.welcomeMessage) {
            setMessages([
              {
                role: "assistant",
                content: data.welcomeMessage
              }
            ]);
          }
        }
      } catch (error) {
        console.warn("Failed to load dynamic welcome message", error);
      }
    }
    fetchAISettings();
  }, []);

  // Track if StickyCTA is active and visible
  const [isStickyCTAVisible, setIsStickyCTAVisible] = useState(false);

  useEffect(() => {
    const handleToggleChat = () => {
      setIsOpen(prev => !prev);
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

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (pathname.startsWith("/admin")) return null;

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

      // Add a placeholder assistant message and clear thinking bubble
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "" }
      ]);

      // Start the smooth typewriter interval loop
      const typewriterInterval = setInterval(() => {
        if (textQueue.length > 0) {
          // Adjust character printing speed dynamically based on buffer size (optimized for 35ms ticks)
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
          setIsTyping(false); // Finished typing!
        }
      }, 35); // 35ms ticks reduce React rendering load by half

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

      // Periodically check if typewriter is fully finished before checking form triggers
      const checkFinishedInterval = setInterval(() => {
        if (done && textQueue.length === 0) {
          clearInterval(checkFinishedInterval);

          if (streamedReply.includes("[SHOW_ENQUIRY_FORM]")) {
            const cleanReply = streamedReply.replace("[SHOW_ENQUIRY_FORM]", "").trim();
            const triggerForm = true;

            const destinations = ["kashmir", "kerala", "meghalaya", "rajasthan", "spiti", "ladakh"];
            const matchedDest = destinations.find(d => query.toLowerCase().includes(d));
            
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === "assistant") {
                last.content = cleanReply;
                last.triggerForm = triggerForm;
              }
              return updated;
            });

            if (matchedDest) {
              setFormData(prev => ({ 
                ...prev, 
                destination: matchedDest.charAt(0).toUpperCase() + matchedDest.slice(1) 
              }));
            }
          }
        }
      }, 100);

    } catch (e) {
      console.error("Chat error:", e);
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "I apologize, but I am experiencing some difficulties. Please call or WhatsApp our helpline at +91 98765 43210 for immediate support!" }
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

  const suggestions = [
    { label: "Is solo travel safe here?", prompt: "How does TripNaari ensure safety for a first-time solo female traveler?" },
    { label: "Do you have Kashmir departures?", prompt: "What are the upcoming women-only departures to Kashmir?" },
    { label: "What is your refund policy?", prompt: "What is your refund policy and cancellation timeline?" }
  ];

  return (
    <>
      {/* Floating Chat Bubble - repositioned to float above StickyCTA when visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed ${isStickyCTAVisible ? "bottom-[calc(76px+max(16px,env(safe-area-inset-bottom)))]" : "bottom-6"} right-6 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-[#13253D] text-white hover:bg-[#FF4A7D] transition-all duration-300 shadow-xl border border-white/20 hover:scale-105`}
        title="Chat with NaariAI"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6 text-white" />}
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <div className={`fixed ${isStickyCTAVisible ? "bottom-[calc(96px+max(16px,env(safe-area-inset-bottom)))]" : "bottom-24"} right-6 z-[70] w-[90%] sm:w-[380px] h-[500px] bg-white border border-[#F1D9D0] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300`}>
          
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
          {!isLoading && !isTyping && messages.length < 5 && (
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
              placeholder="Ask anything about our trips..."
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
