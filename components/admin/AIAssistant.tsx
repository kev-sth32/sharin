"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Send, Sparkles, User, FileText, CheckCircle, Trash2, ArrowRight } from "lucide-react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function AIAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your Naari AI Copilot. I can help you draft replies, write itineraries, or outline blogs. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Listen for active lead events from CRM
  useEffect(() => {
    const handleContextEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.type === "lead") {
        setSelectedLead(customEvent.detail.data);
        setIsOpen(true);
        // Inject a welcome message about the lead
        const lead = customEvent.detail.data;
        setMessages(prev => [
          ...prev,
          {
            role: "system",
            content: `📎 Context attached: ${lead.name} (${lead.destination})`
          }
        ]);
      }
    };

    window.addEventListener("tripnaari-ai-context", handleContextEvent);
    return () => {
      window.removeEventListener("tripnaari-ai-context", handleContextEvent);
    };
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    if (!textToSend) setInput("");
    
    const newMessages = [...messages, { role: "user" as const, content: query }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "admin",
          messages: newMessages.filter(m => m.role !== "system"), // filter out local system notification messages
          context: {
            pathname,
            selectedLead,
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.reply) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: `❌ Error: ${data.error || "Failed to get reply from AI assistant."}` }
        ]);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "❌ Error connecting to the server. Please check if your dev server is running." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = () => {
    const list = [];
    if (pathname.includes("/leads")) {
      if (selectedLead) {
        list.push({
          label: `Draft WhatsApp for ${selectedLead.name.split(" ")[0]}`,
          prompt: `Draft a quick WhatsApp follow-up message to ${selectedLead.name} regarding their travel inquiry to ${selectedLead.destination || "their destination"} in ${selectedLead.travelMonth || "the scheduled month"}. Mention safety guidelines.`
        });
        list.push({
          label: "Create Email Proposal",
          prompt: `Draft an introductory email proposal to ${selectedLead.name} (${selectedLead.email}) for a trip to ${selectedLead.destination || "their destination"} for ${selectedLead.travelers} travelers. Make it encouraging and safe.`
        });
      } else {
        list.push({
          label: "Draft response template",
          prompt: "Draft a generic friendly follow-up email response template for a new female traveler who filled out our form."
        });
      }
      list.push({
        label: "Summarize lead pipeline rules",
        prompt: "What are the rules for moving a lead from 'New' status to 'Booked'?"
      });
    } else if (pathname.includes("/trips")) {
      list.push({
        label: "Generate Spiti itinerary outline",
        prompt: "Draft a 6-day itinerary outline for a girls-only Spiti Valley trip starting and ending in Manali. Include safety highlights."
      });
      list.push({
        label: "SEO description guidelines",
        prompt: "Explain how to write a high-converting, SEO-optimized description for a women-only trip package."
      });
    } else if (pathname.includes("/blogs")) {
      list.push({
        label: "Brainstorm Solo Travel topics",
        prompt: "Suggest 5 blog post title ideas targeting young solo women travelers in India, highlighting safety and community."
      });
      list.push({
        label: "Outline Kashmir safety guide",
        prompt: "Provide an outline for a blog post titled 'Is Kashmir Safe for Solo Female Travelers in 2026? Direct safety advice.'"
      });
    } else if (pathname.includes("/finance")) {
      list.push({
        label: "How to log refunds?",
        prompt: "Explain the standard workflow to record a client refund and its impact on net profit calculations."
      });
    } else {
      list.push({
        label: "Draft safety checklist post",
        prompt: "Create a draft outline of a 5-point safety audit checklist we can share with women travelers."
      });
    }

    // Default general chips
    list.push({
      label: "Explain Refund Policy",
      prompt: "What is TripNaari's standard refund and cancellation schedule?"
    });

    return list.slice(0, 3);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#13253D] text-white hover:bg-[#FF4A7D] transition-all duration-300 shadow-xl border border-white/20 animate-pulse hover:animate-none"
        title="Open AI Assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6 text-[#FF8A2B]" />}
      </button>
 
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs transition-opacity md:hidden"
        />
      )}
 
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-screen w-full sm:w-[420px] bg-white border-l border-[#F1D9D0] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-[#13253D] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF4A7D] grid place-items-center font-bold text-sm text-white">AI</div>
            <div>
              <h2 className="font-bold text-sm leading-none flex items-center gap-1.5">
                Naari AI Copilot <span className="text-[9px] uppercase tracking-widest bg-white/20 px-1 rounded text-[#FF8A2B]">Admin</span>
              </h2>
              <p className="text-[10px] text-white/70 mt-0.5">Context-aware website assistant</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 hover:bg-white/10 text-white/80 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selected Context Banner */}
        {selectedLead && (
          <div className="bg-[#FFF0F4] border-b border-[#FF4A7D]/20 px-4 py-2 flex items-center justify-between text-xs text-[#FF4A7D] font-medium">
            <span className="truncate">📎 Active context: <strong>{selectedLead.name}</strong> ({selectedLead.destination})</span>
            <button 
              onClick={() => setSelectedLead(null)} 
              className="text-[#3D4A5E] hover:text-[#FF4A7D] font-bold shrink-0 ml-2"
              title="Clear context"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFF8F0]/30">
          {messages.map((m, idx) => {
            if (m.role === "system") {
              return (
                <div key={idx} className="flex justify-center">
                  <span className="text-[10px] bg-[#EBEBEB] text-[#555] px-2 py-1 rounded-full font-medium">
                    {m.content}
                  </span>
                </div>
              );
            }
            
            const isAdmin = m.role === "user";
            return (
              <div key={idx} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                  isAdmin 
                    ? "bg-[#13253D] text-white rounded-tr-none" 
                    : "bg-white border border-[#F1D9D0] text-[#13253D] rounded-tl-none"
                }`}>
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] opacity-75 font-semibold">
                    {isAdmin ? <User className="h-3 w-3" /> : <Sparkles className="h-3 w-3 text-[#FF4A7D]" />}
                    {isAdmin ? "You" : "NaariAI"}
                  </div>
                  <div className="whitespace-pre-line font-medium leading-relaxed">
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#F1D9D0] text-[#13253D] max-w-[85%] rounded-2xl rounded-tl-none p-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-[#FF4A7D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#FF4A7D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#FF4A7D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] text-[#3D4A5E] font-medium">NaariAI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-[#F1D9D0] bg-white">
          <div className="text-[10px] font-bold text-[#3D4A5E] uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[#FF8A2B]" /> Quick Actions
          </div>
          <div className="flex flex-wrap gap-1.5">
            {getSuggestions().map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s.prompt)}
                disabled={isLoading}
                className="text-[11px] text-[#13253D] border border-[#F1D9D0] bg-[#FFF8F0] hover:bg-[#FFF0F4] hover:border-[#FF4A7D]/30 px-2.5 py-1.5 rounded-lg text-left transition disabled:opacity-50 font-semibold flex items-center gap-1"
              >
                {s.label} <ArrowRight className="h-3 w-3 text-[#FF4A7D] shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#F1D9D0] bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask AI anything..."
            disabled={isLoading}
            className="flex-1 border border-[#F1D9D0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#FF4A7D]/40 font-medium text-[#13253D]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="rounded-xl bg-[#13253D] hover:bg-[#FF4A7D] text-white p-2.5 transition disabled:opacity-50 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
