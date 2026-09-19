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
  Tag,
  FileCheck,
  Gift,
  BarChart3,
  Star,
  Luggage,
  ShieldCheck,
  FileText,
  Trash2,
  Download,
  SlidersHorizontal,
  Filter,
  PlusCircle,
  FileSpreadsheet,
  Mail,
  Plus
} from "lucide-react";

interface DocumentVaultItem {
  id: number;
  docType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

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
  documentVault?: DocumentVaultItem[];
  appliedCoupon?: string;
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
  const [filterChannel, setFilterChannel] = useState<"all" | "instagram" | "whatsapp" | "website_chat" | "escalated">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isInternalNoteMode, setIsInternalNoteMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [showManageTeamModal, setShowManageTeamModal] = useState(false);

  // Advanced Filter & Sort States
  const [kpiFilter, setKpiFilter] = useState<"all" | "ai" | "pending" | "website">("all");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [filterHotOnly, setFilterHotOnly] = useState<boolean>(false);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "intent" | "unread">("newest");

  // Create Manual Lead Form State
  const [showCreateLeadModal, setShowCreateLeadModal] = useState<boolean>(false);
  const [newLeadName, setNewLeadName] = useState<string>("");
  const [newLeadPhone, setNewLeadPhone] = useState<string>("");
  const [newLeadChannel, setNewLeadChannel] = useState<"whatsapp" | "instagram" | "website_chat">("whatsapp");
  const [newLeadDestination, setNewLeadDestination] = useState<string>("Kashmir Blossom Sisterhood");
  const [newLeadMessage, setNewLeadMessage] = useState<string>("Inquired via telephone call / desk.");

  // Analytics Modal Active Tab
  const [analyticsTab, setAnalyticsTab] = useState<"metrics" | "leaderboard" | "destinations">("metrics");

  const [salesManagersList, setSalesManagersList] = useState<string[]>(["Sneha Kapur", "Rahul Sharma", "Priya Singh"]);

  const handleRemoveManager = (nameToRemove: string) => {
    if (confirm(`Remove "${nameToRemove}" from the Sales Manager roster?`)) {
      setSalesManagersList(prev => prev.filter(m => m !== nameToRemove));
    }
  };
  const [quoteDestination, setQuoteDestination] = useState("Ladakh Women Special");
  const [quoteSlug, setQuoteSlug] = useState("ladakh-women-special");
  const [quotePrice, setQuotePrice] = useState(32999);
  const [quoteTravelers, setQuoteTravelers] = useState(2);
  const [quoteDeposit, setQuoteDeposit] = useState(8000);

  // Broadcast form state
  const [broadcastTitle, setBroadcastTitle] = useState("Kashmir Women Autumn Expedition Launch 🏔️");
  const [broadcastSegment, setBroadcastSegment] = useState("all_qualified");
  const [broadcastMessage, setBroadcastMessage] = useState("Exciting news! Our Kashmir Autumn Batch is officially open for booking. Get 10% early bird discount by reserving today!");

  // Document Vault form state
  const [docTypeInput, setDocTypeInput] = useState("Passport / Govt ID Proof");
  const [tokenStatus, setTokenStatus] = useState<any>(null);
  const [isSseConnected, setIsSseConnected] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docVaultInputRef = useRef<HTMLInputElement>(null);

  // Play audio chime alert on incoming lead / message
  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio chime unsupported:", e);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchTokenStatus();

    // Subscribe to Server-Sent Events (SSE) stream for live push notifications
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/admin/crm/stream");

      eventSource.onopen = () => {
        setIsSseConnected(true);
      };

      eventSource.addEventListener("crm_event", (e: MessageEvent) => {
        playChimeSound();
        fetchConversations();
      });

