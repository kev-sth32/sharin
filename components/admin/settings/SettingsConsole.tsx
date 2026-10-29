"use client";

import { useState } from "react";
import { 
  User, 
  UserCheck, 
  FileText, 
  MessageSquare, 
  Share2, 
  MousePointer, 
  Target, 
  Plug, 
  Tag, 
  Users, 
  Clock, 
  BarChart3, 
  BarChart2, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Save,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { CreatorSettings, TravelerQuestion } from "@/lib/creator-settings";

interface SettingsConsoleProps {
  initialSettings: CreatorSettings;
}

type TabKey = 
  | "traveler_details"
  | "profile"
  | "pdf_branding"
  | "channels_ai"
  | "lead_ads"
  | "click_to_message"
  | "marketing"
  | "integrations"
  | "coupons"
  | "team_seats"
  | "pending_payments"
  | "insights";

export default function SettingsConsole({ initialSettings }: SettingsConsoleProps) {
  const [settings, setSettings] = useState<CreatorSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<TabKey>("traveler_details");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Traveler Details Form States
  const [customQuestionInput, setCustomQuestionInput] = useState("");
  const [customQuestionType, setCustomQuestionType] = useState<TravelerQuestion["type"]>("short_text");
  const [customQuestionRequired, setCustomQuestionRequired] = useState(false);
  const [isApplyingTrips, setIsApplyingTrips] = useState(false);

  // Preset definitions matching the screenshot
  const presetPills = [
    { id: "email", label: "Email", prefix: "@" },
    { id: "phone", label: "Phone", prefix: "#" },
    { id: "age", label: "Age", prefix: "A" },
    { id: "gender", label: "Gender", prefix: "G" },
    { id: "city", label: "City", prefix: "C" },
    { id: "room_pref", label: "Room preference", prefix: "R" },
    { id: "emergency_contact", label: "Emergency contact", prefix: "!" },
  ];

  const handleTogglePreset = (presetId: string) => {
    setSettings(prev => {
      const exists = prev.travelerDetails.enabledPresetIds.includes(presetId);
      const updated = exists
        ? prev.travelerDetails.enabledPresetIds.filter(id => id !== presetId)
        : [...prev.travelerDetails.enabledPresetIds, presetId];
      return {
        ...prev,
        travelerDetails: {
          ...prev.travelerDetails,
          enabledPresetIds: updated,
        },
      };
    });
  };

  const handleAddCustomQuestion = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customQuestionInput.trim()) return;

    const newQuestion: TravelerQuestion = {
      id: `q_${Date.now()}`,
      label: customQuestionInput.trim(),
      type: customQuestionType,
      prefix: customQuestionInput.trim().charAt(0).toUpperCase(),
      required: customQuestionRequired,
      isPreset: false,
    };

    setSettings(prev => ({
      ...prev,
      travelerDetails: {
        ...prev.travelerDetails,
        customQuestions: [...prev.travelerDetails.customQuestions, newQuestion],
      },
    }));

    setCustomQuestionInput("");
    setCustomQuestionRequired(false);
  };

  const handleRemoveCustomQuestion = (qId: string) => {
    setSettings(prev => ({
      ...prev,
      travelerDetails: {
        ...prev.travelerDetails,
        customQuestions: prev.travelerDetails.customQuestions.filter(q => q.id !== qId),
      },
    }));
  };

  const handleToggleQuestionRequired = (qId: string) => {
    setSettings(prev => ({
      ...prev,
      travelerDetails: {
        ...prev.travelerDetails,
        customQuestions: prev.travelerDetails.customQuestions.map(q => 
          q.id === qId ? { ...q, required: !q.required } : q
        ),
      },
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg("Settings saved successfully!");
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      } else {
        alert(data.error || "Failed to save settings");
      }
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyToTrips = async (scope: "upcoming" | "all") => {
    setIsApplyingTrips(true);
    try {
      // First save current traveler details
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      // Then trigger trip propagation
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply_to_trips", scope }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✓ ${data.message}`);
        setSettings(prev => ({
          ...prev,
          travelerDetails: {
            ...prev.travelerDetails,
            lastAppliedAt: new Date().toISOString(),
            lastAppliedScope: scope,
          },
        }));
      } else {
        alert(data.error || "Failed to apply questions to trips");
      }
    } catch (err: any) {
      alert("Error applying to trips: " + err.message);
    } finally {
      setIsApplyingTrips(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E293B] font-sans -m-6 md:-m-8 p-6 md:p-10 relative">
      {/* Background warm ambient accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FFF0E6] via-[#FFF5EB]/40 to-transparent pointer-events-none rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main 2-Column Split: Navigation Sidebar (Left) + Content (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT SIDEBAR NAVIGATION ================= */}
          <aside className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-extrabold text-[#0F172A] tracking-tight">
                Settings
              </h1>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                You are working in TripNaari. Only the settings your role covers are shown.
              </p>
            </div>

            {/* Nav Group 1: ACCOUNT */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase px-3 block mb-1">
                Account
              </span>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "profile"
                    ? "bg-[#FFEBF0] text-[#E11D48] font-bold"
                    : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("traveler_details")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "traveler_details"
                    ? "bg-[#FFEBF0] text-[#E11D48] font-bold"
                    : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>Traveler details</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pdf_branding")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "pdf_branding"
                    ? "bg-[#FFEBF0] text-[#E11D48] font-bold"
                    : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>PDF branding</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("channels_ai")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "channels_ai"
                    ? "bg-[#FFEBF0] text-[#E11D48] font-bold"
                    : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Channels & AI</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("lead_ads")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "lead_ads"
                    ? "bg-[#FFEBF0] text-[#E11D48] font-bold"
                    : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span>Lead Ads mapping</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("click_to_message")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "click_to_message"
                    ? "bg-[#FFEBF0] text-[#E11D48] font-bold"
                    : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                <MousePointer className="w-4 h-4 shrink-0" />
                <span>Click-to-message ads</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("marketing")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "marketing"
                    ? "bg-[#FFEBF0] text-[#E11D48] font-bold"
                    : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                <Target className="w-4 h-4 shrink-0" />
                <span>Marketing</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("integrations")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "integrations"
                    ? "bg-[#FFEBF0] text-[#E11D48] font-bold"
                    : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                <Plug className="w-4 h-4 shrink-0" />
                <span>Integrations</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("coupons")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "coupons"
                    ? "bg-[#FFEBF0] text-[#E11D48] font-bold"
                    : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                <Tag className="w-4 h-4 shrink-0" />
                <span>Coupons</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("team_seats")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "team_seats"
                    ? "bg-[#FFEBF0] text-[#E11D48] font-bold"
                    : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Team & seats</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pending_payments")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "pending_payments"
                    ? "bg-[#FFEBF0] text-[#E11D48] font-bold"
                    : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span>Pending payments</span>
              </button>
            </div>

            {/* Nav Group 2: INSIGHTS */}
            <div className="space-y-1 pt-2 border-t border-gray-200/60">
              <span className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase px-3 block mb-1">
                Insights
              </span>

              <button
                type="button"
                onClick={() => setActiveTab("insights")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition text-left ${
                  activeTab === "insights"
                    ? "bg-[#FFEBF0] text-[#E11D48] font-bold"
                    : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Insights & reports</span>
              </button>
            </div>

            {/* Nav Group 3: SHORTCUTS */}
            <div className="space-y-1 pt-2 border-t border-gray-200/60">
              <span className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase px-3 block mb-1">
                Shortcuts
              </span>

              <Link
                href="/admin24639/crm"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] transition text-left"
              >
                <BarChart2 className="w-4 h-4 shrink-0 text-[#E11D48]" />
                <span>Unified CRM</span>
              </Link>
            </div>
          </aside>

          {/* ================= RIGHT VIEWPORT CONTENT ================= */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Top Success Banner */}
            {saveSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* TAB 1: TRAVELER DETAILS (MATCHING SCREENSHOT) */}
            {activeTab === "traveler_details" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0F172A]">
                    Traveler details
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    What you ask every traveler, set once and copied into every trip.
                  </p>
                </div>

                {/* Primary Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-[#F1EBE4] space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#0F172A]">
                      Traveler details
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1">
                      Pick what you need from every traveler once. Every new trip asks it, for each person in a booking.
                    </p>
                  </div>

                  {/* Section: Start with one tap */}
                  <div className="space-y-3">
                    <span className="block text-xs font-bold text-[#334155]">
                      Start with one tap
                    </span>

                    <div className="flex flex-wrap gap-2.5">
                      {presetPills.map(preset => {
                        const isSelected = settings.travelerDetails.enabledPresetIds.includes(preset.id);
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleTogglePreset(preset.id)}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition border ${
                              isSelected
                                ? "bg-white border-[#E2E8F0] text-[#1E293B] shadow-xs ring-1 ring-[#FF7A85]/40"
                                : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-gray-300 opacity-60"
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isSelected
                                ? "bg-[#FFF0F3] text-[#E11D48]"
                                : "bg-gray-100 text-gray-500"
                            }`}>
                              {preset.prefix}
                            </span>
                            <span>{preset.label}</span>
                            {isSelected && (
                              <Check className="w-3 h-3 text-[#E11D48] ml-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Question Form Row */}
                  <div className="pt-2">
                    <form onSubmit={handleAddCustomQuestion} className="flex flex-wrap items-center gap-2.5">
                      {/* Dropdown selector for question type */}
                      <div className="relative">
                        <select
                          value={customQuestionType}
                          onChange={(e) => setCustomQuestionType(e.target.value as any)}
                          className="appearance-none bg-white border border-[#E2E8F0] text-xs font-semibold text-[#1E293B] pl-3.5 pr-8 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF7A85]/30 cursor-pointer"
                        >
                          <option value="short_text">Short text</option>
                          <option value="long_text">Long text</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="number">Number</option>
                          <option value="file">File upload</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Custom Question Label Input */}
                      <input
                        type="text"
                        placeholder="e.g. T-Shirt Size, Passport Copy..."
                        value={customQuestionInput}
                        onChange={(e) => setCustomQuestionInput(e.target.value)}
                        className="flex-1 min-w-[200px] bg-white border border-[#E2E8F0] text-xs font-medium text-[#1E293B] px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF7A85]/30"
                      />

                      {/* Required Toggle Checkbox */}
                      <label className="flex items-center gap-1.5 text-xs text-[#64748B] cursor-pointer select-none px-1">
                        <input
                          type="checkbox"
                          checked={customQuestionRequired}
                          onChange={(e) => setCustomQuestionRequired(e.target.checked)}
                          className="rounded text-[#FF7A85] focus:ring-[#FF7A85]"
                        />
                        <span>Required</span>
                      </label>

                      {/* Add Button */}
                      <button
                        type="button"
                        onClick={handleAddCustomQuestion}
                        disabled={!customQuestionInput.trim()}
                        className="bg-white border border-[#E2E8F0] hover:bg-gray-50 text-[#1E293B] text-xs font-bold px-4 py-2 rounded-xl transition shadow-2xs disabled:opacity-50"
                      >
                        Add your own
                      </button>
                    </form>
                  </div>

                  {/* Active Custom Questions List */}
                  {settings.travelerDetails.customQuestions.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                        Custom Questions Active ({settings.travelerDetails.customQuestions.length}):
                      </span>

                      <div className="divide-y divide-gray-100 border border-[#E2E8F0] rounded-2xl overflow-hidden bg-white">
                        {settings.travelerDetails.customQuestions.map(q => (
                          <div key={q.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-[10px]">
                                {q.prefix || "Q"}
                              </span>
                              <span className="font-semibold text-[#1E293B] truncate">{q.label}</span>
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                                {q.type.replace("_", " ")}
                              </span>
                              {q.required && (
                                <span className="text-[9px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.2 rounded">
                                  Required
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleQuestionRequired(q.id)}
                                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                                  q.required
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-gray-50 text-gray-500 border-gray-200"
                                }`}
                              >
                                {q.required ? "Mandatory" : "Optional"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomQuestion(q.id)}
                                className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-gray-100 transition"
                                title="Delete Question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save Button (Matching the screenshot's salmon/coral button) */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="bg-[#FF7A85] hover:bg-[#F43F5E] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>

                  {/* Subcard (Light Blue Callout matching screenshot) */}
                  <div className="bg-[#F0F6FE] border border-[#DBEAFE] rounded-2xl p-5 space-y-3">
                    <div>
                      <h4 className="font-bold text-xs md:text-sm text-[#1E293B]">
                        Apply to trips you already have
                      </h4>
                      <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                        Adds these questions to existing trips and updates the ones already there. Questions you removed here stay on trips that have them, because guests may have answered.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleApplyToTrips("upcoming")}
                        disabled={isApplyingTrips}
                        className="bg-[#FF7A85] hover:bg-[#F43F5E] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-2xs disabled:opacity-50"
                      >
                        {isApplyingTrips ? "Applying..." : "Apply to upcoming trips"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyToTrips("all")}
                        disabled={isApplyingTrips}
                        className="bg-white border border-[#E2E8F0] hover:bg-gray-50 text-[#334155] text-xs font-bold px-4 py-2 rounded-xl transition shadow-2xs disabled:opacity-50"
                      >
                        {isApplyingTrips ? "Applying..." : "Apply to all trips"}
                      </button>
                    </div>

                    {settings.travelerDetails.lastAppliedAt && (
                      <span className="text-[10px] text-[#94A3B8] block pt-1">
                        Last synced to trips: {new Date(settings.travelerDetails.lastAppliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Shortcut Banner Card (Matching Screenshot) */}
                <Link
                  href="/admin24639/crm"
                  className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs flex items-center gap-3 hover:shadow-xs transition group block"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFEBF0] text-[#E11D48] flex items-center justify-center shrink-0">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-display font-bold text-sm text-[#0F172A] group-hover:text-[#E11D48] transition block">
                      Unified CRM
                    </span>
                    <span className="text-xs text-[#64748B]">
                      Leads across TripNaari
                    </span>
                  </div>
                </Link>
              </div>
            )}

            {/* TAB 2: PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0F172A]">Organization Profile</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Your official registered agency credentials, contact info, and SOS hotlines.</p>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-[#F1EBE4] space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#334155] mb-1">Company / Brand Name</label>
                      <input
                        type="text"
                        value={settings.profile.orgName}
                        onChange={(e) => setSettings(prev => ({ ...prev, profile: { ...prev.profile, orgName: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-semibold text-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#334155] mb-1">Official Support Email</label>
                      <input
                        type="email"
                        value={settings.profile.supportEmail}
                        onChange={(e) => setSettings(prev => ({ ...prev, profile: { ...prev.profile, supportEmail: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-semibold text-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#334155] mb-1">General Office Phone</label>
                      <input
                        type="text"
                        value={settings.profile.phone}
                        onChange={(e) => setSettings(prev => ({ ...prev, profile: { ...prev.profile, phone: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-semibold text-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-rose-700 mb-1">24/7 Women SOS Emergency Desk</label>
                      <input
                        type="text"
                        value={settings.profile.sosHotline}
                        onChange={(e) => setSettings(prev => ({ ...prev, profile: { ...prev.profile, sosHotline: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/30 font-bold text-rose-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#334155] mb-1">Registered Business Address</label>
                    <textarea
                      rows={2}
                      value={settings.profile.address}
                      onChange={(e) => setSettings(prev => ({ ...prev, profile: { ...prev.profile, address: e.target.value } }))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-medium text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#334155] mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={settings.profile.gstin}
                      onChange={(e) => setSettings(prev => ({ ...prev, profile: { ...prev.profile, gstin: e.target.value } }))}
                      className="w-full max-w-xs px-3 py-2 rounded-xl border border-[#E2E8F0] font-mono font-bold text-[#0F172A]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="bg-[#FF7A85] hover:bg-[#F43F5E] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-xs disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PDF BRANDING */}
            {activeTab === "pdf_branding" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0F172A]">PDF Brochure Branding</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Customize the itinerary PDF brochures generated for prospective travelers.</p>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-[#F1EBE4] space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#334155] mb-1">Brand Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.pdfBranding.primaryColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, pdfBranding: { ...prev.pdfBranding, primaryColor: e.target.value } }))}
                          className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200 p-1"
                        />
                        <span className="font-mono text-gray-700">{settings.pdfBranding.primaryColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#334155] mb-1">Watermark Seal Text</label>
                      <input
                        type="text"
                        value={settings.pdfBranding.watermarkText}
                        onChange={(e) => setSettings(prev => ({ ...prev, pdfBranding: { ...prev.pdfBranding, watermarkText: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.pdfBranding.showLogo}
                        onChange={(e) => setSettings(prev => ({ ...prev, pdfBranding: { ...prev.pdfBranding, showLogo: e.target.checked } }))}
                        className="rounded text-[#FF7A85]"
                      />
                      <span className="font-semibold text-gray-800">Include Official TripNaari Header Logo</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.pdfBranding.showSafetyPromise}
                        onChange={(e) => setSettings(prev => ({ ...prev, pdfBranding: { ...prev.pdfBranding, showSafetyPromise: e.target.checked } }))}
                        className="rounded text-[#FF7A85]"
                      />
                      <span className="font-semibold text-gray-800">Include 6-Pillar Women Safety Guarantee Clause</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.pdfBranding.showLeaderBio}
                        onChange={(e) => setSettings(prev => ({ ...prev, pdfBranding: { ...prev.pdfBranding, showLeaderBio: e.target.checked } }))}
                        className="rounded text-[#FF7A85]"
                      />
                      <span className="font-semibold text-gray-800">Feature Verified Female Trip Leader Bio & Certifications</span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-bold text-[#334155] mb-1">Custom Footer Disclaimer</label>
                    <textarea
                      rows={2}
                      value={settings.pdfBranding.customFooterText}
                      onChange={(e) => setSettings(prev => ({ ...prev, pdfBranding: { ...prev.pdfBranding, customFooterText: e.target.value } }))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="bg-[#FF7A85] hover:bg-[#F43F5E] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-xs"
                    >
                      {isSaving ? "Saving..." : "Save PDF Branding"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CHANNELS & AI */}
            {activeTab === "channels_ai" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0F172A]">Channels & AI Assistant</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Manage WhatsApp Cloud API, Instagram Graph API, and AI Advisor credentials.</p>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-[#F1EBE4] space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#334155] mb-1">AI Assistant Persona Name</label>
                      <input
                        type="text"
                        value={settings.channelsAI.aiBotName}
                        onChange={(e) => setSettings(prev => ({ ...prev, channelsAI: { ...prev.channelsAI, aiBotName: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#334155] mb-1">Active AI Model Engine</label>
                      <select
                        value={settings.channelsAI.aiModel}
                        onChange={(e) => setSettings(prev => ({ ...prev, channelsAI: { ...prev.channelsAI, aiModel: e.target.value as any } }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-semibold bg-white"
                      >
                        <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Fastest, High Accuracy)</option>
                        <option value="nvidia-llama-3.2">Nvidia NIM Llama 3.2 (Open Weight Enterprise)</option>
                        <option value="rule-engine">Smart Heuristic Rule Engine (Zero External Key Needed)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#334155] mb-1">WhatsApp Phone Number ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 109283749281729"
                        value={settings.channelsAI.whatsappPhoneNumberId}
                        onChange={(e) => setSettings(prev => ({ ...prev, channelsAI: { ...prev.channelsAI, whatsappPhoneNumberId: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#334155] mb-1">Meta Webhook Verify Token</label>
                      <input
                        type="text"
                        value={settings.channelsAI.metaWebhookVerifyToken}
                        onChange={(e) => setSettings(prev => ({ ...prev, channelsAI: { ...prev.channelsAI, metaWebhookVerifyToken: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#334155] mb-1">Meta / WhatsApp Access Token</label>
                    <input
                      type="password"
                      placeholder="EAA..."
                      value={settings.channelsAI.whatsappAccessToken}
                      onChange={(e) => setSettings(prev => ({ ...prev, channelsAI: { ...prev.channelsAI, whatsappAccessToken: e.target.value } }))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-mono"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="bg-[#FF7A85] hover:bg-[#F43F5E] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-xs"
                    >
                      {isSaving ? "Saving..." : "Save AI & Channel Settings"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: LEAD ADS MAPPING */}
            {activeTab === "lead_ads" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0F172A]">Meta Lead Ads Mapping</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Route prospective inquiries from Facebook and Instagram lead forms straight into TripNaari CRM.</p>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-[#F1EBE4] space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#F0F6FE] border border-[#DBEAFE] space-y-2">
                    <span className="font-bold text-[#1E293B] block">Webhook Ingest URL</span>
                    <code className="bg-white px-3 py-1.5 rounded-xl border border-[#DBEAFE] text-[11px] block font-mono text-gray-800">
                      https://www.tripnaari.com/api/webhooks/meta
                    </code>
                    <p className="text-[11px] text-[#64748B]">Paste this webhook into your Meta App Developer Console under Webhooks &gt; Leadgen.</p>
                  </div>

                  <div>
                    <label className="block font-bold text-[#334155] mb-1">Active Lead Form Name</label>
                    <input
                      type="text"
                      value={settings.leadAds.formName}
                      onChange={(e) => setSettings(prev => ({ ...prev, leadAds: { ...prev.leadAds, formName: e.target.value } }))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0]"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.leadAds.autoAssignToHotLeads}
                      onChange={(e) => setSettings(prev => ({ ...prev, leadAds: { ...prev.leadAds, autoAssignToHotLeads: e.target.checked } }))}
                      className="rounded text-[#FF7A85]"
                    />
                    <span className="font-semibold text-gray-800">Automatically flag Meta Lead Ad submissions with Intent Score 90+ (Hot Lead)</span>
                  </label>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="bg-[#FF7A85] hover:bg-[#F43F5E] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-xs"
                    >
                      {isSaving ? "Saving..." : "Save Lead Ad Mapping"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: CLICK TO MESSAGE ADS */}
            {activeTab === "click_to_message" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0F172A]">Click-to-Message Ads</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Automated welcoming and parameter tracking for travelers arriving from Click-to-WhatsApp ads.</p>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-[#F1EBE4] space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#334155] mb-1">Automated First Greeting Text</label>
                    <textarea
                      rows={3}
                      value={settings.clickToMessage.adGreeting}
                      onChange={(e) => setSettings(prev => ({ ...prev, clickToMessage: { ...prev.clickToMessage, adGreeting: e.target.value } }))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#334155] mb-1">UTM Tracking Tag</label>
                    <input
                      type="text"
                      value={settings.clickToMessage.trackingTag}
                      onChange={(e) => setSettings(prev => ({ ...prev, clickToMessage: { ...prev.clickToMessage, trackingTag: e.target.value } }))}
                      className="w-full max-w-sm px-3 py-2 rounded-xl border border-[#E2E8F0] font-mono"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="bg-[#FF7A85] hover:bg-[#F43F5E] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-xs"
                    >
                      {isSaving ? "Saving..." : "Save Ad Settings"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: MARKETING */}
            {activeTab === "marketing" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0F172A]">Marketing & Broadcasts</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Configure broad campaign incentives and outbound WhatsApp broadcast permissions.</p>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-[#F1EBE4] space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#334155] mb-1">Default Inactive Re-engagement Voucher</label>
                      <input
                        type="text"
                        value={settings.marketing.defaultPromoCode}
                        onChange={(e) => setSettings(prev => ({ ...prev, marketing: { ...prev.marketing, defaultPromoCode: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#334155] mb-1">Discount Value (₹ INR)</label>
                      <input
                        type="number"
                        value={settings.marketing.discountAmount}
                        onChange={(e) => setSettings(prev => ({ ...prev, marketing: { ...prev.marketing, discountAmount: Number(e.target.value) } }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-mono font-bold"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={settings.marketing.broadcastEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, marketing: { ...prev.marketing, broadcastEnabled: e.target.checked } }))}
                      className="rounded text-[#FF7A85]"
                    />
                    <span className="font-semibold text-gray-800">Enable Outbound WhatsApp Multi-Lead Broadcast Engine</span>
                  </label>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="bg-[#FF7A85] hover:bg-[#F43F5E] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-xs"
                    >
                      {isSaving ? "Saving..." : "Save Marketing Settings"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: INTEGRATIONS */}
            {activeTab === "integrations" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0F172A]">Platform Integrations</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Connected service accounts for Email, Meta, WhatsApp, Analytics, and Payments.</p>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-[#F1EBE4] space-y-4 text-xs">
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900 block">WhatsApp & Instagram (Meta Cloud API)</span>
                        <span className="text-gray-500 text-[11px]">Direct two-way messaging & webhooks</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-[10px]">
                        ACTIVE
                      </span>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900 block">Resend Email Gateway</span>
                        <span className="text-gray-500 text-[11px]">Transactional booking receipts & customer inquiries</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-[10px]">
                        CONNECTED
                      </span>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900 block">UPI Instant Verification Engine</span>
                        <span className="text-gray-500 text-[11px]">Zero-fee UPI QR codes & UTR statement verification</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-[10px]">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: COUPONS */}
            {activeTab === "coupons" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0F172A]">Promotional Coupons</h2>
                    <p className="text-xs text-[#64748B] mt-0.5">Create and manage promo codes offered across the website and sales drips.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const code = prompt("Enter new coupon code (e.g. WANDERLUST15):");
                      if (code && code.trim()) {
                        setSettings(prev => ({
                          ...prev,
                          coupons: [
                            ...prev.coupons,
                            {
                              code: code.trim().toUpperCase(),
                              discountType: "flat",
                              value: 1000,
                              description: "Custom promotional discount",
                              isActive: true,
                            }
                          ]
                        }));
                      }
                    }}
                    className="bg-[#13253D] hover:bg-[#1E3A60] text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    + Add Coupon
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-[#F1EBE4] space-y-3 text-xs">
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                    {settings.coupons.map((c, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#0F172A]">{c.code}</span>
                            <span className="bg-rose-50 text-[#E11D48] font-bold text-[10px] px-2 py-0.5 rounded-full">
                              {c.discountType === "flat" ? `₹${c.value} OFF` : `${c.value}% OFF`}
                            </span>
                          </div>
                          <p className="text-gray-500 text-[11px] mt-0.5">{c.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSettings(prev => ({
                                ...prev,
                                coupons: prev.coupons.map((item, i) => i === idx ? { ...item, isActive: !item.isActive } : item)
                              }));
                            }}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition ${
                              c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {c.isActive ? "Active" : "Disabled"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSettings(prev => ({
                                ...prev,
                                coupons: prev.coupons.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-gray-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="bg-[#FF7A85] hover:bg-[#F43F5E] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-xs"
                    >
                      {isSaving ? "Saving..." : "Save Coupons"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 10: TEAM & SEATS */}
            {activeTab === "team_seats" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0F172A]">Sales Team & Seats</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Manage active managers for lead assignment and chat routing.</p>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-[#F1EBE4] space-y-4 text-xs">
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                    {settings.team.members.map(m => (
                      <div key={m.id} className="p-4 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900 block">{m.name}</span>
                          <span className="text-gray-500 text-[11px]">{m.role} • {m.email}</span>
                        </div>
                        <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full text-[10px]">
                          Sales Manager
                        </span>
                      </div>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={settings.team.autoAssign}
                      onChange={(e) => setSettings(prev => ({ ...prev, team: { ...prev.team, autoAssign: e.target.checked } }))}
                      className="rounded text-[#FF7A85]"
                    />
                    <span className="font-semibold text-gray-800">Round-Robin Auto-Assign Incoming Qualified Inquiries</span>
                  </label>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="bg-[#FF7A85] hover:bg-[#F43F5E] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-xs"
                    >
                      {isSaving ? "Saving..." : "Save Team Settings"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 11: PENDING PAYMENTS & FINANCE */}
            {activeTab === "pending_payments" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0F172A]">Pending Payments & Bank Details</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">UPI merchant VPA, corporate HDFC bank coordinates, and balance chaser trigger timings.</p>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-[#F1EBE4] space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#334155] mb-1">Official UPI VPA ID</label>
                      <input
                        type="text"
                        value={settings.pendingPayments.upiVpa}
                        onChange={(e) => setSettings(prev => ({ ...prev, pendingPayments: { ...prev.pendingPayments, upiVpa: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#334155] mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={settings.pendingPayments.bankName}
                        onChange={(e) => setSettings(prev => ({ ...prev, pendingPayments: { ...prev.pendingPayments, bankName: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#334155] mb-1">Corporate Account Number</label>
                      <input
                        type="text"
                        value={settings.pendingPayments.accountNumber}
                        onChange={(e) => setSettings(prev => ({ ...prev, pendingPayments: { ...prev.pendingPayments, accountNumber: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#334155] mb-1">Bank IFSC Code</label>
                      <input
                        type="text"
                        value={settings.pendingPayments.ifsc}
                        onChange={(e) => setSettings(prev => ({ ...prev, pendingPayments: { ...prev.pendingPayments, ifsc: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#334155] mb-1">Balance Due Trigger Timing (Days Prior to Departure)</label>
                    <input
                      type="number"
                      value={settings.pendingPayments.balanceDueDaysBefore}
                      onChange={(e) => setSettings(prev => ({ ...prev, pendingPayments: { ...prev.pendingPayments, balanceDueDaysBefore: Number(e.target.value) } }))}
                      className="w-full max-w-xs px-3 py-2 rounded-xl border border-[#E2E8F0] font-bold"
                    />
                    <span className="text-[11px] text-gray-500 mt-1 block">Default: 14 days before trip departure date.</span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="bg-[#FF7A85] hover:bg-[#F43F5E] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-xs"
                    >
                      {isSaving ? "Saving..." : "Save Payment Details"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 12: INSIGHTS & REPORTS */}
            {activeTab === "insights" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0F172A]">Insights & Reports</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">High-level sales velocity, qualification conversion, and destination demand.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-[#E2E8F0]">
                    <span className="text-xs font-bold text-gray-500 block">Lead-to-Booking Rate</span>
                    <span className="text-2xl font-bold font-mono text-[#E11D48] mt-1 block">34.8%</span>
                    <span className="text-[10px] text-emerald-600 font-bold">↑ +4.2% from last month</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-[#E2E8F0]">
                    <span className="text-xs font-bold text-gray-500 block">Avg AI Response Speed</span>
                    <span className="text-2xl font-bold font-mono text-[#13253D] mt-1 block">&lt; 3.2s</span>
                    <span className="text-[10px] text-gray-400">Gemini 1.5 Flash stream</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-[#E2E8F0]">
                    <span className="text-xs font-bold text-gray-500 block">Top Demand Destination</span>
                    <span className="text-2xl font-bold font-display text-[#13253D] mt-1 block">Kashmir Blossom</span>
                    <span className="text-[10px] text-gray-400">142 inquiries this month</span>
                  </div>
                </div>

                <Link
                  href="/admin24639/finance"
                  className="inline-flex items-center gap-2 bg-[#13253D] hover:bg-[#1E3A60] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs"
                >
                  <span>Open Full Finance & Margin Ledger</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
