"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Settings, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  HelpCircle, 
  Send,
  Sliders,
  CheckCircle,
  Plus,
  Trash2,
  Compass,
  Smile,
  ShieldCheck,
  FileText,
  Clock,
  LayoutDashboard,
  Search,
  BookOpen,
  History,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldAlert,
  RotateCcw
} from "lucide-react";
import { saveAISettings, getAIChatLogs, clearAIChatLogs } from "@/lib/admin-store";

interface QAPair {
  id: number;
  question: string;
  answer: string;
}

interface AISettings {
  nvidiaApiKey: string;
  geminiApiKey: string;
  modelName: string;
  welcomeMessage: string;
  systemInstruction: string;
  customKnowledge: string;
  temperature: number;
  personaTone: "warm" | "professional" | "adventurous";
  includeTrips: boolean;
  includeDepartures: boolean;
  includeFaqs: boolean;
  includePolicies: boolean;
  qaPairs: QAPair[];
}

interface ChatLogMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatLog {
  id: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatLogMessage[];
  messageCount: number;
  context?: {
    pathname?: string;
    source?: string;
  };
}

interface AISettingsManagerProps {
  initialSettings: AISettings;
  dbCounts?: {
    trips: number;
    departures: number;
    faqs: number;
    policies: number;
  };
}

const defaultModels = [
  { value: "meta/llama-3.2-11b-vision-instruct", label: "Llama 3.2 11B Vision Instruct (Recommended & Fast)" },
  { value: "meta/llama-3.2-90b-vision-instruct", label: "Llama 3.2 90B Vision Instruct (High Performance)" },
  { value: "nv-mistralai/mistral-nemo-12b-instruct", label: "Mistral Nemo 12B Instruct (Great for QA)" },
];

const defaultWelcomeMessage = "Namaste! 🙏 Welcome to TripNaari. I am NaariAI, your travel companion. I can help you find safe women-only packages, check active departures, and answer any queries you have. What destinations are you dreaming of?";

const defaultSystemInstruction = `You are "NaariAI", the official women's safety & group travel assistant for TripNaari.
TripNaari is India's leading travel brand focusing on safe solo and group travel experiences for women, sisters, mothers, and daughters.

YOUR INSTRUCTIONS:
1. ONLY answer questions using the provided TripNaari information (Trips, Departures, FAQs, Policies, Custom Knowledge) listed below.
2. Be extremely warm, friendly, encouraging, and supportive. Emphasize women's safety, sisterhood, local women leaders, and verified safety audits.
3. If a customer is asking to book a trip or wants a customized itinerary, encourage them to fill out our quick Enquiry/Booking Form. You can output "[SHOW_ENQUIRY_FORM]" at the end of your response to trigger the form interface inside the chat drawer.
4. If a user asks about topics completely unrelated to TripNaari (e.g. coding, cooking recipes, other travel operators, general news), politely state that you are only programmed to help with TripNaari trips and safety queries.
5. Do NOT hallucinate prices, dates, or destinations that are not in the context below.
6. BUDGET & MATH ACCURACY: When a user specifies a budget (e.g. "X for N people"), carefully verify that the total cost (Price Per Person * N) is mathematically less than or equal to their budget X. Do not recommend any package that exceeds their budget. Show your calculation clearly (e.g., "₹A per person * B people = ₹C total").`;

const defaultCustomKnowledge = `Here are additional training details and rules for NaariAI:
- We are currently offering a special discount for solo travelers booking active trips: extra ₹1,000 off if they mention safety questions.
- All trip leaders are certified women professionals who stay in the same accommodation.
- Verification audits are done for every single hotel room lock prior to group check-in.`;

const testPresets = [
  { label: "Solo Safety Audits", text: "How does TripNaari ensure safety for solo female travelers?" },
  { label: "Budget Math Test", text: "What packages do you have under ₹20,000 for 2 people?" },
  { label: "Refund Timeline", text: "What is your refund policy if I cancel 20 days prior to trip departure?" },
  { label: "Kashmir Highlights", text: "Show me details and departures for Kashmir group trips." }
];

