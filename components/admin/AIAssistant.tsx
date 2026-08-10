"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, X, Send, Sparkles, User, FileText, CheckCircle, Trash2, ArrowRight } from "lucide-react";
import { updateLeadFull } from "@/lib/admin-store";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function AIAssistant() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your Naari AI Copilot. I can help you draft replies, write itineraries, or outline blogs. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [formAppliedSuccess, setFormAppliedSuccess] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showManual, setShowManual] = useState(true);
  
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

  const handleNavigateCommand = (text: string) => {
    const navMatch = text.match(/\[NAVIGATE:(.*?)\]/);
    if (navMatch) {
      const path = navMatch[1].trim();
      
      // Clean navigate tag from visibility
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === "assistant") {
          last.content = last.content.replace(/\[NAVIGATE:.*?\]/g, "").trim();
        }
        return updated;
      });

      // Redirect
      router.push(path);
    }
  };

  const handleLeadUpdatesCommand = async (text: string) => {
    // Flexible regex supporting [UPDATE_LEAD_STATUS:123:status], **UPDATE_LEAD_STATUS:**123:status, or UPDATE_LEAD_STATUS:123:status
    const regex = /(?:\[|\*\*|)?UPDATE_LEAD_STATUS(?:\]|\*\*)?:?\s*(\d+)\s*:\s*([a-z_]+)/gi;
    const updateMatches = [...text.matchAll(regex)];
    
    if (updateMatches.length > 0) {
      for (const match of updateMatches) {
        const id = parseInt(match[1]);
        const status = match[2].trim().toLowerCase();
        
        // Find existing notes/followup for this lead to preserve them
        const lead = selectedLead && selectedLead.id === id ? selectedLead : null;
        const notes = lead?.notes || "";
        const followUpAt = lead?.followUpAt || "";

        try {
          await updateLeadFull(id, status, notes, followUpAt);
        } catch (e) {
          console.error("Failed to execute database lead status update:", e);
        }
      }

      // Sync data changes on current active page
      router.refresh();

      // Clean update tags from messages
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === "assistant") {
          last.content = last.content.replace(regex, "").trim();
        }
        return updated;
      });

      // Show temporary visual feedback banner
      setFormAppliedSuccess(true);
      setTimeout(() => setFormAppliedSuccess(false), 4000);
    }
  };

  const handleApplyForm = (data: any) => {
    let appliedCount = 0;
    Object.entries(data).forEach(([key, val]) => {
      if (typeof val !== "string" && typeof val !== "number") return;
      
      const el = document.querySelector(`[name="${key}"], [id="${key}"], [placeholder*="${key}" i]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (el) {
        el.value = String(val);
        // Trigger React state listeners
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        appliedCount++;
      }
    });

    if (appliedCount > 0) {
      setFormAppliedSuccess(true);
      setTimeout(() => setFormAppliedSuccess(false), 4000);
    } else {
      alert("No matching input fields (by name, id, or placeholder) found on this page to apply draft.");
    }
  };

  const cleanMessageText = (text: string) => {
    let clean = text.replace(/\[NAVIGATE:.*?\]/g, "");
    
    // Strip update tag
    const statusRegex = /(?:\[|\*\*|)?UPDATE_LEAD_STATUS(?:\]|\*\*)?:?\s*\d+\s*:\s*[a-z_]+/gi;
    clean = clean.replace(statusRegex, "");

    // Strip whatsapp target tag
    const waTargetRegex = /(?:\[|\*\*|)?WHATSAPP_TARGET(?:\]|\*\*)?:?\s*[+0-9\s-]+(?:\]|\*\*)?/gi;
    clean = clean.replace(waTargetRegex, "");

    // Strip email target tag
    const emailTargetRegex = /(?:\[|\*\*|)?EMAIL_TARGET(?:\]|\*\*)?:?\s*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\]|\*\*)?/gi;
    clean = clean.replace(emailTargetRegex, "");

    clean = clean.replace(/```json[\s\S]*?```/g, "");
    clean = clean.replace(/[*#`_-]/g, "").trim();
    return clean;
  };

  const handleSendWhatsApp = (text: string, phone: string) => {
    const cleanText = cleanMessageText(text);
    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(cleanText)}`;
    window.open(url, "_blank");
  };

  const handleSendEmail = (text: string, email: string) => {
    const cleanText = cleanMessageText(text);
    const subject = `Update regarding your TripNaari trip`;
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(cleanText)}`;
    window.open(url, "_self");
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
          role: "admin",
          messages: newMessages.filter(m => m.role !== "system"),
          context: {
            pathname,
            selectedLead,
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
          setIsTyping(false); // Finished typing!
          handleNavigateCommand(displayedReply);
          handleLeadUpdatesCommand(displayedReply);
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

    } catch (e) {
      console.error("Admin chat error:", e);
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "❌ Error connecting to the server. Please check if your dev server is running." }
      ]);
    }
  };

  const getSuggestions = () => {
    const actions = [];
    const questions = [];

    // Base default questions
    questions.push({
      label: "📊 Total Revenue & Profit",
      prompt: "Show me a financial summary of total revenue, expenses, and net profit."
    });
    questions.push({
      label: "❓ Refund Policies",
      prompt: "Explain TripNaari's standard refund and cancellation schedule."
    });

    if (pathname.includes("/leads")) {
      if (selectedLead) {
        actions.push({
          label: `💬 WhatsApp ${selectedLead.name.split(" ")[0]}`,
          prompt: `Draft a quick WhatsApp follow-up message to ${selectedLead.name} regarding their travel inquiry to ${selectedLead.destination || "their destination"} in ${selectedLead.travelMonth || "the scheduled month"}. Mention safety guidelines.`
        });
        actions.push({
          label: "✉️ Email Proposal",
          prompt: `Draft an introductory email proposal to ${selectedLead.name} (${selectedLead.email}) for a trip to ${selectedLead.destination || "their destination"} for ${selectedLead.travelers} travelers. Make it encouraging and safe.`
        });
        questions.push({
          label: "🔍 Lead Audit",
          prompt: `Summarize the booking notes and details for lead ${selectedLead.name}.`
        });
      } else {
        actions.push({
          label: "📝 Draft generic follow-up",
          prompt: "Draft a generic friendly follow-up email response template for a new female traveler."
        });
      }
      questions.push({
        label: "💰 Find High Budget Leads",
        prompt: "Who are our highest budget CRM leads? List their details and destination."
      });
      questions.push({
        label: "🏷️ Lead Pipeline Rules",
        prompt: "What are the rules for moving a lead from 'New' status to 'Booked'?"
      });
    } else if (pathname.includes("/trips")) {
      actions.push({
        label: "🎒 Itinerary Builder",
        prompt: "Draft a 6-day itinerary outline for a girls-only Spiti Valley trip starting and ending in Manali. Include safety highlights."
      });
      actions.push({
        label: "✨ SEO Content Builder",
        prompt: "Explain how to write a high-converting, SEO-optimized description for a women-only trip package."
      });
      questions.push({
        label: "📅 Verify Departures status",
        prompt: "Show me all scheduled departures, their pricing, and seat vacancy status."
      });
    } else if (pathname.includes("/blogs")) {
      actions.push({
        label: "✍️ Write Blog Draft (JSON)",
        prompt: "Draft a structured safety tips blog post in JSON format with keys: title, slug, category, excerpt, and content."
      });
      questions.push({
        label: "💡 Topic Brainstorming",
        prompt: "Suggest 5 blog post title ideas targeting young solo women travelers in India, highlighting safety and community."
      });
      questions.push({
        label: "🗺️ Kashmir Safety Outline",
        prompt: "Provide an outline for a blog post titled 'Is Kashmir Safe for Solo Female Travelers in 2026? Direct safety advice.'"
      });
    } else if (pathname.includes("/finance")) {
      actions.push({
        label: "💵 Refund entry guide",
        prompt: "Explain the standard workflow to record a client refund and its impact on net profit calculations."
      });
      questions.push({
        label: "📉 Expense Category Breakdown",
        prompt: "Can you list all expenses from our financial logs categorized by category?"
      });
    } else if (pathname.includes("/ai-settings")) {
      actions.push({
        label: "🛠️ Reset welcome prompts",
        prompt: "Reset our custom identity welcome message back to standard guidelines."
      });
      questions.push({
        label: "📊 AI usage overview",
        prompt: "Can you list the total chats, user messages, and active tone options from our AI logs?"
      });
    } else {
      actions.push({
        label: "🛡️ Safety Checklist Draft",
        prompt: "Create a draft outline of a 5-point safety audit checklist we can share with women travelers."
      });
      questions.push({
        label: "📅 Departures count",
        prompt: "Show me all departures scheduled on our platform."
      });
    }

    // Navigation actions (available everywhere)
    actions.push({
      label: "🧭 Go to CRM board",
      prompt: "Go to the CRM leads board now. [NAVIGATE:/admin/leads]"
    });
    actions.push({
      label: "📈 Go to Finance",
      prompt: "Open the finance tracker page. [NAVIGATE:/admin/finance]"
    });
    actions.push({
      label: "📅 Go to Departures",
      prompt: "Open our scheduled departures list. [NAVIGATE:/admin/departures]"
    });

    return { actions, questions };
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
        className={`fixed top-0 right-0 z-50 h-screen w-full sm:w-[420px] bg-[#FFF8F0] border-l border-[#F1D9D0] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-[#13253D] text-white flex items-center justify-between shrink-0">
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

        {/* Form Applied Success Banner */}
        {formAppliedSuccess && (
          <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center gap-1.5 text-xs text-green-700 font-semibold animate-bounce shrink-0">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Action completed successfully!</span>
          </div>
        )}

        {/* Selected Context Banner */}
        {selectedLead && (
          <div className="bg-[#FFF0F4] border-b border-[#FF4A7D]/20 px-4 py-2 flex items-center justify-between text-xs text-[#FF4A7D] font-medium shrink-0">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/40">
          
          {/* Welcome Instruction Manual */}
          <div className="rounded-xl border border-[#F1D9D0] bg-[#FFF8F0] p-3 text-[11px] leading-relaxed text-[#13253D] shadow-2xs shrink-0">
            <button
              onClick={() => setShowManual(!showManual)}
              className="w-full flex items-center justify-between font-bold text-[#FF4A7D] uppercase tracking-wider text-[10px]"
            >
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#FF8A2B]" />
                <span>Naari AI Copilot Guide</span>
              </div>
              <span className="text-[9px] lowercase bg-[#FFF0F4] px-1.5 py-0.5 rounded border border-[#FF4A7D]/10">
                {showManual ? "Dismiss" : "Show Guide"}
              </span>
            </button>
            
            {showManual && (
              <div className="mt-2 space-y-2 border-t border-[#F1D9D0]/60 pt-2 text-[#3D4A5E]">
                <p className="font-semibold text-[#13253D]">Use these superpowers directly in your control panel:</p>
                <ul className="list-disc pl-4 space-y-1 font-medium">
                  <li><strong>📊 Database Queries:</strong> Ask *"Show profit margin"* or *"Who is our highest budget lead?"* to query live logs.</li>
                  <li><strong>🧭 Smart Navigation:</strong> Say *"take me to departures"* or *"open finance"* to trigger automated redirects.</li>
                  <li><strong>✍️ Form Autofilling:</strong> Ask me to draft a blog post in JSON, then click <em>Populate Active Editor Form</em> to auto-fill input fields.</li>
                  <li><strong>💬 Direct Messaging:</strong> Click a CRM Lead, ask me to write a follow-up, then click <em>WhatsApp Lead</em> or <em>Mail Lead</em>.</li>
                </ul>
              </div>
            )}
          </div>

          {messages.map((m, idx) => {
            if (m.role === "system") {
              return (
                <div key={idx} className="flex justify-center">
                  <span className="text-[10px] bg-[#EBEBEB] text-[#555] px-2.5 py-1 rounded-full font-medium">
                    {m.content}
                  </span>
                </div>
              );
            }
            
            const isAdmin = m.role === "user";
            
            // Try parse draft JSON content for form injection
            let parsedJson: any = null;
            if (!isAdmin) {
              const jsonMatch = m.content.match(/```json\s*([\s\S]*?)```/);
              if (jsonMatch) {
                try {
                  parsedJson = JSON.parse(jsonMatch[1].trim());
                } catch (e) {}
              }
            }

            // Extract inline WhatsApp or Email targets if provided by the AI
            const waMatch = m.content.match(/(?:\[|\*\*|)?WHATSAPP_TARGET(?:\]|\*\*)?:?\s*([+0-9\s-]+)/i);
            const mailMatch = m.content.match(/(?:\[|\*\*|)?EMAIL_TARGET(?:\]|\*\*)?:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);

            const targetPhone = waMatch ? waMatch[1].trim() : (selectedLead?.phone || null);
            const targetEmail = mailMatch ? mailMatch[1].trim() : (selectedLead?.email || null);

            const showCommunicationButtons = !isAdmin && (targetPhone || targetEmail);

            return (
              <div key={idx} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                  isAdmin 
                    ? "bg-[#13253D] text-white rounded-tr-none font-semibold" 
                    : "bg-white border border-[#F1D9D0] text-[#13253D] rounded-tl-none font-medium"
                }`}>
                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] opacity-75 font-semibold">
                    {isAdmin ? <User className="h-3 w-3" /> : <Sparkles className="h-3 w-3 text-[#FF4A7D]" />}
                    {isAdmin ? "You" : "NaariAI"}
                  </div>
                  
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {m.content
                      .replace(/\[NAVIGATE:.*?\]/g, "")
                      .replace(/(?:\[|\*\*|)?UPDATE_LEAD_STATUS(?:\]|\*\*)?:?\s*\d+\s*:\s*[a-z_]+/gi, "")
                      .replace(/(?:\[|\*\*|)?WHATSAPP_TARGET(?:\]|\*\*)?:?\s*[+0-9\s-]+(?:\]|\*\*)?/gi, "")
                      .replace(/(?:\[|\*\*|)?EMAIL_TARGET(?:\]|\*\*)?:?\s*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\]|\*\*)?/gi, "")
                      .trim()}
                  </div>

                  {/* Apply Form Injection Button */}
                  {parsedJson && (
                    <button
                      onClick={() => handleApplyForm(parsedJson)}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 bg-[#13253D] hover:bg-[#FF4A7D] text-white text-[10px] font-bold py-2 rounded-lg transition-all shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>✍️ Populate Active Editor Form</span>
                    </button>
                  )}

                  {/* WhatsApp & Email compose triggers */}
                  {showCommunicationButtons && (
                    <div className="mt-3 pt-3 border-t border-gray-150 flex gap-2 flex-wrap justify-between">
                      {targetPhone && (
                        <button
                          onClick={() => handleSendWhatsApp(m.content, targetPhone)}
                          className="flex-1 flex items-center justify-center gap-1 bg-[#128C7E] hover:bg-[#075E54] text-white text-[10px] font-bold py-2 rounded-lg transition-all shadow-xs whitespace-nowrap"
                        >
                          💬 WhatsApp Lead
                        </button>
                      )}
                      {targetEmail && (
                        <button
                          onClick={() => handleSendEmail(m.content, targetEmail)}
                          className="flex-1 flex items-center justify-center gap-1 bg-[#3b5998] hover:bg-[#2d4373] text-white text-[10px] font-bold py-2 rounded-lg transition-all shadow-xs whitespace-nowrap"
                        >
                          ✉️ Mail Lead
                        </button>
                      )}
                    </div>
                  )}

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
 
        {/* Collapsible Quick Actions & Suggestions */}
        <div className="border-t border-[#F1D9D0] bg-white shrink-0">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-[#3D4A5E] hover:bg-slate-50 transition-all border-b border-[#F1D9D0]/40"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#FF8A2B] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider">Quick Tasks & Suggestions</span>
            </div>
            <span className="text-[10px] font-bold text-[#FF4A7D] bg-[#FFF0F4] px-2 py-0.5 rounded border border-[#FF4A7D]/10">
              {showQuickActions ? "Hide Panel" : "Show Panel"}
            </span>
          </button>

          {showQuickActions && (
            <div className="p-3.5 space-y-4 max-h-[200px] overflow-y-auto scrollbar-thin bg-slate-50/40">
              
              {/* Task Automations list */}
              {getSuggestions().actions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[9px] font-extrabold uppercase text-[#3D4A5E]/60 tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A7D]" />
                    <span>⚡ Task Automations</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {getSuggestions().actions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(s.prompt)}
                        disabled={isLoading || isTyping}
                        className="text-[10px] text-[#13253D] border border-[#F1D9D0] bg-white hover:bg-[#FFF0F4] hover:border-[#FF4A7D]/30 px-2.5 py-1.5 rounded-lg text-left transition font-bold flex items-center gap-1 shadow-2xs"
                      >
                        <span>{s.label}</span>
                        <ArrowRight className="h-3 w-3 text-[#FF4A7D] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions to Ask list */}
              {getSuggestions().questions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[9px] font-extrabold uppercase text-[#3D4A5E]/60 tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF8A2B]" />
                    <span>❓ Suggestions to Ask</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {getSuggestions().questions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(s.prompt)}
                        disabled={isLoading || isTyping}
                        className="text-[10px] text-[#3D4A5E] border border-[#F1D9D0]/60 bg-white hover:bg-slate-100 hover:border-slate-300 px-2.5 py-1.5 rounded-lg text-left transition font-semibold flex items-center gap-1 shadow-2xs"
                      >
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#F1D9D0] bg-white flex gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask AI anything..."
            disabled={isLoading || isTyping}
            className="flex-1 border border-[#F1D9D0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#FF4A7D]/40 font-medium text-[#13253D]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || isTyping}
            className="rounded-xl bg-[#13253D] hover:bg-[#FF4A7D] text-white p-2.5 transition disabled:opacity-50 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
