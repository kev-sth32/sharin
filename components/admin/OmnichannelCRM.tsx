"use client";

import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Bot, 
  UserCheck, 
  Phone, 
  Send, 
  Sparkles, 
  Search, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  UserPlus,
  Zap,
  DollarSign,
  Paperclip,
  StickyNote,
  Megaphone,
  Flame,
  Check,
  Tag
} from "lucide-react";

interface InternalNote {
  id: number;
  author: string;
  text: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  channel: "instagram" | "whatsapp" | "website_chat";
  externalUserId: string;
  externalUsername: string;
  customerName: string;
  assignedAgent?: string;
  mode: "ai" | "human";
  status: "active" | "qualified" | "quote_sent" | "payment_pending" | "booked" | "closed";
  dripStep?: number;
  internalNotes?: InternalNote[];
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Array<{
    id: number;
    senderType: "user" | "ai" | "admin";
    content: string;
    createdAt: string;
  }>;
  lead?: {
    destination?: string;
    travelMonth?: string;
    phone?: string;
    budget?: string;
    travelers?: number;
    intentScore?: number;
  };
}

export default function OmnichannelCRM() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterChannel, setFilterChannel] = useState<"all" | "instagram" | "whatsapp" | "escalated">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isInternalNoteMode, setIsInternalNoteMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  
  // Quote form state
  const [quoteDestination, setQuoteDestination] = useState("Ladakh Women Special");
  const [quoteSlug, setQuoteSlug] = useState("ladakh-women-special");
  const [quotePrice, setQuotePrice] = useState(32999);
  const [quoteTravelers, setQuoteTravelers] = useState(2);
  const [quoteDeposit, setQuoteDeposit] = useState(8000);

  // Broadcast form state
  const [broadcastTitle, setBroadcastTitle] = useState("Kashmir Women Autumn Expedition Launch 🏔️");
  const [broadcastSegment, setBroadcastSegment] = useState("all_qualified");
  const [broadcastMessage, setBroadcastMessage] = useState("Exciting news! Our Kashmir Autumn Batch is officially open for booking. Get 10% early bird discount by reserving today!");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/crm");
      const data = await res.json();
      if (data.conversations && data.conversations.length > 0) {
        setConversations(data.conversations);
        if (!selectedId) setSelectedId(data.conversations[0].id);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedConv = conversations.find(c => c.id === selectedId) || conversations[0];

  const handleToggleMode = async (newMode: "ai" | "human") => {
    if (!selectedConv) return;
    try {
      setActionLoading(true);
      await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_mode",
          conversationId: selectedConv.id,
          mode: newMode
        })
      });

      setConversations(prev =>
        prev.map(c => c.id === selectedConv.id ? { ...c, mode: newMode } : c)
      );
    } catch (err) {
      console.error("Failed to toggle mode:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: Conversation["status"]) => {
    if (!selectedConv) return;
    try {
      await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          conversationId: selectedConv.id,
          status: newStatus
        })
      });

      setConversations(prev =>
        prev.map(c => c.id === selectedConv.id ? { ...c, status: newStatus } : c)
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleAssignAgent = async (agentName: string) => {
    if (!selectedConv) return;
    try {
      await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_agent",
          conversationId: selectedConv.id,
          agentName
        })
      });

      setConversations(prev =>
        prev.map(c => c.id === selectedConv.id ? { ...c, assignedAgent: agentName } : c)
      );
    } catch (err) {
      console.error("Failed to assign agent:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConv) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.url || data.secure_url) {
        const fileUrl = data.url || data.secure_url;
        setReplyText(prev => `${prev} 📄 Attached File: ${fileUrl}`);
      }
    } catch (err) {
      alert("Failed to upload attachment file.");
    }
  };

  const handleTriggerDripEngine = async () => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger_drip" })
      });
      const data = await res.json();
      alert(`🚀 Sales Drip Engine Executed!\n${data.messagesSent?.join("\n") || "Follow-up triggers evaluated."}`);
      fetchConversations();
    } catch (err) {
      alert("Failed to run drip engine.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLaunchBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "launch_broadcast",
          broadcastPayload: {
            campaignTitle: broadcastTitle,
            segment: broadcastSegment,
            textMessage: broadcastMessage
          }
        })
      });
      const data = await res.json();
      alert(`📢 Broadcast Campaign Launched!\nDispatched to ${data.recipientCount} target WhatsApp recipients.`);
      setShowBroadcastModal(false);
      fetchConversations();
    } catch (err) {
      alert("Failed to launch broadcast campaign.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv) return;

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_quote",
          conversationId: selectedConv.id,
          quoteInput: {
            conversationId: selectedConv.id,
            tripSlug: quoteSlug,
            tripTitle: quoteDestination,
            pricePerHead: Number(quotePrice),
            travelersCount: Number(quoteTravelers),
            depositAmount: Number(quoteDeposit)
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowQuoteModal(false);
        fetchConversations();
      }
    } catch (err) {
      console.error("Failed to send quotation:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReplyOrNote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;

    const textToSend = replyText;
    setReplyText("");

    if (isInternalNoteMode) {
      // Post private internal note
      const newNote: InternalNote = {
        id: Date.now(),
        author: selectedConv.assignedAgent || "Admin Support",
        text: textToSend,
        createdAt: new Date().toISOString()
      };

      setConversations(prev =>
        prev.map(c => {
          if (c.id === selectedConv.id) {
            return {
              ...c,
              internalNotes: [...(c.internalNotes || []), newNote]
            };
          }
          return c;
        })
      );

      await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_internal_note",
          conversationId: selectedConv.id,
          noteText: textToSend,
          agentName: selectedConv.assignedAgent
        })
      });
    } else {
      // Send regular customer response
      const newMsg = {
        id: Date.now(),
        senderType: "admin" as const,
        content: textToSend,
        createdAt: new Date().toISOString()
      };

      setConversations(prev =>
        prev.map(c => {
          if (c.id === selectedConv.id) {
            return {
              ...c,
              mode: "human",
              lastMessageText: textToSend,
              lastMessageAt: new Date().toISOString(),
              messages: [...(c.messages || []), newMsg]
            };
          }
          return c;
        })
      );

      await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_admin_reply",
          conversationId: selectedConv.id,
          messageText: textToSend
        })
      });
    }
  };

  const filteredConversations = conversations.filter(c => {
    if (filterChannel === "instagram" && c.channel !== "instagram") return false;
    if (filterChannel === "whatsapp" && c.channel !== "whatsapp") return false;
    if (filterChannel === "escalated" && c.mode !== "human") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.externalUsername.toLowerCase().includes(q) ||
        (c.lastMessageText && c.lastMessageText.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

      {/* 1. Header & Quick Analytics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#F1D9D0] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF4A7D] to-[#FF8A2B] text-white flex items-center justify-center font-bold text-xl shadow-md">
            🚀
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#13253D]">AI Omnichannel Sales CRM</h1>
            <p className="text-xs text-[#3D4A5E] mt-0.5">Automated Lead Qualification, Instant Quotations & WhatsApp Sales Drip</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#13253D] text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition"
          >
            <Megaphone className="w-3.5 h-3.5 text-[#FF4A7D]" />
            <span>Launch WhatsApp Campaign</span>
          </button>

          <button
            onClick={handleTriggerDripEngine}
            disabled={actionLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-[#FF4A7D] text-white rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Run Drip Engine</span>
          </button>

          <button
            onClick={fetchConversations}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#FFF8F0] border border-[#F1D9D0] rounded-xl text-xs font-semibold text-[#13253D] hover:bg-[#FFF0F4] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FF4A7D]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#F1D9D0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-[#13253D]">{conversations.length}</div>
            <div className="text-[11px] font-medium text-gray-500">Active Inquiries</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#F1D9D0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-[#13253D]">{conversations.filter(c => c.mode === "ai").length}</div>
            <div className="text-[11px] font-medium text-gray-500">AI Bot Handling</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#F1D9D0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-[#13253D]">{conversations.filter(c => c.status === "quote_sent" || c.status === "payment_pending").length}</div>
            <div className="text-[11px] font-medium text-gray-500">Quotes & Pending</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#F1D9D0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-[#13253D]">{conversations.filter(c => c.channel === "whatsapp").length}</div>
            <div className="text-[11px] font-medium text-gray-500">WhatsApp Verified</div>
          </div>
        </div>
      </div>

      {/* 2. Main Split-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">

        {/* LEFT COLUMN: Conversation Threads List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#F1D9D0] shadow-sm flex flex-col overflow-hidden">
          
          <div className="p-3 border-b border-[#F1D9D0] bg-[#FFF8F0] space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads, handle or text..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white text-xs border border-[#F1D9D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4A7D]"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto scrollbar-none pt-1">
              {[
                { id: "all", label: "All" },
                { id: "instagram", label: "Instagram 🟣" },
                { id: "whatsapp", label: "WhatsApp 🟢" },
                { id: "escalated", label: "Human 🚨" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterChannel(tab.id as any)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                    filterChannel === tab.id
                      ? "bg-[#13253D] text-white"
                      : "bg-white text-gray-600 hover:bg-[#FFF0F4] border border-[#F1D9D0]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#F1D9D0]/50 max-h-[520px]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No active conversations match filter
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = selectedConv && selectedConv.id === conv.id;
                const isHotLead = (conv.lead?.intentScore && conv.lead.intentScore >= 80) || conv.lead?.phone;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`p-3.5 cursor-pointer transition flex items-start gap-3 relative ${
                      isSelected
                        ? "bg-[#FFF0F4] border-l-4 border-l-[#FF4A7D]"
                        : "hover:bg-[#FFF8F0]"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-[#FF4A7D] text-white flex items-center justify-center font-bold text-sm">
                        {conv.customerName.charAt(0)}
                      </div>
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[9px] ${
                          conv.channel === "instagram"
                            ? "bg-purple-600 text-white"
                            : "bg-emerald-500 text-white"
                        }`}
                      >
                        {conv.channel === "instagram" ? "IG" : "WA"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="text-xs font-bold text-[#13253D] truncate">{conv.customerName}</h4>
                          {isHotLead && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-rose-100 text-[#FF4A7D] rounded-full flex items-center gap-0.5 shrink-0">
                              <Flame className="w-2.5 h-2.5" /> Hot
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-gray-500 font-mono truncate">{conv.externalUsername}</div>

                      <p className="text-[11px] text-gray-600 truncate mt-1">
                        {conv.lastMessageText}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            conv.mode === "ai"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700 animate-pulse"
                          }`}
                        >
                          {conv.mode === "ai" ? "🤖 AI Auto-Pilot" : "👩‍💼 Human Active"}
                        </span>

                        {conv.status === "payment_pending" ? (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                            💳 Payment Pending
                          </span>
                        ) : conv.status === "booked" ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            🎉 Booked
                          </span>
                        ) : conv.lead?.destination ? (
                          <span className="text-[10px] text-[#FF4A7D] font-semibold flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {conv.lead.destination}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: Live Chat & Private Team Notes (5 cols) */}
        {selectedConv ? (
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#F1D9D0] shadow-sm flex flex-col overflow-hidden">
            
            <div className="p-4 border-b border-[#F1D9D0] bg-[#FFF8F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#13253D] text-white flex items-center justify-center font-bold text-sm">
                  {selectedConv.customerName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#13253D]">{selectedConv.customerName}</h3>
                  <div className="text-[11px] text-gray-500">
                    {selectedConv.channel === "instagram" ? "Instagram DM" : "WhatsApp Business"} • {selectedConv.externalUsername}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQuoteModal(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-[#FF8A2B] text-white rounded-xl text-xs font-bold shadow-sm hover:brightness-110 transition flex items-center gap-1"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Send Quote
                </button>

                <button
                  onClick={() => handleToggleMode(selectedConv.mode === "ai" ? "human" : "ai")}
                  disabled={actionLoading}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 ${
                    selectedConv.mode === "ai"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-[#FF4A7D] text-white hover:bg-rose-700"
                  }`}
                >
                  {selectedConv.mode === "ai" ? (
                    <>
                      <Bot className="w-3.5 h-3.5" /> Human Takeover
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" /> Return AI
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Chat & Internal Notes Stream Body */}
            <div className="flex-1 p-4 bg-[#FAF6F0] overflow-y-auto space-y-3 min-h-[360px] max-h-[420px]">
              
              {/* Internal Notes Section Banner */}
              {selectedConv.internalNotes && selectedConv.internalNotes.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 mb-3">
                  <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <StickyNote className="w-3 h-3 text-amber-600" /> Private Admin Call Logs & Notes ({selectedConv.internalNotes.length})
                  </div>
                  {selectedConv.internalNotes.map(n => (
                    <div key={n.id} className="text-xs text-amber-900 bg-white p-2 rounded-lg border border-amber-200 shadow-2xs">
                      <div className="flex justify-between font-bold text-[10px] text-amber-700">
                        <span>📝 {n.author}</span>
                        <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="mt-0.5">{n.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Messages */}
              {selectedConv.messages && selectedConv.messages.map(msg => {
                const isUser = msg.senderType === "user";
                const isAi = msg.senderType === "ai";

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}
                  >
                    <div className="flex items-center gap-1 mb-1 px-1">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {isUser ? selectedConv.customerName : isAi ? "🤖 TripNaari AI" : "👩‍💼 Sales Manager"}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-wrap ${
                        isUser
                          ? "bg-white text-[#13253D] border border-gray-200 rounded-tl-none"
                          : isAi
                          ? "bg-[#13253D] text-white rounded-tr-none"
                          : "bg-[#FF4A7D] text-white rounded-tr-none"
                      }`}
                    >
                      {msg.content}
                    </div>

                    <span className="text-[9px] text-gray-400 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Reply Chips */}
            <div className="p-2 border-t border-[#F1D9D0] bg-white flex gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setReplyText("We have an upcoming Women-Only departure! Would you like the exact itinerary?")}
                className="px-2.5 py-1 bg-[#FFF0F4] border border-[#FF4A7D]/30 text-[#FF4A7D] rounded-full text-[10px] font-semibold whitespace-nowrap hover:bg-[#FF4A7D] hover:text-white transition"
              >
                🎒 Send Itinerary Info
              </button>
              <button
                onClick={() => setReplyText("Could you please share your WhatsApp phone number so our team can send over the custom quote?")}
                className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] font-semibold whitespace-nowrap hover:bg-emerald-600 hover:text-white transition"
              >
                📞 Request Phone Number
              </button>
            </div>

            {/* Mode Switch Bar (Reply to Customer vs Private Internal Note) */}
            <div className="px-3 pt-2 bg-white flex items-center justify-between border-t border-[#F1D9D0]">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsInternalNoteMode(false)}
                  className={`px-3 py-1 rounded-t-lg text-[10px] font-bold transition ${
                    !isInternalNoteMode
                      ? "bg-[#13253D] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  💬 Reply Customer
                </button>
                <button
                  type="button"
                  onClick={() => setIsInternalNoteMode(true)}
                  className={`px-3 py-1 rounded-t-lg text-[10px] font-bold flex items-center gap-1 transition ${
                    isInternalNoteMode
                      ? "bg-amber-500 text-white"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                  }`}
                >
                  <StickyNote className="w-3 h-3" /> Private Team Note
                </button>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-gray-500 hover:text-[#FF4A7D] flex items-center gap-1 font-semibold"
                title="Attach PDF Brochure / Voucher"
              >
                <Paperclip className="w-3.5 h-3.5" /> Attach File
              </button>
            </div>

            {/* Reply Composer Input */}
            <form onSubmit={handleSendReplyOrNote} className={`p-3 border-t border-[#F1D9D0] flex items-center gap-2 ${isInternalNoteMode ? "bg-amber-50" : "bg-white"}`}>
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={
                  isInternalNoteMode
                    ? "Log private internal call note / team comment..."
                    : selectedConv.mode === "ai"
                    ? "Type to take over chat & reply manually..."
                    : "Type reply to customer..."
                }
                className="flex-1 px-3 py-2 text-xs border border-[#F1D9D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4A7D]"
              />
              <button
                type="submit"
                className={`px-4 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                  isInternalNoteMode ? "bg-amber-600 hover:bg-amber-700" : "bg-[#FF4A7D] hover:bg-rose-600"
                }`}
              >
                <span>{isInternalNoteMode ? "Log Note" : "Send"}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : null}

        {/* RIGHT COLUMN: Sales Intelligence & Lead Lifecycle Pipeline (3 cols) */}
        {selectedConv ? (
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#F1D9D0] shadow-sm p-4 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1D9D0] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#13253D] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FF4A7D]" /> Sales Intelligence
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                  Score: {selectedConv.lead?.intentScore || 75}/100
                </span>
              </div>

              {/* Lead Lifecycle Pipeline Stage Selector */}
              <div className="p-2.5 rounded-xl bg-[#FFF8F0] border border-[#F1D9D0]">
                <label className="text-[10px] font-bold text-gray-500 flex items-center gap-1 mb-1">
                  <Tag className="w-3 h-3 text-[#FF4A7D]" /> Pipeline Stage:
                </label>
                <select
                  value={selectedConv.status || "active"}
                  onChange={e => handleUpdateStatus(e.target.value as any)}
                  className="w-full text-xs bg-white border border-[#F1D9D0] rounded-lg p-1.5 font-bold text-[#13253D] focus:outline-none focus:ring-2 focus:ring-[#FF4A7D]"
                >
                  <option value="active">Active Inquiry</option>
                  <option value="qualified">AI Qualified</option>
                  <option value="quote_sent">Quote Sent</option>
                  <option value="payment_pending">Payment Pending 💳</option>
                  <option value="booked">Booked 🎉</option>
                  <option value="closed">Closed / Lost ❌</option>
                </select>
              </div>

              {/* Agent Assignment Selector */}
              <div className="p-2.5 rounded-xl bg-[#FFF8F0] border border-[#F1D9D0]">
                <label className="text-[10px] font-bold text-gray-500 flex items-center gap-1 mb-1">
                  <UserPlus className="w-3 h-3 text-[#FF4A7D]" /> Assigned Sales Manager:
                </label>
                <select
                  value={selectedConv.assignedAgent || "Unassigned"}
                  onChange={e => handleAssignAgent(e.target.value)}
                  className="w-full text-xs bg-white border border-[#F1D9D0] rounded-lg p-1 font-semibold text-[#13253D] focus:outline-none"
                >
                  <option value="Unassigned">Unassigned (AI Queue)</option>
                  <option value="Sneha Kapur">Sneha Kapur</option>
                  <option value="Rahul Sharma">Rahul Sharma</option>
                  <option value="Priya Singh">Priya Singh</option>
                </select>
              </div>

              {/* Extracted Details List */}
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF4A7D]" /> Destination:
                  </span>
                  <span className="text-xs font-bold text-[#13253D]">
                    {selectedConv.lead?.destination || "Unspecified"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" /> Travel Month:
                  </span>
                  <span className="text-xs font-bold text-[#13253D]">
                    {selectedConv.lead?.travelMonth || "Not mentioned"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" /> Phone:
                  </span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">
                    {selectedConv.lead?.phone || "Pending"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-500" /> Party Size:
                  </span>
                  <span className="text-xs font-bold text-[#13253D]">
                    {selectedConv.lead?.travelers || "1 traveler"}
                  </span>
                </div>
              </div>
            </div>

            {selectedConv.lead?.phone && (
              <a
                href={`https://wa.me/${selectedConv.lead.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Phone className="w-4 h-4" /> Call via WhatsApp
              </a>
            )}
          </div>
        ) : null}

      </div>

      {/* 3. Send Official Quotation Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-[#F1D9D0] animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#F1D9D0] pb-3">
              <h3 className="text-sm font-bold text-[#13253D] flex items-center gap-2">
                💳 Generate Instant Quotation & Deposit Link
              </h3>
              <button onClick={() => setShowQuoteModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendQuote} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Select Package:</label>
                <select
                  value={quoteSlug}
                  onChange={e => {
                    setQuoteSlug(e.target.value);
                    if (e.target.value === "ladakh-women-special") {
                      setQuoteDestination("Ladakh Women Special");
                      setQuotePrice(32999);
                    } else if (e.target.value === "meghalaya-backpacking") {
                      setQuoteDestination("Meghalaya Backpacking");
                      setQuotePrice(24999);
                    } else {
                      setQuoteDestination("Spiti Valley Circuit");
                      setQuotePrice(28999);
                    }
                  }}
                  className="w-full text-xs p-2 border border-[#F1D9D0] rounded-xl font-semibold focus:ring-2 focus:ring-[#FF4A7D]"
                >
                  <option value="ladakh-women-special">Ladakh Women Special (₹32,999)</option>
                  <option value="meghalaya-backpacking">Meghalaya Backpacking (₹24,999)</option>
                  <option value="spiti-valley-circuit">Spiti Valley Circuit (₹28,999)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">Travelers:</label>
                  <input
                    type="number"
                    min="1"
                    value={quoteTravelers}
                    onChange={e => setQuoteTravelers(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-[#F1D9D0] rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">Deposit (₹):</label>
                  <input
                    type="number"
                    value={quoteDeposit}
                    onChange={e => setQuoteDeposit(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-[#F1D9D0] rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FFF8F0] border border-[#F1D9D0] rounded-xl text-xs space-y-1">
                <div className="flex justify-between font-medium text-gray-600">
                  <span>Total Package Price:</span>
                  <span>₹{(quotePrice * quoteTravelers).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Deposit Payable Now:</span>
                  <span>₹{Number(quoteDeposit).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-[#FF4A7D] text-white rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition"
                >
                  Send Link to Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. WhatsApp Bulk Broadcast Campaign Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl border border-[#F1D9D0] animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#F1D9D0] pb-3">
              <h3 className="text-sm font-bold text-[#13253D] flex items-center gap-2">
                📢 Launch Segmented WhatsApp Broadcast Campaign
              </h3>
              <button onClick={() => setShowBroadcastModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleLaunchBroadcast} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Campaign Name:</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={e => setBroadcastTitle(e.target.value)}
                  className="w-full text-xs p-2 border border-[#F1D9D0] rounded-xl font-semibold"
                  placeholder="e.g. Kashmir Autumn Expedition Launch"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Target Customer Segment:</label>
                <select
                  value={broadcastSegment}
                  onChange={e => setBroadcastSegment(e.target.value)}
                  className="w-full text-xs p-2 border border-[#F1D9D0] rounded-xl font-semibold"
                >
                  <option value="all_qualified">All Qualified WhatsApp Leads</option>
                  <option value="ladakh_interested">Ladakh Interested Leads</option>
                  <option value="meghalaya_interested">Meghalaya Interested Leads</option>
                  <option value="past_bookers">Past Booked Travelers</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Broadcast Announcement Text:</label>
                <textarea
                  rows={4}
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  className="w-full text-xs p-2 border border-[#F1D9D0] rounded-xl font-medium focus:ring-2 focus:ring-[#FF4A7D]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-[#13253D] hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Dispatch Campaign Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