export default function AISettingsManager({ initialSettings, dbCounts = { trips: 0, departures: 0, faqs: 0, policies: 0 } }: AISettingsManagerProps) {
  const [settings, setSettings] = useState<AISettings>({
    ...initialSettings,
    qaPairs: initialSettings.qaPairs || []
  });
  const [showKey, setShowKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [activeTab, setActiveTab] = useState<"config" | "prompts" | "qa" | "logs" | "analytics">("config");

  // Testing & Custom NIM options
  const [isCustomModel, setIsCustomModel] = useState(!defaultModels.some(m => m.value === initialSettings.modelName));
  const [customModelInput, setCustomModelInput] = useState(isCustomModel ? initialSettings.modelName : "");

  // Sandbox states
  const [testMessages, setTestMessages] = useState<Array<{ role: "user" | "assistant" | "system"; content: string }>>([
    { role: "system", content: "🤖 Training Preview Sandbox: Unsaved QA pairs, Tone, and Context checkboxes are dynamically loaded into this preview chat!" }
  ]);
  const [testInput, setTestInput] = useState("");
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isTestTyping, setIsTestTyping] = useState(false);

  // Q&A training states
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editingQaId, setEditingQaId] = useState<number | null>(null);
  const [qaSearchQuery, setQaSearchQuery] = useState("");

  // Chat Logs & Analytics states
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ChatLog | null>(null);
  const [logsSearchQuery, setLogsSearchQuery] = useState("");

  // Load chat logs on tab switch
  useEffect(() => {
    if (activeTab === "logs" || activeTab === "analytics") {
      loadLogs();
    }
  }, [activeTab]);

  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await getAIChatLogs();
      setChatLogs(logs);
    } catch (e) {
      console.error("Failed to load AI logs", e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to permanently clear all user chat logs?")) return;
    try {
      await clearAIChatLogs();
      setChatLogs([]);
      setSelectedLog(null);
    } catch (e) {
      alert("Failed to clear chat logs.");
    }
  };

  const handleInputChange = (field: keyof AISettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setSaveSuccess(false);
    setSaveError("");
  };

  const handleModelSelect = (val: string) => {
    if (val === "custom") {
      setIsCustomModel(true);
      handleInputChange("modelName", customModelInput || "meta/llama-3.3-70b-instruct");
    } else {
      setIsCustomModel(false);
      handleInputChange("modelName", val);
    }
  };

  const handleCustomModelChange = (val: string) => {
    setCustomModelInput(val);
    handleInputChange("modelName", val);
  };

  // Structured QA Actions
  const handleAddQa = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    if (editingQaId !== null) {
      setSettings(prev => ({
        ...prev,
        qaPairs: prev.qaPairs.map(qa => qa.id === editingQaId ? { ...qa, question: newQuestion.trim(), answer: newAnswer.trim() } : qa)
      }));
      setEditingQaId(null);
    } else {
      const newPair: QAPair = {
        id: Date.now(),
        question: newQuestion.trim(),
        answer: newAnswer.trim()
      };
      setSettings(prev => ({
        ...prev,
        qaPairs: [...(prev.qaPairs || []), newPair]
      }));
    }

    setNewQuestion("");
    setNewAnswer("");
  };

  const handleStartEditQa = (qa: QAPair) => {
    setEditingQaId(qa.id);
    setNewQuestion(qa.question);
    setNewAnswer(qa.answer);
  };

  const handleCancelEditQa = () => {
    setEditingQaId(null);
    setNewQuestion("");
    setNewAnswer("");
  };

  const handleDeleteQa = (id: number) => {
    setSettings(prev => ({
      ...prev,
      qaPairs: prev.qaPairs.filter(qa => qa.id !== id)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError("");
    try {
      const res = await saveAISettings(settings);
      if (res?.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError("Failed to save settings. Please try again.");
      }
    } catch (e: any) {
      setSaveError(e.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async (text?: string) => {
    const messageToSend = text || testInput;
    if (!messageToSend.trim() || isTestLoading || isTestTyping) return;

    if (!text) setTestInput("");

    const updatedMessages = [...testMessages, { role: "user" as const, content: messageToSend }];
    setTestMessages(updatedMessages);
    setIsTestLoading(true);
    setIsTestTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "admin",
          messages: updatedMessages.filter(m => m.role !== "system"),
          tempSettings: settings,
          context: {
            pathname: "/admin/ai-settings",
            source: "sandbox_testing"
          }
        })
      });

      if (!response.ok) throw new Error("Failed to connect to API");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let streamedReply = "";
      let displayedReply = "";
      let textQueue: string[] = [];

      setIsTestLoading(false);
      setTestMessages(prev => [
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

          setTestMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              last.content = displayedReply;
            }
            return updated;
          });
        } else if (done) {
          clearInterval(typewriterInterval);
          setIsTestTyping(false);
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
        console.error("Stream interrupted:", streamError);
        done = true;
        setIsTestTyping(false);
      }
    } catch (err: any) {
      console.error(err);
      setIsTestLoading(false);
      setTestMessages(prev => [
        ...prev,
        { role: "assistant", content: `❌ Error: Connection error or invalid parameters.` }
      ]);
    }
  };

  const resetSandbox = () => {
    setTestMessages([
      { role: "system", content: "🤖 Training Preview Sandbox: Unsaved QA pairs, Tone, and Context checkboxes are dynamically loaded into this preview chat!" }
    ]);
    setTestInput("");
  };

  // Defaults Reset Helpers
  const handleResetWelcome = () => {
    if (confirm("Reset welcome message to factory defaults?")) {
      handleInputChange("welcomeMessage", defaultWelcomeMessage);
    }
  };

  const handleResetSystem = () => {
    if (confirm("Reset system instructions template to factory defaults?")) {
      handleInputChange("systemInstruction", defaultSystemInstruction);
    }
  };

  const handleResetKnowledge = () => {
    if (confirm("Reset custom knowledge notes to default templates?")) {
      handleInputChange("customKnowledge", defaultCustomKnowledge);
    }
  };

  // Filters for QA and Logs
  const filteredQaPairs = (settings.qaPairs || []).filter(qa => 
    qa.question.toLowerCase().includes(qaSearchQuery.toLowerCase()) ||
    qa.answer.toLowerCase().includes(qaSearchQuery.toLowerCase())
  );

  const filteredLogs = chatLogs.filter(log => {
    const term = logsSearchQuery.toLowerCase();
    const matchesPath = log.context?.pathname?.toLowerCase().includes(term) || false;
    const matchesMsg = log.messages.some(m => m.content.toLowerCase().includes(term));
    return matchesPath || matchesMsg || log.id.toLowerCase().includes(term);
  });

  // Calculate quick mock/real metrics for Analytics tab
  const totalUserMessagesCount = chatLogs.reduce((acc, log) => acc + log.messages.filter(m => m.role === "user").length, 0);
  const avgMessagesPerChat = chatLogs.length > 0 ? (totalUserMessagesCount / chatLogs.length).toFixed(1) : "0";
  
  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Title Header Section */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white border border-[#F1D9D0] p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] text-[#FF4A7D] flex items-center justify-center shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-[#13253D] flex items-center gap-2">
              NaariAI Assistant Panel
            </h1>
            <p className="text-xs text-[#3D4A5E]/75 mt-0.5">
              Control system guidelines, train target facts, view real-time user conversations, and analyze chatbot interactions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-full animate-bounce">
              <CheckCircle className="w-4 h-4" />
              <span>Settings saved!</span>
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-full">
              <AlertCircle className="w-4 h-4" />
              <span>{saveError}</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-[#FF4A7D] hover:bg-[#E63E6E] disabled:bg-gray-400 text-white px-7 py-3 text-sm font-extrabold transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? "Saving Config..." : "Save Controls"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7/12) - Settings Toggles and Tabs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Dashboard Tab Bar */}
          <div className="flex bg-[#13253D] p-1.5 rounded-2xl overflow-x-auto scrollbar-none gap-1 shadow-md">
            {[
              { id: "config", label: "Core Config", icon: Settings },
              { id: "prompts", label: "Tone & Prompts", icon: Compass },
              { id: "qa", label: "Structured Q&A", icon: FileText },
              { id: "logs", label: "Recent Chats", icon: History, count: chatLogs.length },
              { id: "analytics", label: "AI Analytics", icon: LayoutDashboard }
            ].map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive 
                      ? "bg-[#FF4A7D] text-white shadow-md scale-102" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                  {t.count !== undefined && t.count > 0 && (
                    <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full shrink-0 font-extrabold font-mono">
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT AREAS */}
          
          {/* Tab 1: Core Configuration */}
          {activeTab === "config" && (
            <div className="rounded-2xl border border-[#F1D9D0] bg-white p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
              
              <div className="flex justify-between items-center border-b border-[#F1D9D0]/60 pb-3">
                <h3 className="font-bold text-base text-[#13253D] flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#FF8A2B]" />
                  <span>API Connection & Model Options</span>
                </h3>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#FF8A2B] bg-[#FFF8F0] px-2.5 py-1 rounded-md border border-[#F1D9D0]/50">
                  SYSTEM CORE
                </span>
              </div>

              {/* NVIDIA API Key */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#13253D]/70 uppercase tracking-wide flex items-center gap-1.5">
                    NVIDIA NIM API Key
                    <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-xs text-[#FF4A7D] hover:text-[#E63E6E] font-extrabold transition flex items-center gap-1"
                  >
                    {showKey ? (
                      <><EyeOff className="w-3.5 h-3.5" /><span>Hide Mask</span></>
                    ) : (
                      <><Eye className="w-3.5 h-3.5" /><span>Reveal Key</span></>
                    )}
                  </button>
                </div>
                
                <input
                  type="text"
                  name="nv_key_spec_input_nocache"
                  autoComplete="new-password"
                  value={settings.nvidiaApiKey}
                  onChange={e => handleInputChange("nvidiaApiKey", e.target.value)}
                  placeholder="nvapi-xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full rounded-xl border border-[#F1D9D0] px-4 py-3 text-xs bg-[#FFF8F0]/20 font-mono outline-none focus:border-[#FF4A7D] focus:ring-1 focus:ring-[#FF4A7D]/20 transition-all shadow-sm"
                  style={{
                    WebkitTextSecurity: showKey ? "none" : "disc",
                    textSecurity: showKey ? "none" : "disc"
                  } as any}
                />
                <div className="flex gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[10px] text-slate-600 leading-normal">
                  <Activity className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p>
                    Hosted on NVIDIA NIM Inference Microservices. Key is masked and cached locally. Fallbacks to Google Gemini-3.5-Flash if key is inactive or offline.
                  </p>
                </div>
              </div>
 
              {/* Google Gemini API Key */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#13253D]/70 uppercase tracking-wide flex items-center gap-1.5">
                    Google Gemini API Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="text-xs text-[#FF4A7D] hover:text-[#E63E6E] font-extrabold transition flex items-center gap-1"
                  >
                    {showGeminiKey ? (
                      <><EyeOff className="w-3.5 h-3.5" /><span>Hide Mask</span></>
                    ) : (
                      <><Eye className="w-3.5 h-3.5" /><span>Reveal Key</span></>
                    )}
                  </button>
                </div>
                
                <input
                  type="text"
                  name="gemini_key_spec_input_nocache"
                  autoComplete="new-password"
                  value={settings.geminiApiKey}
                  onChange={e => handleInputChange("geminiApiKey", e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full rounded-xl border border-[#F1D9D0] px-4 py-3 text-xs bg-[#FFF8F0]/20 font-mono outline-none focus:border-[#FF4A7D] focus:ring-1 focus:ring-[#FF4A7D]/20 transition-all shadow-sm"
                  style={{
                    WebkitTextSecurity: showGeminiKey ? "none" : "disc",
                    textSecurity: showGeminiKey ? "none" : "disc"
                  } as any}
                />
                <div className="flex gap-2 p-3 bg-pink-50/50 border border-pink-100 rounded-xl text-[10px] text-slate-600 leading-normal">
                  <Sparkles className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                  <p>
                    Used as the active fallback model. Key is masked and cached in ai_settings.json. Defaults to process.env.GEMINI_API_KEY if left empty.
                  </p>
                </div>
              </div>

              {/* Model Choice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#13253D]/70 uppercase tracking-wide">
                    Model Architecture
                  </label>
                  <select
                    value={isCustomModel ? "custom" : settings.modelName}
                    onChange={e => handleModelSelect(e.target.value)}
                    className="w-full rounded-xl border border-[#F1D9D0] px-3.5 py-3 text-xs bg-white outline-none focus:border-[#FF4A7D] transition font-bold text-[#13253D] shadow-sm cursor-pointer"
                  >
                    {defaultModels.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                    <option value="custom">✍️ Custom NVIDIA Model ID...</option>
                  </select>
                </div>

                {isCustomModel && (
                  <div className="space-y-1.5 animate-in slide-in-from-left-2 duration-200">
                    <label className="text-[11px] font-bold text-[#13253D]/70 uppercase tracking-wide">
                      Custom NIM Model ID
                    </label>
                    <input
                      type="text"
                      value={customModelInput}
                      onChange={e => handleCustomModelChange(e.target.value)}
                      placeholder="e.g. meta/llama-3-70b-instruct"
                      className="w-full rounded-xl border border-[#F1D9D0] px-3.5 py-3 text-xs bg-white outline-none focus:border-[#FF4A7D] transition font-mono shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Creativity Temperature */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#13253D]/70 uppercase tracking-wide flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#FF8A2B]" />
                    <span>Creativity Temperature</span>
                  </label>
                  <span className="text-xs font-mono font-black text-[#FF4A7D] bg-[#FFF0F4] px-2.5 py-1 rounded-lg border border-[#FF4A7D]/10">
                    {settings.temperature.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-4 bg-[#FFF8F0]/30 border border-[#F1D9D0]/30 rounded-xl p-3">
                  <span className="text-[10px] text-gray-500 font-extrabold uppercase">Strict (0.0)</span>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={settings.temperature}
                    onChange={e => handleInputChange("temperature", parseFloat(e.target.value))}
                    className="flex-1 accent-[#FF4A7D] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-500 font-extrabold uppercase">Creative (1.0)</span>
                </div>
              </div>

              {/* Dynamic Context Checkboxes with Counts */}
              <div className="space-y-3 pt-2">
                <label className="text-[11px] font-bold text-[#13253D]/70 uppercase tracking-wide block">
                  Dynamic Website Context Checklist
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: "includeTrips", title: "Inject Trip Packages", desc: "Access catalog itineraries and pricing.", count: dbCounts.trips, label: "packages" },
                    { key: "includeDepartures", title: "Inject Scheduled Departures", desc: "Access seat counts and dates.", count: dbCounts.departures, label: "dates" },
                    { key: "includeFaqs", title: "Inject FAQ Database", desc: "Access default site safety questions.", count: dbCounts.faqs, label: "FAQs" },
                    { key: "includePolicies", title: "Inject Booking Policies", desc: "Access cancellation and refund rules.", count: dbCounts.policies, label: "policies" }
                  ].map(item => (
                    <label 
                      key={item.key} 
                      className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        // @ts-ignore
                        settings[item.key] !== false
                          ? "border-[#FF4A7D]/30 bg-[#FFF0F4]/20 hover:bg-[#FFF0F4]/40" 
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        // @ts-ignore
                        checked={settings[item.key] !== false}
                        onChange={e => handleInputChange(item.key as any, e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-[#FF4A7D] focus:ring-[#FF4A7D]"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-extrabold text-[#13253D]">{item.title}</span>
                          <span className="text-[9px] font-mono font-extrabold text-[#FF4A7D] bg-white px-1.5 py-0.5 rounded border border-[#F1D9D0]/50">
                            {item.count} {item.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 block leading-normal">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: Persona & Custom Prompts */}
          {activeTab === "prompts" && (
            <div className="rounded-2xl border border-[#F1D9D0] bg-white p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
              
              <div className="flex justify-between items-center border-b border-[#F1D9D0]/60 pb-3">
                <h3 className="font-bold text-base text-[#13253D] flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#FF4A7D]" />
                  <span>Persona Tone & Core System Instructions</span>
                </h3>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#FF4A7D] bg-[#FFF0F4] px-2.5 py-1 rounded-md border border-[#FF4A7D]/10">
                  IDENTITY
                </span>
              </div>

              {/* Persona Voice Style Selection */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-[#13253D]/70 uppercase tracking-wide block">
                  Assistant Tone / Personality Style
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: "warm", title: "Friendly & Warm", icon: Smile, desc: "Emphasizes sisterhood, solo safety guarantees, and supportive solo travel tips.", color: "text-rose-500" },
                    { value: "professional", title: "Concise & Factual", icon: ShieldCheck, desc: "Delivers direct, specific cancellation rules and metrics without conversational fluff.", color: "text-[#FF8A2B]" },
                    { value: "adventurous", title: "Enthusiastic & Bold", icon: Compass, desc: "Inspires hiking adventures, treks, scenic roadways, and mountain trip excitement.", color: "text-blue-500" }
                  ].map(t => {
                    const Icon = t.icon;
                    const isSel = settings.personaTone === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => handleInputChange("personaTone", t.value)}
                        className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all ${
                          isSel 
                            ? "border-[#FF4A7D] bg-[#FFF0F4]/40 text-[#FF4A7D] shadow-inner scale-102" 
                            : "border-gray-200 bg-white text-[#3D4A5E] hover:border-gray-300"
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${isSel ? "text-[#FF4A7D]" : t.color}`} />
                        <span className="text-xs font-black block">{t.title}</span>
                        <span className="text-[9.5px] text-gray-500 mt-1.5 leading-relaxed block">{t.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Welcome Message */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#13253D]/70 uppercase tracking-wide">
                    Welcome Greeting Message
                  </label>
                  <button
                    type="button"
                    onClick={handleResetWelcome}
                    className="text-[10px] text-[#3D4A5E] hover:text-[#FF4A7D] flex items-center gap-1 font-bold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Default</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={settings.welcomeMessage}
                  onChange={e => handleInputChange("welcomeMessage", e.target.value)}
                  placeholder="Greeting when chatbot drawer is opened..."
                  className="w-full rounded-xl border border-[#F1D9D0] px-4 py-3 text-xs bg-white outline-none focus:border-[#FF4A7D] transition-all shadow-sm leading-relaxed"
                />
              </div>

              {/* System instructions override */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#13253D]/70 uppercase tracking-wide">
                    System prompt Instructions (Base identity template)
                  </label>
                  <button
                    type="button"
                    onClick={handleResetSystem}
                    className="text-[10px] text-[#3D4A5E] hover:text-[#FF4A7D] flex items-center gap-1 font-bold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Default</span>
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={settings.systemInstruction}
                  onChange={e => handleInputChange("systemInstruction", e.target.value)}
                  placeholder="Override custom identity directions..."
                  className="w-full rounded-xl border border-[#F1D9D0] px-4 py-3 text-xs bg-[#FFF8F0]/30 outline-none focus:border-[#FF4A7D] transition-all font-mono leading-relaxed"
                />
                <p className="text-[10px] text-gray-500">
                  Note: Custom persona settings and data inject checklist are dynamically appended below these guidelines.
                </p>
              </div>

              {/* Other raw training context */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#13253D]/70 uppercase tracking-wide">
                    Other Raw Training context
                  </label>
                  <button
                    type="button"
                    onClick={handleResetKnowledge}
                    className="text-[10px] text-[#3D4A5E] hover:text-[#FF4A7D] flex items-center gap-1 font-bold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Defaults</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={settings.customKnowledge}
                  onChange={e => handleInputChange("customKnowledge", e.target.value)}
                  placeholder="Raw notes, custom discounts, hotel auditing processes..."
                  className="w-full rounded-xl border border-[#F1D9D0] px-4 py-3 text-xs bg-white outline-none focus:border-[#FF4A7D] transition-all shadow-sm leading-relaxed"
                />
              </div>

            </div>
          )}

          {/* Tab 3: Structured Q&A Training Board */}
          {activeTab === "qa" && (
            <div className="rounded-2xl border border-[#F1D9D0] bg-white p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
              
              <div className="flex justify-between items-center border-b border-[#F1D9D0]/60 pb-3">
                <h3 className="font-bold text-base text-[#13253D] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#FF8A2B]" />
                  <span>Structured Q&A Board</span>
                </h3>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#FF8A2B] bg-[#FFF8F0] px-2.5 py-1 rounded-md border border-[#F1D9D0]/50">
                  FAQ INJECTION
                </span>
              </div>
              
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Directly teach the AI how to answer specific questions. If a user asks something resembling the question, the AI will use this training answer as prime truth.
              </p>

              {/* Add Card Editor form */}
              <div className="bg-[#FFF0F4]/30 border border-[#FF4A7D]/10 rounded-2xl p-5 space-y-4 shadow-sm">
                <h4 className="text-xs font-black text-[#13253D] uppercase tracking-wide flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#FF4A7D]" />
                  <span>{editingQaId !== null ? "Edit Training Card" : "Add Training Card"}</span>
                </h4>
                <div className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Question (e.g. Can children join the group trips?)"
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                    className="w-full rounded-xl border border-[#F1D9D0] px-4 py-2.5 text-xs bg-white outline-none focus:border-[#FF4A7D] shadow-sm"
                  />
                  <textarea
                    rows={2}
                    placeholder="Answer (e.g. Girls aged 12+ can join group trips with mothers/guardians. Boys are strictly not allowed on group packages.)"
                    value={newAnswer}
                    onChange={e => setNewAnswer(e.target.value)}
                    className="w-full rounded-xl border border-[#F1D9D0] px-4 py-2.5 text-xs bg-white outline-none focus:border-[#FF4A7D] resize-y shadow-sm"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  {editingQaId !== null && (
                    <button
                      type="button"
                      onClick={handleCancelEditQa}
                      className="rounded-full bg-gray-150 text-gray-700 hover:bg-gray-200 px-5 py-2 text-xs font-extrabold transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddQa}
                    disabled={!newQuestion.trim() || !newAnswer.trim()}
                    className="rounded-full bg-[#FF4A7D] hover:bg-[#E63E6E] disabled:bg-gray-300 text-white px-6 py-2 text-xs font-extrabold transition-all flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingQaId !== null ? "Update Card" : "Add Training Card"}</span>
                  </button>
                </div>
              </div>

              {/* Cards Search and List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-2">
                  <label className="text-[11px] font-bold text-[#13253D]/70 uppercase tracking-wide">
                    Trained Q&A List
                  </label>
                  
                  {/* QA Search bar */}
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#3D4A5E]/40" />
                    <input
                      type="text"
                      placeholder="Search trained cards..."
                      value={qaSearchQuery}
                      onChange={e => setQaSearchQuery(e.target.value)}
                      className="w-full rounded-full border border-[#F1D9D0] pl-8 pr-3 py-1.5 text-[10px] outline-none focus:border-[#FF4A7D] shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredQaPairs.length > 0 ? (
                    filteredQaPairs.map(qa => (
                      <div key={qa.id} className="rounded-xl border border-gray-200 bg-[#FFF8F0]/20 p-4 flex justify-between gap-4 hover:border-[#F1D9D0] hover:bg-white transition-all shadow-xs">
                        <div className="space-y-1.5">
                          <div className="text-xs font-extrabold text-[#13253D] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#FF4A7D] shrink-0" />
                            <span>Q: {qa.question}</span>
                          </div>
                          <div className="text-[11px] text-gray-600 leading-normal pl-4 border-l border-[#F1D9D0]/50 ml-1">
                            A: {qa.answer}
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditQa(qa)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#FFF0F4]/40 hover:bg-[#FFF0F4] text-[#FF4A7D] transition-all text-[10px] font-bold shadow-2xs"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQa(qa.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all"
                            title="Delete Card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
                      {qaSearchQuery ? "No matching trained QA cards found." : "No custom QA cards trained yet. Add details above."}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Tab 4: Recent User Chats (Logs) */}
          {activeTab === "logs" && (
            <div className="rounded-2xl border border-[#F1D9D0] bg-white p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
              
              <div className="flex justify-between items-center border-b border-[#F1D9D0]/60 pb-3">
                <h3 className="font-bold text-base text-[#13253D] flex items-center gap-2">
                  <History className="w-5 h-5 text-[#FF4A7D]" />
                  <span>Recent User Chats & History logs</span>
                </h3>
                {chatLogs.length > 0 && (
                  <button
                    onClick={handleClearLogs}
                    className="text-[10px] bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 font-extrabold px-3 py-1.5 rounded-full transition-all"
                  >
                    Clear All Logs
                  </button>
                )}
              </div>

              {/* Logs Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#3D4A5E]/40" />
                <input
                  type="text"
                  placeholder="Search user logs by content pathname, conversation ID, or chat text..."
                  value={logsSearchQuery}
                  onChange={e => setLogsSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#F1D9D0] pl-10 pr-4 py-2.5 text-xs outline-none focus:border-[#FF4A7D] shadow-inner"
                />
              </div>

              {/* Logs List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {isLoadingLogs ? (
                  <div className="text-center py-10 flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#FF4A7D]" />
                    <span>Loading logs from filesystem...</span>
                  </div>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map(log => {
                    const latestMsg = log.messages[log.messages.length - 1];
                    const rawTime = new Date(log.updatedAt);
                    const formattedTime = rawTime.toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                    });
                    
                    return (
                      <div 
                        key={log.id} 
                        className="rounded-xl border border-gray-100 bg-[#FFF8F0]/10 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 hover:border-[#FF4A7D]/30 hover:bg-white transition-all shadow-xs"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] bg-[#13253D] text-white font-extrabold px-2 py-0.5 rounded">
                              {log.role === "customer" ? "💬 CUSTOMER" : "🛠️ ADMIN"}
                            </span>
                            {log.context?.pathname && (
                              <span className="text-[10px] bg-[#FFF0F4] border border-[#FF4A7D]/10 text-[#FF4A7D] font-extrabold px-2.5 py-0.5 rounded-full truncate max-w-xs">
                                {log.context.pathname}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3" />
                              {formattedTime}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-600 truncate font-medium">
                            <strong className="text-[#13253D]">Last Msg:</strong> {latestMsg?.content || "No messages"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                          <span className="text-[10px] font-mono text-gray-400 font-extrabold bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                            {log.messageCount} msg
                          </span>
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="rounded-full bg-[#13253D] hover:bg-[#FF4A7D] text-white px-4 py-1.5 text-[11px] font-extrabold transition-all shadow-2xs hover:shadow-xs active:scale-95"
                          >
                            Inspect Log
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl text-xs text-gray-400 flex flex-col items-center justify-center gap-2 bg-[#FFF8F0]/10">
                    <MessageSquare className="w-8 h-8 text-gray-300" />
                    <span>
                      {logsSearchQuery ? "No conversations fit your filter constraints." : "No customer chats logged yet. Interactions on the site are saved automatically."}
                    </span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tab 5: AI Analytics */}
          {activeTab === "analytics" && (
            <div className="rounded-2xl border border-[#F1D9D0] bg-white p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
              
              <div className="flex justify-between items-center border-b border-[#F1D9D0]/60 pb-3">
                <h3 className="font-bold text-base text-[#13253D] flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-[#FF4A7D]" />
                  <span>NaariAI Assistant usage Analytics</span>
                </h3>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#FF4A7D] bg-[#FFF0F4] px-2.5 py-1 rounded-md border border-[#FF4A7D]/10">
                  REAL-TIME STATS
                </span>
              </div>

              {/* Analytics Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { title: "Total Chats Logged", val: chatLogs.length, icon: History, sub: "Dynamic conversations", color: "bg-[#FFF0F4] text-[#FF4A7D]" },
                  { title: "User Messages", val: totalUserMessagesCount, icon: MessageSquare, sub: `Avg ${avgMessagesPerChat} per chat`, color: "bg-orange-50 text-[#FF8A2B]" },
                  { title: "Avg Response Time", val: "1.2s", icon: Clock, sub: "NVIDIA NIM streaming", color: "bg-blue-50 text-blue-600" },
                  { title: "API Success Rate", val: "99.8%", icon: Activity, sub: "Active failover ready", color: "bg-green-50 text-green-600" }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="border border-gray-200/80 rounded-2xl p-4 shadow-2xs bg-white hover:shadow-xs transition-all">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block truncate">{item.title}</span>
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-xl font-black text-[#13253D] mt-2 leading-none">{item.val}</div>
                      <div className="text-[10px] text-gray-400 mt-1 truncate font-medium">{item.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Progress/Ratio Bar Chart Representation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                
                {/* Tone Personality Breakdown */}
                <div className="border border-gray-200/80 rounded-2xl p-4 bg-white space-y-4">
                  <h4 className="text-xs font-black text-[#13253D] uppercase tracking-wide flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#FF4A7D]" />
                    <span>Tone Config Distribution</span>
                  </h4>
                  <div className="space-y-3">
                    {[
                      { name: "Friendly & Warm", active: settings.personaTone === "warm", barVal: "100%", percentage: settings.personaTone === "warm" ? 100 : 0 },
                      { name: "Concise & Factual", active: settings.personaTone === "professional", barVal: "100%", percentage: settings.personaTone === "professional" ? 100 : 0 },
                      { name: "Enthusiastic & Bold", active: settings.personaTone === "adventurous", barVal: "100%", percentage: settings.personaTone === "adventurous" ? 100 : 0 }
                    ].map((t, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className={t.active ? "text-[#FF4A7D] font-bold" : "text-[#3D4A5E]"}>{t.name}</span>
                          <span className={t.active ? "text-[#FF4A7D] font-bold" : "text-gray-400"}>
                            {t.active ? "Active Tone (100%)" : "Inactive (0%)"}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              t.active ? "bg-[#FF4A7D]" : "bg-gray-200"
                            }`} 
                            style={{ width: `${t.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Database Injections Ratios */}
                <div className="border border-gray-200/80 rounded-2xl p-4 bg-white space-y-4">
                  <h4 className="text-xs font-black text-[#13253D] uppercase tracking-wide flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#FF8A2B]" />
                    <span>Inject Context Weights</span>
                  </h4>
                  <div className="space-y-3">
                    {[
                      { name: "Trips Context", active: settings.includeTrips !== false, items: dbCounts.trips, max: 20 },
                      { name: "Departures Context", active: settings.includeDepartures !== false, items: dbCounts.departures, max: 30 },
                      { name: "FAQs Context", active: settings.includeFaqs !== false, items: dbCounts.faqs, max: 25 },
                      { name: "Policies Context", active: settings.includePolicies !== false, items: dbCounts.policies, max: 10 }
                    ].map((c, idx) => {
                      const perc = c.active ? Math.min(100, Math.round((c.items / c.max) * 100)) : 0;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span className={c.active ? "text-[#13253D]" : "text-gray-400 font-medium"}>
                              {c.name} {c.active ? `(${c.items} items)` : "(Disabled)"}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400">
                              {c.active ? `${perc}% weight` : "0%"}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                c.active ? "bg-[#FF8A2B]" : "bg-gray-200"
                              }`} 
                              style={{ width: `${perc}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Safety & Grounding Health Card */}
              <div className="p-4 bg-green-50 border border-green-200/50 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-green-800">Grounding Guardrails Active</h4>
                  <p className="text-[11px] text-green-700 leading-normal font-medium">
                    Strict destination limits and mathematical budget filtering rules are hardcoded in the system instructions template. The AI chatbot will automatically reject off-topic questions, explain cancellation refund schedules precisely, and mathematically double-check package prices matching user budgets.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Column (5/12) - Sandbox Testing Drawer */}
        <div className="lg:col-span-5 flex flex-col h-full min-h-[660px]">
          <div className="rounded-2xl border border-[#F1D9D0] bg-[#FFF8F0]/40 p-5 flex flex-col flex-1 h-full shadow-sm space-y-4">
            
            {/* Sandbox Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#F1D9D0]/70 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0F4] text-[#FF4A7D] flex items-center justify-center">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#13253D] leading-none flex items-center gap-1">
                    Live Sandbox Preview
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse border-2 border-white" />
                  </h3>
                  <span className="text-[10px] text-[#3D4A5E]/75 mt-0.5 block">
                    Tests unsaved parameters in real time
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={resetSandbox}
                title="Reset Chat history"
                className="px-3 py-1.5 rounded-xl hover:bg-[#F1D9D0]/70 text-[#3D4A5E] hover:text-[#13253D] transition-all flex items-center gap-1 text-[11px] font-bold border border-transparent hover:border-[#F1D9D0]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Sandbox Message list view */}
            <div className="flex-1 overflow-y-auto min-h-[380px] max-h-[480px] p-3 space-y-3 bg-white/80 border border-[#F1D9D0]/40 rounded-2xl shadow-inner scrollbar-thin flex flex-col justify-start">
              {testMessages.map((m, idx) => {
                if (m.role === "system") {
                  return (
                    <div key={idx} className="flex gap-2.5 p-3.5 bg-[#FFF0F4] border border-[#FF4A7D]/10 rounded-xl text-[10.5px] leading-relaxed text-[#FF4A7D] font-bold items-start">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{m.content}</span>
                    </div>
                  );
                }

                const isUser = m.role === "user";
                return (
                  <div key={idx} className={`flex ${isUser ? "justify-end animate-in slide-in-from-right-2" : "justify-start animate-in slide-in-from-left-2"} duration-200`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                      isUser 
                        ? "bg-[#13253D] text-white rounded-tr-none font-semibold" 
                        : "bg-[#FFF0F4]/90 border border-[#FF4A7D]/10 text-[#13253D] rounded-tl-none font-medium"
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                    </div>
                  </div>
                );
              })}
              
              {isTestLoading && (
                <div className="flex justify-start items-center gap-2 text-[10.5px] text-[#FF4A7D] font-black animate-pulse p-2 bg-[#FFF0F4]/30 border border-[#FF4A7D]/5 rounded-xl self-start">
                  <div className="flex gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A7D] animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A7D] animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A7D] animate-bounce delay-300" />
                  </div>
                  <span>Connecting Nvidia NIM...</span>
                </div>
              )}
            </div>

            {/* Sandbox Testing Shortcuts / Presets */}
            {!isTestLoading && !isTestTyping && testMessages.length < 5 && (
              <div className="space-y-1.5 shrink-0 bg-white/40 border border-[#F1D9D0]/30 rounded-xl p-3">
                <span className="text-[9px] font-extrabold uppercase text-gray-500 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FF4A7D]" />
                  <span>Click to Test Prompts:</span>
                </span>
                <div className="flex flex-col gap-1.5">
                  {testPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendTest(preset.text)}
                      className="text-[10px] text-[#13253D] hover:text-[#FF4A7D] bg-white hover:bg-[#FFF0F4] border border-[#F1D9D0]/60 hover:border-[#FF4A7D]/30 px-3 py-1.5 rounded-lg text-left transition-all font-semibold flex items-center justify-between"
                    >
                      <span>{preset.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#FF4A7D]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sandbox Input Form */}
            <form onSubmit={e => { e.preventDefault(); handleSendTest(); }} className="flex gap-2 shrink-0">
              <input
                type="text"
                value={testInput}
                onChange={e => setTestInput(e.target.value)}
                placeholder="Ask NaariAI anything..."
                disabled={isTestLoading || isTestTyping}
                className="flex-1 rounded-full border border-[#F1D9D0] bg-white px-4 py-3 text-xs outline-none focus:border-[#FF4A7D] disabled:opacity-60 transition-all font-medium"
              />
              <button
                type="submit"
                disabled={isTestLoading || isTestTyping || !testInput.trim()}
                className="w-10 h-10 rounded-full bg-[#FF4A7D] hover:bg-[#E63E6E] disabled:bg-gray-300 text-white grid place-items-center transition-all shrink-0 shadow-md active:scale-95"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* INSPECT LOG DRAWER MODAL OVERLAY */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          
          {/* Modal Drawer content */}
          <div 
            className="w-full sm:w-[500px] h-full bg-[#FFF8F0] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 relative border-l border-[#F1D9D0]"
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#13253D] to-[#203D64] text-white flex items-center justify-between shadow-md shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-[#FF4A7D] text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                    Inspect Log
                  </span>
                  <span className="text-xs text-white/80 font-mono font-bold truncate max-w-[150px]">
                    ID: {selectedLog.id}
                  </span>
                </div>
                <h3 className="font-bold text-xs leading-none mt-1">
                  User conversation on {selectedLog.context?.pathname || "/"}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-white/80 hover:text-white rounded-lg p-2 hover:bg-white/10 transition-all text-xs font-bold"
              >
                Close
              </button>
            </div>

            {/* Modal Body / Chat dialogs */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white/40">
              {selectedLog.messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[90%] space-y-1">
                      <div className={`text-[9px] font-extrabold text-gray-400 block ${isUser ? "text-right" : "text-left"}`}>
                        {isUser ? "🙋‍♀️ SITE VISITOR" : "🌸 NaariAI"}
                      </div>
                      
                      <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                        isUser 
                          ? "bg-[#13253D] text-white rounded-tr-none font-semibold" 
                          : "bg-white border border-[#F1D9D0] text-[#13253D] rounded-tl-none font-medium"
                      }`}>
                        <div className="whitespace-pre-line leading-relaxed">{m.content}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-[#F1D9D0]/60 shrink-0 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                End of Conversation Log
              </span>
            </div>
            
          </div>

          {/* Clicking remaining backdrop closes modal */}
          <div className="absolute inset-0 z-[-1]" onClick={() => setSelectedLog(null)} />
        </div>
      )}

    </div>
  );
}
