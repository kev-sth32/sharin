"use client";

import { useState } from "react";
import { Bell, ShieldAlert, Check, RefreshCw, Send, AlertTriangle, Eye, ArrowRight, History, Smartphone, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Campaign {
  id: number;
  title: string;
  message: string;
  url: string;
  image?: string | null;
  isTest: boolean;
  sentCount: number;
  failedCount: number;
  prunedCount: number;
  createdAt: string;
}

interface NotificationPanelProps {
  subscribersCount: number;
  campaignsHistory: Campaign[];
}

export default function NotificationPanel({
  subscribersCount: initialSubscribersCount,
  campaignsHistory: initialCampaigns,
}: NotificationPanelProps) {
  const [subscribersCount, setSubscribersCount] = useState(initialSubscribersCount);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isTestPending, setIsTestPending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("exciting");
  const [aiIdeas, setAiIdeas] = useState<any[]>([]);
  const [isAiPending, setIsAiPending] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const handleGenerateAiCopy = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiPending(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/notifications/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, tone: aiTone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate ideas");
      }
      setAiIdeas(data.ideas || []);
      setIsDemoMode(!!data.isDemo);
    } catch (e: any) {
      setErrorMsg("AI Assistant: " + e.message);
    } finally {
      setIsAiPending(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/notifications/stats");
      if (res.ok) {
        const data = await res.json();
        setSubscribersCount(data.subscribersCount);
        setCampaigns(data.history);
      }
    } catch (e) {
      console.error("Failed to refresh stats", e);
    }
  };

  const handleSend = async (isTest: boolean) => {
    if (!title.trim() || !message.trim()) {
      setErrorMsg("Title and Message body are required.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    
    if (isTest) {
      setIsTestPending(true);
    } else {
      setIsPending(true);
      setShowConfirm(false);
    }

    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          url: url || "/",
          image: image || undefined,
          isTest,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to dispatch notifications");
      }

      setSuccessMsg(
        isTest 
          ? "Test push sent to the most recent subscriber device successfully!" 
          : `Campaign broadcasted! ${data.sentCount} sent successfully. Pruned ${data.prunedCount} dead devices.`
      );
      
      if (!isTest) {
        // Clear form
        setTitle("");
        setMessage("");
        setUrl("");
        setImage("");
      }

      // Refresh statistics and history log
      await fetchStats();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while sending alerts.");
    } finally {
      setIsPending(false);
      setIsTestPending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F1D9D0] pb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-[#800F2D] tracking-tight">
            Push Alerts Control Center
          </h1>
          <p className="text-[13px] text-[#3D4A5E] mt-1">
            Compose, test, and broadcast push alerts to engage PWA application users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="cream" 
            size="sm"
            onClick={fetchStats}
            className="flex items-center gap-2 text-xs border border-[#F1D9D0]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Stats
          </Button>
        </div>
      </div>

      {/* Grid: Stats and Action Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Form and Preview */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* NaariAI Notification Co-pilot */}
          <div className="bg-gradient-to-br from-[#FFF0F4] to-white border border-[#F1D9D0] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="font-display font-bold text-base text-[#13253D] flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[#800F2D] text-white flex items-center justify-center animate-pulse shrink-0">
                  <Sparkles className="w-4 h-4" />
                </span>
                NaariAI Push Co-pilot
              </h2>
              {aiIdeas.length > 0 && (
                isDemoMode ? (
                  <span className="text-[10px] bg-[#FFF8F0] border border-[#F1D9D0] text-[#FF8A2B] font-bold px-2.5 py-1 rounded-full uppercase shrink-0">
                    💡 Template Mode
                  </span>
                ) : (
                  <span className="text-[10px] bg-[#EEFDF4] border border-[#D1F7E1] text-[#117B43] font-bold px-2.5 py-1 rounded-full uppercase shrink-0">
                    ✨ Live AI Active
                  </span>
                )
              )}
            </div>

            <p className="text-xs text-[#3D4A5E] leading-relaxed mb-4">
              Describe what kind of alert you want to create (e.g., "early bird discount for Ladakh"). The AI will generate 3 options of high-conversion notification copy matched to active trip URLs.
            </p>

            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
              <div className="flex-1">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#13253D]/65 mb-1.5">
                  Describe what to broadcast
                </label>
                <input
                  type="text"
                  placeholder="e.g. Last call for Spiti Valley trip starting next month..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateAiCopy()}
                  className="w-full h-11 px-4 text-sm bg-white border border-[#F1D9D0] rounded-2xl focus:outline-none focus:border-[#FF4A7D] transition"
                />
              </div>

              <div className="w-full md:w-44">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#13253D]/65 mb-1.5">
                  Tone of Alert
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full h-11 px-4 text-sm bg-white border border-[#F1D9D0] rounded-2xl focus:outline-none focus:border-[#FF4A7D] transition cursor-pointer"
                >
                  <option value="exciting">Exciting 🎉</option>
                  <option value="promotional">Promotional ⚡</option>
                  <option value="safety">Safety-focused 🛡️</option>
                  <option value="urgent">Urgent/Scarcity ⏰</option>
                  <option value="wanderlust">Inspiring 🎒</option>
                </select>
              </div>

              <Button
                onClick={handleGenerateAiCopy}
                isLoading={isAiPending}
                disabled={!aiPrompt.trim()}
                variant="secondary"
                size="md"
                className="h-11 px-5 text-xs font-bold shrink-0 justify-center shadow-none"
              >
                <Wand2 className="w-4 h-4 mr-1.5" /> Generate Copy
              </Button>
            </div>

            {/* Generated Copy Ideas */}
            {aiIdeas.length > 0 && (
              <div className="mt-6 space-y-4 border-t border-[#F1D9D0]/70 pt-5">
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#13253D]/60 flex items-center gap-1.5 mb-3">
                  Select a draft to apply to composer:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiIdeas.map((idea, index) => (
                    <div 
                      key={index}
                      className="group bg-white border border-[#F1D9D0] hover:border-[#FF4A7D]/40 hover:shadow-md rounded-2xl p-4 flex flex-col justify-between transition-all duration-200"
                    >
                      <div className="space-y-2">
                        <div className="font-bold text-xs text-[#800F2D] leading-snug">
                          {idea.title}
                        </div>
                        <p className="text-[11px] text-[#3D4A5E] leading-relaxed line-clamp-4">
                          {idea.message}
                        </p>
                        <div className="font-mono text-[9px] text-[#FF4A7D] truncate">
                          {idea.url}
                        </div>
                      </div>
                      <Button
                        variant="cream"
                        size="sm"
                        onClick={() => {
                          setTitle(idea.title);
                          setMessage(idea.message);
                          setUrl(idea.url);
                          // Scroll to composer form
                          const elem = document.getElementById("campaign-composer");
                          if (elem) {
                            elem.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                        className="w-full text-[10px] h-8 mt-4 font-bold border border-[#F1D9D0]/70 group-hover:bg-[#FF4A7D] group-hover:text-white group-hover:border-transparent transition-all"
                      >
                        Apply Draft
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notification Form */}
          <div id="campaign-composer" className="bg-white border border-[#F1D9D0] rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="font-display font-bold text-lg text-[#13253D] mb-5 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#FFF0F4] text-[#FF4A7D] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </span>
              Compose New Alert Campaign
            </h2>

            {successMsg && (
              <div className="mb-6 p-4 bg-[#EEFDF4] border border-[#D1F7E1] text-[#117B43] rounded-2xl flex items-start gap-2.5 text-xs font-semibold">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{successMsg}</div>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 bg-[#FDF2F2] border border-[#FCD9D9] text-[#9B1C1C] rounded-2xl flex items-start gap-2.5 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{errorMsg}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#13253D]/65 mb-1.5">
                  Notification Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🎒 Kashmir Autumn Departures Dropped!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={60}
                  className="w-full h-11 px-4 text-sm bg-[#FFF8F0] border border-[#F1D9D0] rounded-2xl focus:outline-none focus:border-[#FF4A7D] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#13253D]/65 mb-1.5">
                  Message Body *
                </label>
                <textarea
                  placeholder="e.g. Handcrafted women-only group departure. Guided tours, verified stays, and 24/7 leader support. Use code DIWALI to book."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={180}
                  rows={3}
                  className="w-full p-4 text-sm bg-[#FFF8F0] border border-[#F1D9D0] rounded-2xl focus:outline-none focus:border-[#FF4A7D] transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[#13253D]/65 mb-1.5">
                    Redirect URL Path (Relative or Absolute)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /trips/kashmir-autumn (default: /)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-[#FFF8F0] border border-[#F1D9D0] rounded-2xl focus:outline-none focus:border-[#FF4A7D] transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[#13253D]/65 mb-1.5">
                    Notification Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /uploads/kashmir.jpg"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full h-11 px-4 text-sm bg-[#FFF8F0] border border-[#F1D9D0] rounded-2xl focus:outline-none focus:border-[#FF4A7D] transition"
                  />
                </div>
              </div>
            </div>

            {/* Confirmation Area */}
            {showConfirm ? (
              <div className="mt-6 p-4 border border-[#FFD8A8] bg-[#FFF9DB] rounded-2xl space-y-3.5">
                <div className="flex gap-2 text-xs font-semibold text-[#D9480F]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    Are you sure you want to broadcast this alert to all {subscribersCount} registered user devices? This cannot be undone and will pop up instantly on their mobile/desktop.
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    isLoading={isPending}
                    onClick={() => handleSend(false)}
                    className="bg-[#D9480F] hover:bg-[#C23E0A] shadow-none"
                  >
                    Yes, Broadcast Now
                  </Button>
                  <Button 
                    variant="cream" 
                    size="sm" 
                    onClick={() => setShowConfirm(false)}
                    className="border border-[#F1D9D0]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap gap-3 border-t border-[#F1D9D0] pt-5">
                <Button
                  onClick={() => setShowConfirm(true)}
                  isLoading={isPending}
                  disabled={isTestPending || !title.trim() || !message.trim() || subscribersCount === 0}
                  variant="primary"
                  size="md"
                  className="font-bold gap-2 text-xs px-5 shadow-none"
                >
                  <Send className="w-4 h-4" /> Broadcast to All ({subscribersCount})
                </Button>

                <Button
                  onClick={() => handleSend(true)}
                  isLoading={isTestPending}
                  disabled={isPending || !title.trim() || !message.trim() || subscribersCount === 0}
                  variant="cream"
                  size="md"
                  className="font-bold border border-[#F1D9D0] text-[#800F2D] hover:bg-white text-xs px-5"
                >
                  <Eye className="w-4 h-4 mr-1 text-[#FF4A7D]" /> Send Test Push
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Stats & Real-time Live Preview */}
        <div className="space-y-6">
          
          {/* Active Subscribers Card */}
          <div className="bg-gradient-to-br from-[#800F2D] to-[#5B2063] text-white border border-transparent rounded-3xl p-6 shadow-md relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-x-4 translate-y-4" />
            
            <h3 className="text-white/80 font-bold uppercase tracking-wider text-[11px] mb-2.5">
              Active Push Audience
            </h3>
            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl font-extrabold tracking-tight">{subscribersCount}</span>
              <span className="text-xs text-white/70">Subscribed Devices</span>
            </div>
            <div className="h-px bg-white/10 my-4" />
            <p className="text-[11px] leading-relaxed text-white/70">
              Users who have opted-in to notifications via the PWA floating assistant. High-engagement channel.
            </p>
          </div>

          {/* Interactive PWA Notification Preview */}
          <div className="bg-white border border-[#F1D9D0] rounded-3xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-xs text-[#13253D] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#800F2D]" /> Live Device Preview
            </h3>
            
            {/* Device Bubble Mock */}
            <div className="bg-slate-100 border border-slate-200/80 rounded-2xl p-3.5 shadow-inner">
              <div className="flex gap-2.5 items-start bg-white border border-slate-200 rounded-xl p-3 shadow-md max-w-full">
                {/* Icon */}
                <div className="w-8 h-8 rounded-lg bg-[#FF4A7D]/10 border border-[#FF4A7D]/10 flex items-center justify-center shrink-0">
                  <div className="w-5 h-5 rounded-md bg-[#FF4A7D] text-white text-[9px] font-black grid place-items-center">TN</div>
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[9px] font-bold text-slate-700 tracking-wide uppercase leading-none">TripNaari</span>
                    <span className="text-[8px] text-slate-400">now</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">
                    {title || "🎒 Kashmir Autumn Departures Dropped!"}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-normal break-words">
                    {message || "We just dropped our autumn Kashmir departures. Only 12 slots left per batch. Book with coupon SISTERHOOD."}
                  </p>
                  
                  {/* Image attachment preview if provided */}
                  {image && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 max-h-[100px] relative bg-slate-50 flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="Notification attachment" className="object-cover w-full h-[100px]" onError={(e) => (e.currentTarget.style.display = "none")} />
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-[8px] text-[#FF4A7D] font-bold mt-2">
                    <span>{url || "/"}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 text-center mt-3">
              Standard native system notification preview. Looks may vary on operating systems (macOS, iOS, Windows, Android).
            </p>
          </div>

        </div>

      </div>

      {/* Campaigns History Logs */}
      <div className="bg-white border border-[#F1D9D0] rounded-3xl p-6 shadow-sm">
        <h2 className="font-display font-bold text-lg text-[#13253D] mb-5 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-[#FFF8F0] text-[#800F2D] flex items-center justify-center">
            <History className="w-4 h-4" />
          </span>
          Campaign Dispatch History Log
        </h2>

        {campaigns.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-[#F1D9D0] rounded-2xl">
            <Bell className="w-8 h-8 text-[#13253D]/20 mx-auto mb-2" />
            <p className="text-xs text-[#13253D]/50 font-medium">No campaign history recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-[#F1D9D0] text-[10px] uppercase tracking-wider text-[#13253D]/60 font-bold">
                  <th className="pb-3.5 font-bold">Campaign Details</th>
                  <th className="pb-3.5 font-bold">Destination URL</th>
                  <th className="pb-3.5 font-bold">Audience Status</th>
                  <th className="pb-3.5 font-bold">Dispatch Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1D9D0]/50 text-xs">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-[#FFF8F0]/30 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-[#13253D] flex items-center gap-1.5">
                        {camp.isTest && <span className="bg-[#FFF0F4] text-[#FF4A7D] border border-[#FF4A7D]/20 text-[9px] px-1.5 py-0.5 rounded font-black uppercase shrink-0">Test</span>}
                        {camp.title}
                      </div>
                      <div className="text-[#3D4A5E]/85 text-[11px] mt-1 max-w-[420px] line-clamp-2">{camp.message}</div>
                    </td>
                    <td className="py-4 text-[#800F2D] font-mono text-[11px]">{camp.url}</td>
                    <td className="py-4 pr-4">
                      <div className="flex gap-3">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Sent</div>
                          <div className="font-bold text-[#117B43] mt-0.5">{camp.sentCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Failed</div>
                          <div className="font-bold text-[#9B1C1C] mt-0.5">{camp.failedCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Pruned</div>
                          <div className="font-bold text-slate-500 mt-0.5">{camp.prunedCount}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(camp.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