      eventSource.onerror = () => {
        setIsSseConnected(false);
      };
    } catch (err) {
      console.warn("SSE Subscription error:", err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const fetchTokenStatus = async () => {
    try {
      const res = await fetch("/api/admin/crm/token-status");
      const data = await res.json();
      if (data.success) {
        setTokenStatus(data);
      }
    } catch (e) {
      console.error("Token status fetch error:", e);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/crm");
      const data = await res.json();
      if (data.conversations && data.conversations.length > 0) {
        setConversations(data.conversations);
        if (!selectedId) setSelectedId(data.conversations[0].id);

        // Extract unique existing assigned agents
        const existingAgents = Array.from(
          new Set(
            data.conversations
              .map((c: Conversation) => c.assignedAgent)
              .filter((a?: string) => a && a !== "Unassigned" && a !== "NaariAI Bot" && a !== "NaariAI Priority Sales")
          )
        ) as string[];

        if (existingAgents.length > 0) {
          setSalesManagersList(prev => Array.from(new Set([...prev, ...existingAgents])));
        }
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
    let finalName = agentName;

    if (agentName === "REMOVE_CUSTOM") {
      setShowManageTeamModal(true);
      return;
    }

    if (agentName === "ADD_CUSTOM") {
      const inputName = prompt("Enter new Sales Manager Name:");
      if (!inputName || !inputName.trim()) return;
      finalName = inputName.trim();
      if (!salesManagersList.includes(finalName)) {
        setSalesManagersList(prev => [...prev, finalName]);
      }
    }

    try {
      await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_agent",
          conversationId: selectedConv.id,
          agentName: finalName
        })
      });

      setConversations(prev =>
        prev.map(c => c.id === selectedConv.id ? { ...c, assignedAgent: finalName } : c)
      );
    } catch (err) {
      console.error("Failed to assign agent:", err);
    }
  };

  const handleCreateLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim()) return;

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_lead",
          customerName: newLeadName,
          phone: newLeadPhone,
          channel: newLeadChannel,
          destination: newLeadDestination,
          initialMessage: newLeadMessage
        })
      });
      const data = await res.json();
      if (data.success && data.conversation) {
        setConversations(prev => [data.conversation, ...prev]);
        setSelectedId(data.conversation.id);
        setShowCreateLeadModal(false);
        setNewLeadName("");
        setNewLeadPhone("");
        setNewLeadMessage("");
      }
    } catch (err) {
      alert("Failed to create manual lead.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConversation = async (convId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation thread?")) return;

    try {
      setActionLoading(true);
      await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_conversation",
          conversationId: convId
        })
      });

      setConversations(prev => prev.filter(c => c.id !== convId));
      if (selectedId === convId) {
        const remaining = conversations.filter(c => c.id !== convId);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      alert("Failed to delete conversation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMessage = async (msgId: number) => {
    if (!selectedConv || !confirm("Delete this message?")) return;
    try {
      await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_message",
          conversationId: selectedConv.id,
          messageId: msgId
        })
      });

      setConversations(prev =>
        prev.map(c => c.id === selectedConv.id ? {
          ...c,
          messages: c.messages.filter(m => m.id !== msgId)
        } : c)
      );
    } catch (err) {
      alert("Failed to delete message.");
    }
  };

  const handleExportTranscript = (conv: Conversation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const lines = [
      `==================================================`,
      `TRIPNAARI CRM TRANSCRIPT REPORT`,
      `Customer: ${conv.customerName} (${conv.externalUsername})`,
      `Channel: ${conv.channel.toUpperCase()} | Status: ${conv.status}`,
      `Assigned Agent: ${conv.assignedAgent || "Unassigned"}`,
      `Destination: ${conv.lead?.destination || "N/A"}`,
      `Date Generated: ${new Date().toLocaleString()}`,
      `==================================================\n`
    ];

    conv.messages.forEach(m => {
      lines.push(`[${new Date(m.createdAt).toLocaleTimeString()}] ${m.senderType.toUpperCase()}: ${m.content}`);
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Transcript_${conv.customerName.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSVReport = () => {
    const headers = ["ID", "Customer Name", "Channel", "Phone", "Status", "Mode", "Assigned Agent", "Destination", "Intent Score", "Last Message Time"];
    const rows = conversations.map(c => [
      c.id,
      `"${c.customerName}"`,
      c.channel,
      `"${c.lead?.phone || ''}"`,
      c.status,
      c.mode,
      `"${c.assignedAgent || 'Unassigned'}"`,
      `"${c.lead?.destination || ''}"`,
      c.lead?.intentScore || 50,
      `"${new Date(c.lastMessageAt).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TripNaari_CRM_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyPromoCoupon = async () => {
    if (!selectedConv) return;
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply_promo_coupon",
          conversationId: selectedConv.id,
          couponCode: "SOLO1000"
        })
      });
      const data = await res.json();
      if (data.success) {
        const offerText = data.message || `🎁 *EXCLUSIVE VOUCHER APPLIED!*\nUse promo code *SOLO1000* at checkout for ₹1,000 instant discount!`;
        setConversations(prev =>
          prev.map(c => c.id === selectedConv.id ? {
            ...c,
            appliedCoupon: "SOLO1000",
            lastMessageText: offerText,
            messages: [...c.messages, { id: Date.now(), senderType: "admin", content: offerText, createdAt: new Date().toISOString() }]
          } : c)
        );
      }
    } catch (err) {
      alert("Failed to apply promo coupon.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendPreTripBriefing = async () => {
    if (!selectedConv) return;
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_pretrip_briefing",
          conversationId: selectedConv.id
        })
      });
      const data = await res.json();
      if (data.success) {
        const briefingMsg = data.briefingMessage || "🎒 Pre-Trip Briefing & Packing Guide sent!";
        setConversations(prev =>
          prev.map(c => c.id === selectedConv.id ? {
            ...c,
            lastMessageText: briefingMsg,
            messages: [...c.messages, { id: Date.now(), senderType: "admin", content: briefingMsg, createdAt: new Date().toISOString() }]
          } : c)
        );
      }
    } catch (err) {
      alert("Failed to send pre-trip briefing.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendFeedbackSurvey = async () => {
    if (!selectedConv) return;
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_feedback_survey",
          conversationId: selectedConv.id
        })
      });
      const data = await res.json();
      if (data.success) {
        const surveyMsg = data.message || "🌸 How was your trip? We'd love your review: https://tripnaari.com/feedback";
        setConversations(prev =>
          prev.map(c => c.id === selectedConv.id ? {
            ...c,
            lastMessageText: surveyMsg,
            messages: [...c.messages, { id: Date.now(), senderType: "admin", content: surveyMsg, createdAt: new Date().toISOString() }]
          } : c)
        );
      }
    } catch (err) {
      alert("Failed to send feedback survey.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDocVaultUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConv) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      const fileUrl = data.url || data.secure_url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

      await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upload_travel_doc",
          conversationId: selectedConv.id,
          docType: docTypeInput,
          fileName: file.name,
          fileUrl
        })
      });

      setShowDocUploadModal(false);
      fetchConversations();
    } catch (err) {
      alert("Failed to upload document to vault.");
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

  const handleSendWhatsAppButtons = async () => {
    if (!selectedConv) return;
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_whatsapp_buttons",
          conversationId: selectedConv.id,
          bodyText: "How can our TripNaari travel team help you today?",
          buttons: [
            { id: "btn_itinerary", title: "View PDF Itinerary" },
            { id: "btn_human", title: "Talk to Trip Leader" },
            { id: "btn_deposit", title: "Pay ₹8,000 Deposit" }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchConversations();
      }
    } catch (err) {
      alert("Failed to send interactive WhatsApp buttons.");
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
    // Top KPI Quick Card Filters
    if (kpiFilter === "ai" && c.mode !== "ai") return false;
    if (kpiFilter === "pending" && !(c.status === "quote_sent" || c.status === "payment_pending")) return false;
    if (kpiFilter === "website" && c.channel !== "website_chat") return false;

    if (filterChannel === "website_chat" && c.channel !== "website_chat") return false;
    if (filterChannel === "instagram" && c.channel !== "instagram") return false;
    if (filterChannel === "whatsapp" && c.channel !== "whatsapp") return false;
    if (filterChannel === "escalated" && c.mode !== "human") return false;

    if (filterStage !== "all" && c.status !== filterStage) return false;
    if (filterHotOnly && !(c.lead?.intentScore && c.lead.intentScore >= 75)) return false;

    if (filterAgent !== "all") {
      if (filterAgent === "unassigned") {
        if (c.assignedAgent && c.assignedAgent !== "Unassigned" && c.assignedAgent !== "NaariAI Bot") return false;
      } else if (c.assignedAgent !== filterAgent) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.externalUsername.toLowerCase().includes(q) ||
        (c.lastMessageText && c.lastMessageText.toLowerCase().includes(q))
      );
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "intent") {
      return (b.lead?.intentScore || 50) - (a.lead?.intentScore || 50);
    }
    if (sortBy === "unread") {
      return b.unreadCount - a.unreadCount;
    }
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
      <input type="file" ref={docVaultInputRef} onChange={handleDocVaultUpload} className="hidden" />

      {/* 1. Header & Quick Analytics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#F1D9D0] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF4A7D] to-[#FF8A2B] text-white flex items-center justify-center font-bold text-xl shadow-md">
            🚀
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#13253D]">AI Omnichannel Sales CRM</h1>
              {isSseConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  LIVE SSE Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  ⚡ Polling Mode
                </span>
              )}

              {tokenStatus && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  tokenStatus.status === "healthy" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"
                }`}>
                  ⚙️ {tokenStatus.channels?.aiEngine?.primary || "AI Active"}
                </span>
              )}
            </div>
            <p className="text-xs text-[#3D4A5E] mt-0.5">Automated Lead Qualification, Instant Quotations & WhatsApp Sales Drip</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCreateLeadModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#FF4A7D] text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-600 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ New Lead</span>
          </button>

          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold shadow-xs hover:bg-blue-100 transition"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Sales Analytics 📊</span>
          </button>

          <button
            onClick={handleExportCSVReport}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-100 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>

          <button
            onClick={() => setShowBroadcastModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#13253D] text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition"
          >
            <Megaphone className="w-3.5 h-3.5 text-[#FF4A7D]" />
            <span>Launch Broadcast</span>
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
            <span>Sync Live Chats</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (Interactive Filters) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Inquiries */}
        <div
          onClick={() => setKpiFilter("all")}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
            kpiFilter === "all"
              ? "bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-md"
              : "bg-white border-[#F1D9D0] hover:border-blue-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition ${
              kpiFilter === "all" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
            }`}>
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-[#13253D]">{conversations.length}</div>
              <div className="text-[11px] font-medium text-gray-500">Active Inquiries</div>
            </div>
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-md">
            100% Vol
          </span>
        </div>

        {/* Card 2: AI Bot Handling */}
        <div
          onClick={() => setKpiFilter(prev => prev === "ai" ? "all" : "ai")}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
            kpiFilter === "ai"
              ? "bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-md"
              : "bg-white border-[#F1D9D0] hover:border-emerald-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition ${
              kpiFilter === "ai" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
            }`}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-[#13253D]">{conversations.filter(c => c.mode === "ai").length}</div>
              <div className="text-[11px] font-medium text-gray-500">AI Bot Handling</div>
            </div>
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
            {((conversations.filter(c => c.mode === "ai").length / (conversations.length || 1)) * 100).toFixed(0)}% Auto
          </span>
        </div>

        {/* Card 3: Quotes & Pending */}
        <div
          onClick={() => setKpiFilter(prev => prev === "pending" ? "all" : "pending")}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
            kpiFilter === "pending"
              ? "bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20 shadow-md"
              : "bg-white border-[#F1D9D0] hover:border-amber-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition ${
              kpiFilter === "pending" ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-600 group-hover:bg-amber-100"
            }`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-[#13253D]">{conversations.filter(c => c.status === "quote_sent" || c.status === "payment_pending").length}</div>
              <div className="text-[11px] font-medium text-gray-500">Quotes & Pending</div>
            </div>
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md">
            ₹{(conversations.filter(c => c.status === "quote_sent" || c.status === "payment_pending").length * 8000).toLocaleString("en-IN")}
          </span>
        </div>

        {/* Card 4: Website Chats */}
        <div
          onClick={() => setKpiFilter(prev => prev === "website" ? "all" : "website")}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
            kpiFilter === "website"
              ? "bg-rose-50/80 border-[#FF4A7D] ring-2 ring-[#FF4A7D]/20 shadow-md"
              : "bg-white border-[#F1D9D0] hover:border-rose-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition ${
              kpiFilter === "website" ? "bg-[#FF4A7D] text-white" : "bg-pink-50 text-[#FF4A7D] group-hover:bg-pink-100"
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-[#13253D]">{conversations.filter(c => c.channel === "website_chat").length}</div>
              <div className="text-[11px] font-medium text-gray-500">Website Chats</div>
            </div>
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-pink-100 text-[#FF4A7D] rounded-md">
            Live 🌸
          </span>
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

            {/* Channel Tabs */}
            <div className="flex gap-1 overflow-x-auto scrollbar-none pt-1">
              {[
                { id: "all", label: "All" },
                { id: "website_chat", label: "Website 🌸" },
                { id: "instagram", label: "Instagram 🟣" },
                { id: "whatsapp", label: "WhatsApp 🟢" },
                { id: "escalated", label: "Human 🚨" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterChannel(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                    filterChannel === tab.id
                      ? "bg-[#13253D] text-white shadow-xs"
                      : "bg-white text-gray-600 hover:bg-[#FFF0F4] border border-[#F1D9D0]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Secondary Advanced Filters & Sorting */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#F1D9D0]/60">
              <select
                value={filterStage}
                onChange={e => setFilterStage(e.target.value)}
                className="text-[10px] font-bold bg-white border border-[#F1D9D0] rounded-lg px-2 py-1 text-[#13253D] focus:outline-none"
              >
                <option value="all">Stage: All</option>
                <option value="active">Active</option>
                <option value="qualified">Qualified</option>
                <option value="quote_sent">Quote Sent</option>
                <option value="payment_pending">Payment Pending 💳</option>
                <option value="booked">Booked 🎉</option>
                <option value="closed">Closed ❌</option>
              </select>

              <button
                onClick={() => setFilterHotOnly(prev => !prev)}
                className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border transition flex items-center gap-1 ${
                  filterHotOnly
                    ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                    : "bg-white text-rose-600 border-[#F1D9D0] hover:bg-rose-50"
                }`}
              >
                <Flame className="w-3 h-3" /> Hot Only
              </button>

              <select
                value={filterAgent}
                onChange={e => setFilterAgent(e.target.value)}
                className="text-[10px] font-bold bg-white border border-[#F1D9D0] rounded-lg px-2 py-1 text-[#13253D] focus:outline-none"
              >
                <option value="all">Agent: All</option>
                <option value="unassigned">Unassigned</option>
                {salesManagersList.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="text-[10px] font-bold bg-white border border-[#F1D9D0] rounded-lg px-2 py-1 text-[#13253D] focus:outline-none ml-auto"
              >
                <option value="newest">Sort: Newest</option>
                <option value="intent">Sort: High Intent</option>
                <option value="unread">Sort: Unread</option>
              </select>
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
                const isHotLead = (conv.lead?.intentScore && conv.lead.intentScore >= 75) || conv.status === "qualified";

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
                        className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black ${
                          conv.channel === "instagram"
                            ? "bg-purple-600 text-white"
                            : conv.channel === "website_chat"
                            ? "bg-[#FF4A7D] text-white"
                            : "bg-emerald-500 text-white"
                        }`}
                      >
                        {conv.channel === "instagram" ? "IG" : conv.channel === "website_chat" ? "WEB" : "WA"}
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
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => handleExportTranscript(conv, e)}
                            title="Export Transcript"
                            className="p-1 hover:bg-gray-100 text-gray-400 hover:text-blue-600 rounded transition"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                            title="Delete Conversation"
                            className="p-1 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] text-gray-400">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
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

                    <div className="relative group max-w-[85%]">
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-wrap ${
                          isUser
                            ? "bg-white text-[#13253D] border border-gray-200 rounded-tl-none"
                            : isAi
                            ? "bg-[#13253D] text-white rounded-tr-none"
                            : "bg-[#FF4A7D] text-white rounded-tr-none"
                        }`}
                      >
                        {msg.content.match(/\.(mp3|ogg|wav|m4a)/i) ? (
                          <div className="space-y-1.5">
                            <p className="text-xs font-semibold">🎙️ Voice Note / Audio Message:</p>
                            <audio controls className="max-w-full h-8 rounded-lg">
                              <source src={msg.content.match(/https?:\/\/[^\s]+/)?.[0] || ""} />
                              Your browser does not support audio elements.
                            </audio>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="absolute -top-2 -right-2 p-1 bg-white border border-rose-200 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition shadow-xs hover:bg-rose-50"
                        title="Delete Message"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <span className="text-[9px] text-gray-400 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Action Chips Bar */}
            <div className="p-2 border-t border-[#F1D9D0] bg-white flex gap-1.5 overflow-x-auto scrollbar-none">
              {selectedConv?.channel === "whatsapp" && (
                <button
                  onClick={handleSendWhatsAppButtons}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-extrabold whitespace-nowrap hover:bg-emerald-700 transition flex items-center gap-1 shadow-2xs"
                >
                  <Zap className="w-3 h-3" /> Quick WhatsApp Buttons
                </button>
              )}

              <button
                onClick={() => setShowQuoteModal(true)}
                className="px-2.5 py-1 bg-amber-500 text-white rounded-full text-[10px] font-extrabold whitespace-nowrap hover:bg-amber-600 transition flex items-center gap-1 shadow-2xs"
              >
                <DollarSign className="w-3 h-3" /> Send Visual Quote
              </button>

              <button
                onClick={handleApplyPromoCoupon}
                className="px-2.5 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full text-[10px] font-extrabold whitespace-nowrap hover:brightness-110 transition flex items-center gap-1 shadow-2xs"
              >
                <Gift className="w-3 h-3" /> Apply ₹1,000 Voucher
              </button>

              <button
                onClick={async () => {
                  if (!selectedConv) return;
                  const lockAuditText = `🛡️ *TRIPNAARI ROOM LOCK & SAFETY AUDIT GUARANTEE:*
All hotels, houseboats, and homestays undergo physical room lock & CCTV security audits prior to group check-in. Our certified female trip leader stays on-site 24/7.`;
                  setConversations(prev =>
                    prev.map(c => c.id === selectedConv.id ? {
                      ...c,
                      lastMessageText: lockAuditText,
                      messages: [...c.messages, { id: Date.now(), senderType: "admin", content: lockAuditText, createdAt: new Date().toISOString() }]
                    } : c)
                  );
                }}
                className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-full text-[10px] font-bold whitespace-nowrap hover:bg-emerald-600 hover:text-white transition flex items-center gap-1"
              >
                <ShieldCheck className="w-3 h-3" /> Send Lock Audit Policy
              </button>

              <button
                onClick={handleSendPreTripBriefing}
                className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-[10px] font-bold whitespace-nowrap hover:bg-blue-600 hover:text-white transition flex items-center gap-1"
              >
                <Luggage className="w-3 h-3" /> Pre-Trip Briefing
              </button>

              <button
                onClick={handleSendFeedbackSurvey}
                className="px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-[10px] font-bold whitespace-nowrap hover:bg-purple-600 hover:text-white transition flex items-center gap-1"
              >
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> Review Survey
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

        {/* RIGHT COLUMN: Sales Intelligence & Document Vault (3 cols) */}
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
                  className="w-full text-xs bg-white border border-[#F1D9D0] rounded-lg p-1.5 font-bold text-[#13253D] focus:outline-none cursor-pointer"
                >
                  <option value="Unassigned">Unassigned (AI Queue)</option>
                  <option value="NaariAI Priority Sales">NaariAI Priority Sales</option>
                  {salesManagersList.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                  <option value="ADD_CUSTOM">✍️ + Add New Sales Manager...</option>
                  <option value="REMOVE_CUSTOM">⚙️ Manage / Remove Sales Team Roster...</option>
                </select>
              </div>

              {/* Traveler Passport & Document Vault */}
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Traveler Document Vault
                  </span>
                  <button
                    onClick={() => setShowDocUploadModal(true)}
                    className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-300 hover:bg-blue-100"
                  >
                    + Add Doc
                  </button>
                </div>

                {selectedConv.documentVault && selectedConv.documentVault.length > 0 ? (
                  <div className="space-y-1">
                    {selectedConv.documentVault.map(doc => (
                      <a
                        key={doc.id}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-white rounded-lg border border-blue-200 flex items-center justify-between text-xs text-blue-900 hover:bg-blue-100 transition"
                      >
                        <span className="truncate flex items-center gap-1 text-[11px] font-semibold">
                          <FileText className="w-3 h-3 text-blue-600" /> {doc.fileName}
                        </span>
                        <span className="text-[9px] text-gray-400">PDF</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-blue-700 italic">No passport/ID proofs uploaded yet</div>
                )}
              </div>

              {/* Extracted Details List */}
              <div className="space-y-2">
                <div className="p-2 rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#FF4A7D]" /> Destination:
                  </span>
                  <span className="text-xs font-bold text-[#13253D]">
                    {selectedConv.lead?.destination || "Unspecified"}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-500" /> Month:
                  </span>
                  <span className="text-xs font-bold text-[#13253D]">
                    {selectedConv.lead?.travelMonth || "Not mentioned"}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-500" /> Phone:
                  </span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">
                    {selectedConv.lead?.phone || "Pending"}
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

      {/* 4. Sales Analytics & Funnel Metrics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl space-y-4 shadow-2xl border border-[#F1D9D0] animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#F1D9D0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#13253D] flex items-center gap-2">
                  📊 Live Sales Performance & Intelligence Report
                </h3>
                <p className="text-[11px] text-gray-500">Real-time breakdown of conversion rates, pipeline value & team performance</p>
              </div>
              <button onClick={() => setShowAnalyticsModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-[#F1D9D0] pb-2">
              <button
                onClick={() => setAnalyticsTab("metrics")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  analyticsTab === "metrics" ? "bg-[#13253D] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                📈 Funnel & Revenue
              </button>
              <button
                onClick={() => setAnalyticsTab("leaderboard")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  analyticsTab === "leaderboard" ? "bg-[#13253D] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                👩‍💼 Manager Leaderboard
              </button>
              <button
                onClick={() => setAnalyticsTab("destinations")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  analyticsTab === "destinations" ? "bg-[#13253D] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                📍 Destination Demand
              </button>
            </div>

            {analyticsTab === "metrics" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <div className="text-[11px] text-blue-700 font-bold">Qualifying Conversion</div>
                    <div className="text-xl font-black text-blue-900 mt-1">
                      {((conversations.filter(c => c.status === "qualified" || c.status === "quote_sent" || c.status === "payment_pending" || c.status === "booked").length / (conversations.length || 1)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-[9px] text-blue-600">Inquiry to Qualified</div>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <div className="text-[11px] text-emerald-700 font-bold">Pipeline Value</div>
                    <div className="text-xl font-black text-emerald-900 mt-1">
                      ₹{(conversations.filter(c => c.status === "booked" || c.status === "payment_pending" || c.status === "quote_sent").length * 28000 + 32000).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[9px] text-emerald-600">Est. Active Bookings</div>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                    <div className="text-[11px] text-rose-700 font-bold">🔥 Hot Leads Ratio</div>
                    <div className="text-xl font-black text-rose-900 mt-1">
                      {((conversations.filter(c => (c.lead?.intentScore && c.lead.intentScore >= 75) || c.status === "qualified").length / (conversations.length || 1)) * 100).toFixed(0)}%
                    </div>
                    <div className="text-[9px] text-rose-600">High Intent Score</div>
                  </div>
                </div>

                <div className="p-3 bg-[#FFF8F0] border border-[#F1D9D0] rounded-xl space-y-2">
                  <div className="text-xs font-bold text-[#13253D]">Channel Lead Distribution & Conversion:</div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-emerald-800 text-[11px] mb-1">
                        <span>🟢 WhatsApp Business</span>
                        <span>{conversations.filter(c => c.channel === "whatsapp").length} Leads ({((conversations.filter(c => c.channel === "whatsapp").length / (conversations.length || 1)) * 100).toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${((conversations.filter(c => c.channel === "whatsapp").length / (conversations.length || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-pink-800 text-[11px] mb-1">
                        <span>🌸 Website NaariAI Chat</span>
                        <span>{conversations.filter(c => c.channel === "website_chat").length} Leads ({((conversations.filter(c => c.channel === "website_chat").length / (conversations.length || 1)) * 100).toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#FF4A7D] h-full rounded-full" style={{ width: `${((conversations.filter(c => c.channel === "website_chat").length / (conversations.length || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-purple-800 text-[11px] mb-1">
                        <span>🟣 Instagram Direct</span>
                        <span>{conversations.filter(c => c.channel === "instagram").length} Leads ({((conversations.filter(c => c.channel === "instagram").length / (conversations.length || 1)) * 100).toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full" style={{ width: `${((conversations.filter(c => c.channel === "instagram").length / (conversations.length || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analyticsTab === "leaderboard" && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Assigned Sales Team Performance:</div>
                <div className="divide-y divide-[#F1D9D0] border border-[#F1D9D0] rounded-xl overflow-hidden text-xs">
                  {salesManagersList.map(mgr => {
                    const assignedCount = conversations.filter(c => c.assignedAgent === mgr).length;
                    const pendingCount = conversations.filter(c => c.assignedAgent === mgr && (c.status === "payment_pending" || c.status === "quote_sent")).length;
                    return (
                      <div key={mgr} className="p-3 bg-white flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#13253D]">👩‍💼 {mgr}</div>
                          <div className="text-[10px] text-gray-400">{assignedCount} Assigned Conversations</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg text-[10px]">
                            💳 {pendingCount} Quotes/Pending
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="p-3 bg-[#FFF8F0] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-800">🤖 NaariAI Auto-Pilot Queue</div>
                      <div className="text-[10px] text-gray-500">{conversations.filter(c => !c.assignedAgent || c.assignedAgent === "Unassigned" || c.assignedAgent === "NaariAI Bot").length} Active Automated Inquiries</div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px]">
                      ⚡ Automated
                    </span>
                  </div>
                </div>
              </div>
            )}

            {analyticsTab === "destinations" && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Most Inquired Travel Destinations:</div>
                <div className="space-y-2 text-xs">
                  {["Kashmir", "Ladakh", "Meghalaya", "Spiti", "Kerala", "Goa"].map(dest => {
                    const count = conversations.filter(c => 
                      (c.lead?.destination || "").toLowerCase().includes(dest.toLowerCase()) ||
                      c.lastMessageText.toLowerCase().includes(dest.toLowerCase())
                    ).length;
                    const pct = Math.min(100, Math.max(10, count * 25));
                    return (
                      <div key={dest} className="p-2.5 bg-[#FFF8F0] border border-[#F1D9D0] rounded-xl space-y-1">
                        <div className="flex justify-between font-bold text-[#13253D] text-xs">
                          <span>📍 {dest} Expedition</span>
                          <span className="text-[#FF4A7D]">{count} Inquiries</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-amber-500 to-[#FF4A7D] h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2 flex gap-2 border-t border-[#F1D9D0]">
              <button
                type="button"
                onClick={handleExportCSVReport}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export Full CSV Report
              </button>
              <button
                type="button"
                onClick={() => setShowAnalyticsModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Create Manual Lead Modal */}
      {showCreateLeadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-[#F1D9D0] animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#F1D9D0] pb-3">
              <h3 className="text-sm font-bold text-[#13253D] flex items-center gap-2">
                ➕ Add New Customer Lead / Inquiry
              </h3>
              <button onClick={() => setShowCreateLeadModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLeadSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Customer Full Name:</label>
                <input
                  type="text"
                  required
                  value={newLeadName}
                  onChange={e => setNewLeadName(e.target.value)}
                  placeholder="e.g. Sneha Patel"
                  className="w-full text-xs p-2 border border-[#F1D9D0] rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">Phone Number / ID:</label>
                  <input
                    type="text"
                    value={newLeadPhone}
                    onChange={e => setNewLeadPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs p-2 border border-[#F1D9D0] rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">Channel Source:</label>
                  <select
                    value={newLeadChannel}
                    onChange={e => setNewLeadChannel(e.target.value as any)}
                    className="w-full text-xs p-2 border border-[#F1D9D0] rounded-xl font-semibold"
                  >
                    <option value="whatsapp">WhatsApp 🟢</option>
                    <option value="instagram">Instagram 🟣</option>
                    <option value="website_chat">Website Chat 🌸</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Inquired Destination:</label>
                <select
                  value={newLeadDestination}
                  onChange={e => setNewLeadDestination(e.target.value)}
                  className="w-full text-xs p-2 border border-[#F1D9D0] rounded-xl font-semibold"
                >
                  <option value="Kashmir Blossom Sisterhood">Kashmir Blossom Sisterhood</option>
                  <option value="Ladakh Women Special">Ladakh Women Special</option>
                  <option value="Meghalaya Backpacking">Meghalaya Backpacking</option>
                  <option value="Spiti Valley Circuit">Spiti Valley Circuit</option>
                  <option value="Kerala Backwater Retreat">Kerala Backwater Retreat</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Initial Inquiry / Call Notes:</label>
                <textarea
                  rows={3}
                  value={newLeadMessage}
                  onChange={e => setNewLeadMessage(e.target.value)}
                  className="w-full text-xs p-2 border border-[#F1D9D0] rounded-xl font-medium focus:ring-2 focus:ring-[#FF4A7D]"
                  placeholder="Details from call or Desk inquiry..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateLeadModal(false)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-[#FF4A7D] hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Save Lead to CRM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Document Upload to Vault Modal */}
      {showDocUploadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl border border-[#F1D9D0] animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#F1D9D0] pb-3">
              <h3 className="text-sm font-bold text-[#13253D] flex items-center gap-2">
                📁 Upload Traveler ID / Passport
              </h3>
              <button onClick={() => setShowDocUploadModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Document Category:</label>
                <select
                  value={docTypeInput}
                  onChange={e => setDocTypeInput(e.target.value)}
                  className="w-full text-xs p-2 border border-[#F1D9D0] rounded-xl font-semibold"
                >
                  <option value="Passport / Govt ID Proof">Passport / Govt ID Proof</option>
                  <option value="Visa Approval Copy">Visa Approval Copy</option>
                  <option value="Medical Declaration Form">Medical Declaration Form</option>
                  <option value="Flight Ticket / Voucher">Flight Ticket / Voucher</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => docVaultInputRef.current?.click()}
                className="w-full py-3 bg-[#FFF8F0] border-2 border-dashed border-[#FF4A7D] text-[#FF4A7D] rounded-xl text-xs font-bold hover:bg-[#FFF0F4] transition flex items-center justify-center gap-2"
              >
                <FileCheck className="w-4 h-4" /> Select PDF / Image File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. WhatsApp Bulk Broadcast Campaign Modal */}
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
                  <option value="all_qualified">All Qualified Leads (Qualified + Quote Sent)</option>
                  <option value="all_booked">All Booked Travelers (Pre-Trip Briefing)</option>
                  <option value="hot_leads_only">Hot Leads Only (Intent ≥ 75%)</option>
                  <option value="closed_leads">Closed / Lost Leads (Win-Back Campaign)</option>
                  <option value="all_leads">All WhatsApp Contacts (Maximum Reach)</option>
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

      {/* 5. Manage Sales Team Roster Modal */}
      {showManageTeamModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-[#F1D9D0] animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#F1D9D0] pb-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#13253D] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#FF4A7D]" /> Manage Sales Team Roster
              </h3>
              <button onClick={() => setShowManageTeamModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {salesManagersList.length === 0 ? (
                <div className="text-xs text-gray-400 italic text-center py-4">No custom sales managers added</div>
              ) : (
                salesManagersList.map(name => (
                  <div key={name} className="flex items-center justify-between p-2.5 bg-[#FFF8F0] border border-[#F1D9D0] rounded-xl text-xs font-bold text-[#13253D]">
                    <span>👤 {name}</span>
                    <button
                      onClick={() => handleRemoveManager(name)}
                      className="text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 p-1.5 rounded-lg text-[10px] font-extrabold transition flex items-center gap-1 border border-rose-200"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[#F1D9D0]">
              <button
                onClick={() => {
                  const inputName = prompt("Enter new Sales Manager Name:");
                  if (inputName && inputName.trim()) {
                    const trimmed = inputName.trim();
                    if (!salesManagersList.includes(trimmed)) {
                      setSalesManagersList(prev => [...prev, trimmed]);
                    }
                  }
                }}
                className="w-full py-2.5 bg-[#13253D] hover:bg-[#FF4A7D] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add New Sales Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
