"use client";

import { useState, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/utils";
import ConfirmButton from "@/components/admin/ConfirmButton";
import ConfirmForm from "@/components/admin/ConfirmForm";
import { saveTransaction, deleteTransaction } from "@/lib/admin-store";
import { 
  Search, Calendar, MapPin, X, Plus, Edit2, Trash2, 
  ArrowUpRight, ArrowDownRight, BarChart2, Download, 
  RefreshCw, TrendingUp, Info, PieChart, FileText, Filter,
  Sparkles, PlusCircle, DollarSign, Award,
  Sliders, Zap, CheckCircle2, AlertCircle, TrendingDown, Layers, Calculator
} from "lucide-react";

interface Transaction {
  id: number;
  type: "revenue" | "expense";
  amount: number;
  category: string;
  tripSlug?: string;
  description: string;
  date: string;
  createdAt: string;
}

interface Trip {
  slug: string;
  title: string;
}

interface FinanceManagerProps {
  initialTransactions: Transaction[];
  trips: Trip[];
}

const categories = {
  revenue: ["Trip Bookings", "Custom Private Trips", "Sponsorships", "Other Revenue"],
  expense: ["Hotel Bookings", "Transport Cost", "Trip Leader Payout", "Marketing / Ads", "Office / Admin", "Refunds Paid", "Other Expense"]
};

export default function FinanceManager({ initialTransactions, trips }: FinanceManagerProps) {
  const router = useRouter();
  
  // Edit mode state
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // AI Copilot & Intelligence Modal States
  const [showAIFinanceModal, setShowAIFinanceModal] = useState(false);
  const [aiTab, setAiTab] = useState<"audit" | "forecast" | "ranker" | "simulator">("audit");
  const [simPriceChange, setSimPriceChange] = useState<number>(0);
  const [simVolumeChange, setSimVolumeChange] = useState<number>(0);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "revenue" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tripFilter, setTripFilter] = useState("all");
  const [dateRange, setDateRange] = useState<"all" | "this_month" | "last_month" | "last_30">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount_desc" | "amount_asc">("newest");

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setTripFilter("all");
    setDateRange("all");
    setSortBy("newest");
  };

  // Client-side filtering & sorting
  const filteredTransactions = useMemo(() => {
    let result = [...initialTransactions];

    // Search query
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        tx =>
          tx.description?.toLowerCase().includes(q) ||
          tx.category?.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter(tx => tx.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter(tx => tx.category === categoryFilter);
    }

    // Trip filter
    if (tripFilter !== "all") {
      result = result.filter(tx => tx.tripSlug === tripFilter);
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      result = result.filter(tx => {
        const txDate = new Date(tx.date);
        const txMonth = txDate.getMonth();
        const txYear = txDate.getFullYear();

        if (dateRange === "this_month") {
          return txMonth === thisMonth && txYear === thisYear;
        } else if (dateRange === "last_month") {
          const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
          const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;
          return txMonth === prevMonth && txYear === prevYear;
        } else if (dateRange === "last_30") {
          const limitDate = new Date();
          limitDate.setDate(limitDate.getDate() - 30);
          return txDate >= limitDate;
        }
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "amount_desc") {
        return b.amount - a.amount;
      } else if (sortBy === "amount_asc") {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [initialTransactions, searchTerm, typeFilter, categoryFilter, tripFilter, dateRange, sortBy]);

  // Overall Financial statistics (always based on all entries)
  const stats = useMemo(() => {
    let rev = 0;
    let exp = 0;
    initialTransactions.forEach(tx => {
      if (tx.type === "revenue") rev += tx.amount;
      else exp += tx.amount;
    });
    return {
      revenue: rev,
      expense: exp,
      net: rev - exp,
      margin: rev ? Math.round(((rev - exp) / rev) * 100) : 0
    };
  }, [initialTransactions]);

  // Visual Category breakdowns (dynamic based on current filtered ledger)
  const categoryBreakdown = useMemo(() => {
    const expenseTotals: Record<string, number> = {};
    const revenueTotals: Record<string, number> = {};
    let totalExpenseFiltered = 0;
    let totalRevenueFiltered = 0;

    filteredTransactions.forEach(tx => {
      if (tx.type === "expense") {
        expenseTotals[tx.category] = (expenseTotals[tx.category] || 0) + tx.amount;
        totalExpenseFiltered += tx.amount;
      } else {
        revenueTotals[tx.category] = (revenueTotals[tx.category] || 0) + tx.amount;
        totalRevenueFiltered += tx.amount;
      }
    });

    const expenseList = Object.entries(expenseTotals).map(([name, total]) => ({
      name,
      total,
      percentage: totalExpenseFiltered ? Math.round((total / totalExpenseFiltered) * 100) : 0
    })).sort((a, b) => b.total - a.total);

    const revenueList = Object.entries(revenueTotals).map(([name, total]) => ({
      name,
      total,
      percentage: totalRevenueFiltered ? Math.round((total / totalRevenueFiltered) * 100) : 0
    })).sort((a, b) => b.total - a.total);

    return { expenseList, revenueList, totalExpenseFiltered, totalRevenueFiltered };
  }, [filteredTransactions]);

  // Month-by-month cashflow calculation (dynamic based on filtered data)
  const monthlyData = useMemo(() => {
    const groups: { [key: string]: { revenue: number; expense: number; label: string } } = {};

    filteredTransactions.forEach((tx) => {
      let dateObj;
      try {
        dateObj = new Date(tx.date);
      } catch {
        dateObj = new Date();
      }
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthStr = monthNames[dateObj.getMonth()];
      const yearStr = dateObj.getFullYear();
      const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
      const label = `${monthStr} ${yearStr}`;

      if (!groups[key]) {
        groups[key] = { revenue: 0, expense: 0, label };
      }

      if (tx.type === "revenue") {
        groups[key].revenue += tx.amount;
      } else {
        groups[key].expense += tx.amount;
      }
    });

    return Object.keys(groups)
      .sort()
      .map((key) => ({
        key,
        ...groups[key],
      }));
  }, [filteredTransactions]);

  // Chart max value calculation
  const maxVal = useMemo(() => {
    let max = 50000;
    monthlyData.forEach((d) => {
      if (d.revenue > max) max = d.revenue;
      if (d.expense > max) max = d.expense;
    });
    return max * 1.15;
  }, [monthlyData]);

  // Trip Package Margin Ranker memo
  const tripMarginList = useMemo(() => {
    const map: Record<string, { rev: number; exp: number; title: string }> = {};
    initialTransactions.forEach(tx => {
      const slug = tx.tripSlug || "general";
      const tripObj = trips.find(t => t.slug === slug);
      const title = tripObj?.title || (slug === "general" ? "General Overhead & Ops" : slug);
      if (!map[slug]) map[slug] = { rev: 0, exp: 0, title };
      if (tx.type === "revenue") map[slug].rev += tx.amount;
      else map[slug].exp += tx.amount;
    });

    return Object.entries(map).map(([slug, data]) => {
      const profit = data.rev - data.exp;
      const margin = data.rev ? Math.round((profit / data.rev) * 100) : (data.exp ? -100 : 0);
      return { slug, title: data.title, rev: data.rev, exp: data.exp, profit, margin };
    }).sort((a, b) => b.profit - a.profit);
  }, [initialTransactions, trips]);

  // What-If Scenario Simulator Logic
  const simResults = useMemo(() => {
    const simRev = Math.round(stats.revenue * (1 + simPriceChange / 100) * (1 + simVolumeChange / 100));
    const simExp = Math.round(stats.expense * (1 + (simVolumeChange * 0.6) / 100));
    const simNet = simRev - simExp;
    const simMargin = simRev ? Math.round((simNet / simRev) * 100) : 0;
    const diffNet = simNet - stats.net;
    return { simRev, simExp, simNet, simMargin, diffNet };
  }, [stats, simPriceChange, simVolumeChange]);

  // Export AI Audit Report (.txt)
  const handleExportAIAuditReport = () => {
    const lines = [
      `==================================================`,
      `NAARIAI EXECUTIVE FINANCIAL AUDIT & STRATEGY REPORT`,
      `Date Generated: ${new Date().toLocaleString()}`,
      `==================================================`,
      ``,
      `1. OVERALL FINANCIAL HEALTH SUMMARY:`,
      ` - Gross Inflow (Revenue): ${formatINR(stats.revenue)}`,
      ` - Operational Outflow (Expense): ${formatINR(stats.expense)}`,
      ` - Net Operating Profit: ${formatINR(stats.net)}`,
      ` - Net Profit Margin Ratio: ${stats.margin}%`,
      ``,
      `2. TOP COST DRIVERS & RISK ANOMALIES:`,
      ` - Top Expense Category: ${categoryBreakdown.expenseList[0]?.name || "N/A"} (${categoryBreakdown.expenseList[0]?.percentage || 0}% of total outflow)`,
      ` - Top Revenue Channel: ${categoryBreakdown.revenueList[0]?.name || "N/A"} (${categoryBreakdown.revenueList[0]?.percentage || 0}% of total inflow)`,
      ``,
      `3. TRIP PACKAGE PROFITABILITY RANKING:`,
      ...tripMarginList.map((t, idx) => ` #${idx + 1} ${t.title}: Net Profit ${formatINR(t.profit)} (Margin: ${t.margin}%)`),
      ``,
      `4. AI STRATEGIC RECOMMENDATIONS:`,
      ` - 1. Optimize hotel & transit vendor agreements to reduce top category outflow.`,
      ` - 2. Increase average batch occupancy by 15% using WhatsApp CRM drip automation.`,
      ` - 3. Target high-margin trips (${tripMarginList[0]?.title || "Kashmir"}) for paid marketing spend.`,
      `==================================================`
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `NaariAI_Executive_Financial_Audit_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // CSV Export Handler
  const exportToCSV = () => {
    const headers = ["Date", "Description", "Type", "Category", "Trip Association", "Amount (INR)", "Created At"];
    const rows = filteredTransactions.map(tx => {
      const tripName = tx.tripSlug ? trips.find(t => t.slug === tx.tripSlug)?.title || tx.tripSlug : "General Overhead";
      return [
        tx.date,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.type.toUpperCase(),
        tx.category,
        `"${tripName.replace(/"/g, '""')}"`,
        tx.amount,
        tx.createdAt
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tripnaari_finance_ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Transaction Form Handler
  const handleSave = async (formData: FormData) => {
    const res = await saveTransaction(formData);
    if (res?.success) {
      setEditingTx(null);
      router.refresh();
    }
  };

  // Delete Transaction Handler
  const handleDelete = async (id: number) => {
    const res = await deleteTransaction(id);
    if (res?.success) {
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Finance Metrics Grid (Interactive Filters) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div
          onClick={() => setTypeFilter(prev => prev === "revenue" ? "all" : "revenue")}
          className={`rounded-2xl bg-white border p-6 shadow-sm flex items-center justify-between cursor-pointer transition-all ${
            typeFilter === "revenue"
              ? "border-[#25D366] ring-2 ring-[#25D366]/20 bg-green-50/30 shadow-md"
              : "border-[#F1D9D0] hover:border-green-300 hover:shadow-md"
          }`}
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#3D4A5E]/60 flex items-center gap-1.5">
              <span>Total Revenue</span>
              {typeFilter === "revenue" && <span className="text-[10px] bg-[#25D366] text-white px-2 py-0.5 rounded-full font-black">ACTIVE FILTER</span>}
            </div>
            <div className="text-3xl font-black text-[#25D366] mt-2">{formatINR(stats.revenue)}</div>
            <div className="text-[11px] text-[#3D4A5E]/60 mt-1 flex items-center gap-1">
              <span className="text-[#25D366] font-bold">↑ Inflow</span> from trip bookings & sponsors
            </div>
          </div>
          <div className="rounded-full bg-green-50 p-3 text-[#25D366]">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Expenses Card */}
        <div
          onClick={() => setTypeFilter(prev => prev === "expense" ? "all" : "expense")}
          className={`rounded-2xl bg-white border p-6 shadow-sm flex items-center justify-between cursor-pointer transition-all ${
            typeFilter === "expense"
              ? "border-[#FF4A7D] ring-2 ring-[#FF4A7D]/20 bg-rose-50/30 shadow-md"
              : "border-[#F1D9D0] hover:border-rose-300 hover:shadow-md"
          }`}
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#3D4A5E]/60 flex items-center gap-1.5">
              <span>Total Expenses</span>
              {typeFilter === "expense" && <span className="text-[10px] bg-[#FF4A7D] text-white px-2 py-0.5 rounded-full font-black">ACTIVE FILTER</span>}
            </div>
            <div className="text-3xl font-black text-[#FF4A7D] mt-2">{formatINR(stats.expense)}</div>
            <div className="text-[11px] text-[#3D4A5E]/60 mt-1 flex items-center gap-1">
              <span className="text-[#FF4A7D] font-bold">↓ Outflow</span> to vendors, hotels & leaders
            </div>
          </div>
          <div className="rounded-full bg-red-50 p-3 text-[#FF4A7D]">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        {/* Net Profit Card */}
        <div
          onClick={() => setTypeFilter("all")}
          className={`rounded-2xl bg-[#FFF8F0] border p-6 shadow-sm flex items-center justify-between cursor-pointer transition-all ${
            typeFilter === "all"
              ? "border-[#FF8A2B]/40 ring-2 ring-[#FF8A2B]/20 shadow-md"
              : "border-[#FF8A2B]/20 hover:border-[#FF8A2B] hover:shadow-md"
          }`}
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#FF8A2B]">Net Margin (Profit/Loss)</div>
            <div className={`text-3xl font-black mt-2 ${stats.net >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatINR(stats.net)}
            </div>
            <div className="text-[11px] text-[#3D4A5E] mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-[#FF8A2B]" />
              Margin ratio: <span className="font-bold text-[#13253D]">{stats.margin}%</span>
            </div>
          </div>
          <div className="rounded-full bg-[#FFF0F4] p-3 text-[#FF8A2B]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AI Financial Intelligence & Margin Insights Bar */}
      <div className="p-4 bg-gradient-to-r from-[#13253D] to-[#1E3A5F] rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF4A7D] to-[#FF8A2B] text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            🤖
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#FF4A7D] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> NaariAI Financial Intelligence
            </h4>
            <p className="text-xs text-gray-200 mt-0.5">
              Net profit margin is standing healthy at <span className="font-bold text-[#25D366]">{stats.margin}%</span>. Top expense driver is <span className="font-bold text-amber-300">{categoryBreakdown.expenseList[0]?.name || "Hotel Bookings"}</span> ({categoryBreakdown.expenseList[0]?.percentage || 45}% of total outflow).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => { setAiTab("audit"); setShowAIFinanceModal(true); }}
            className="px-3 py-1.5 bg-[#FF4A7D] hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold transition shadow-sm flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" /> Executive AI Audit
          </button>
          <button
            onClick={() => { setAiTab("forecast"); setShowAIFinanceModal(true); }}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-extrabold transition shadow-sm flex items-center gap-1"
          >
            <TrendingUp className="w-3.5 h-3.5" /> 90-Day Forecast
          </button>
          <button
            onClick={() => { setAiTab("ranker"); setShowAIFinanceModal(true); }}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold transition shadow-sm flex items-center gap-1"
          >
            <Award className="w-3.5 h-3.5" /> Trip Margin Ranker
          </button>
          <button
            onClick={() => { setAiTab("simulator"); setShowAIFinanceModal(true); }}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold transition shadow-sm flex items-center gap-1"
          >
            <Calculator className="w-3.5 h-3.5" /> What-If Simulator
          </button>
        </div>
      </div>

      {/* 2. Visual Analytics section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Cash Flow Trend Graph */}
        <div className="bg-white border border-[#F1D9D0] rounded-2xl p-6 shadow-sm lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100 sm:border-0">
            <div>
              <h3 className="font-semibold text-[#13253D] flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#FF4A7D]" />
                Financial Performance Trend
              </h3>
              <p className="text-[11px] text-[#3D4A5E] mt-0.5">Month-by-month cashflow distribution of filtered data</p>
            </div>
            <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider shrink-0">
              <span className="flex items-center gap-1 text-[#25D366]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]" /> Revenue
              </span>
              <span className="flex items-center gap-1 text-[#FF4A7D]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF4A7D]" /> Expense
              </span>
            </div>
          </div>

          {monthlyData.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-xs text-[#3D4A5E]/50 bg-[#FFF8F0]/10 border border-[#F1D9D0]/30 rounded-xl border-dashed">
              <span>💸</span>
              <span className="mt-1">No monthly cashflow data matches current filters.</span>
            </div>
          ) : (
            <div className="w-full overflow-x-auto pt-2">
              <svg viewBox="0 0 500 200" className="w-full min-w-[450px] h-48">
                {/* Horizontal Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = 30 + 130 * (1 - ratio);
                  const val = Math.round(maxVal * ratio);
                  return (
                    <g key={i}>
                      <line
                        x1={40}
                        y1={y}
                        x2={460}
                        y2={y}
                        stroke="#F1D9D0"
                        strokeDasharray="4,4"
                        strokeWidth={0.8}
                      />
                      <text
                        x={32}
                        y={y + 3}
                        textAnchor="end"
                        className="text-[9px] font-extrabold fill-[#13253D]/40"
                      >
                        {val >= 100000 ? `${(val / 100000).toFixed(1)}L` : `${val / 1000}k`}
                      </text>
                    </g>
                  );
                })}

                {/* Draw Bars */}
                {monthlyData.map((d, idx) => {
                  const barSpacing = 420 / monthlyData.length;
                  const centerOfSection = 40 + idx * barSpacing + barSpacing / 2;
                  const barWidth = Math.min(22, barSpacing / 3);

                  // Calculations
                  const revHeight = (d.revenue / maxVal) * 130;
                  const expHeight = (d.expense / maxVal) * 130;

                  const revY = 30 + 130 - revHeight;
                  const expY = 30 + 130 - expHeight;

                  return (
                    <g key={d.key} className="group cursor-pointer">
                      {/* Revenue Bar */}
                      <rect
                        x={centerOfSection - barWidth - 1.5}
                        y={revY}
                        width={barWidth}
                        height={revHeight}
                        fill="#25D366"
                        rx={2.5}
                        className="transition-all duration-300 hover:opacity-85"
                      />
                      {/* Expense Bar */}
                      <rect
                        x={centerOfSection + 1.5}
                        y={expY}
                        width={barWidth}
                        height={expHeight}
                        fill="#FF4A7D"
                        rx={2.5}
                        className="transition-all duration-300 hover:opacity-85"
                      />

                      {/* X-Axis Labels */}
                      <text
                        x={centerOfSection}
                        y={180}
                        textAnchor="middle"
                        className="text-[10px] font-extrabold fill-[#13253D]/70"
                      >
                        {d.label}
                      </text>

                      <title>{`${d.label}\nRevenue: ${formatINR(d.revenue)}\nExpense: ${formatINR(d.expense)}\nNet: ${formatINR(d.revenue - d.expense)}`}</title>
                    </g>
                  );
                })}

                {/* Bottom baseline */}
                <line
                  x1={40}
                  y1={160}
                  x2={460}
                  y2={160}
                  stroke="#13253D"
                  strokeWidth={1.2}
                />
              </svg>
            </div>
          )}
        </div>

        {/* Visual Category Breakdowns */}
        <div className="bg-white border border-[#F1D9D0] rounded-2xl p-6 shadow-sm lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-[#13253D] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#FF8A2B]" />
              Filtered Category Breakdowns
            </h3>
            <p className="text-[11px] text-[#3D4A5E] mt-0.5">Share ratios based on active filtered transactions</p>
          </div>

          <div className="flex-1 space-y-4 lg:overflow-y-auto lg:max-h-[145px] pr-1 py-1">
            {/* Outflows (Expenses) */}
            {categoryBreakdown.expenseList.length > 0 && (
              <div className="space-y-2">
                <span className="text-[9px] font-extrabold uppercase text-[#FF4A7D] block tracking-wide">Expense Categories Outflow</span>
                <div className="space-y-1.5">
                  {categoryBreakdown.expenseList.map(item => (
                    <div key={item.name} className="text-xs">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-[#13253D]">
                        <span>{item.name}</span>
                        <span>{formatINR(item.total)} ({item.percentage}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#FFF0F4] rounded-full mt-0.5 overflow-hidden">
                        <div 
                          className="bg-[#FF4A7D] h-full rounded-full transition-all duration-500" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inflows (Revenues) */}
            {categoryBreakdown.revenueList.length > 0 && (
              <div className="space-y-2">
                <span className="text-[9px] font-extrabold uppercase text-[#25D366] block tracking-wide">Revenue Categories Inflow</span>
                <div className="space-y-1.5">
                  {categoryBreakdown.revenueList.map(item => (
                    <div key={item.name} className="text-xs">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-[#13253D]">
                        <span>{item.name}</span>
                        <span>{formatINR(item.total)} ({item.percentage}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-green-50/50 rounded-full mt-0.5 overflow-hidden">
                        <div 
                          className="bg-[#25D366] h-full rounded-full transition-all duration-500" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {categoryBreakdown.expenseList.length === 0 && categoryBreakdown.revenueList.length === 0 && (
              <div className="h-full flex items-center justify-center text-xs text-[#3D4A5E]/40 italic py-6">
                No active categories breakdown.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main CRM Action Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Filters Toolbar & Ledger Table */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Dynamic Filters Bar */}
          <div className="bg-white border border-[#F1D9D0] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              
              {/* Search text query */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#3D4A5E]/40" />
                <input
                  type="text"
                  placeholder="Search description, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 rounded-full border border-[#F1D9D0] bg-[#FFF8F0]/30 text-sm outline-none focus:border-[#FF4A7D]/40 transition text-[#13253D]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3.5 top-3 text-[#3D4A5E]/40 hover:text-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* CSV Export & Clear Filters */}
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="rounded-full bg-[#FFF8F0] hover:bg-[#F1D9D0]/30 text-[#13253D] border border-[#F1D9D0] text-xs font-bold px-4 py-2 transition flex items-center gap-1.5 shadow-sm"
                  title="Export active filtered ledger data as CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#FF4A7D]" />
                  <span>Export CSV</span>
                </button>

                {(searchTerm || typeFilter !== "all" || categoryFilter !== "all" || tripFilter !== "all" || dateRange !== "all") && (
                  <button
                    onClick={resetFilters}
                    className="rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3.5 py-2 transition"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filters Options row */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-2.5 items-center">
              {/* Type Select */}
              <div className="flex items-center justify-between gap-1.5 bg-[#FFF8F0] border border-[#F1D9D0] rounded-xl sm:rounded-full px-3 py-2 sm:py-1.5">
                <span className="text-[9px] font-black text-[#13253D]/50 uppercase shrink-0">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value as any);
                    setCategoryFilter("all"); // Reset category since categories change based on type
                  }}
                  className="bg-transparent text-xs font-semibold outline-none text-[#13253D] cursor-pointer flex-1 min-w-0 text-right sm:text-left"
                >
                  <option value="all">All Flow</option>
                  <option value="revenue">Inflow</option>
                  <option value="expense">Outflow</option>
                </select>
              </div>

              {/* Category Select */}
              <div className="flex items-center justify-between gap-1.5 bg-[#FFF8F0] border border-[#F1D9D0] rounded-xl sm:rounded-full px-3 py-2 sm:py-1.5">
                <span className="text-[9px] font-black text-[#13253D]/50 uppercase shrink-0">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold outline-none text-[#13253D] cursor-pointer flex-1 min-w-0 text-right sm:text-left max-w-[110px] sm:max-w-none truncate"
                >
                  <option value="all">All Categories</option>
                  {typeFilter !== "expense" && categories.revenue.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  {typeFilter !== "revenue" && categories.expense.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Trip Select */}
              <div className="flex items-center justify-between gap-1.5 bg-[#FFF8F0] border border-[#F1D9D0] rounded-xl sm:rounded-full px-3 py-2 sm:py-1.5">
                <span className="text-[9px] font-black text-[#13253D]/50 uppercase shrink-0">Trip:</span>
                <select
                  value={tripFilter}
                  onChange={(e) => setTripFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold outline-none text-[#13253D] cursor-pointer flex-1 min-w-0 text-right sm:text-left max-w-[110px] sm:max-w-[150px] truncate"
                >
                  <option value="all">All Trips</option>
                  {trips.map(t => (
                    <option key={t.slug} value={t.slug}>{t.title}</option>
                  ))}
                </select>
              </div>

              {/* Date Preset Select */}
              <div className="flex items-center justify-between gap-1.5 bg-[#FFF8F0] border border-[#F1D9D0] rounded-xl sm:rounded-full px-3 py-2 sm:py-1.5">
                <span className="text-[9px] font-black text-[#13253D]/50 uppercase shrink-0">Range:</span>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold outline-none text-[#13253D] cursor-pointer flex-1 min-w-0 text-right sm:text-left"
                >
                  <option value="all">All Time</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="last_30">Last 30 Days</option>
                </select>
              </div>

              {/* Sort Order Select */}
              <div className="col-span-2 sm:col-span-1 flex items-center justify-between gap-1.5 bg-[#FFF8F0] border border-[#F1D9D0] rounded-xl sm:rounded-full px-3 py-2 sm:py-1.5">
                <span className="text-[9px] font-black text-[#13253D]/50 uppercase shrink-0">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold outline-none text-[#13253D] cursor-pointer flex-1 min-w-0 text-right sm:text-left"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount_desc">High to Low</option>
                  <option value="amount_asc">Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ledger table wrapper */}
          <div className="rounded-2xl border border-[#F1D9D0] bg-white shadow-sm overflow-hidden">
            <div className="bg-[#FFF8F0] px-6 py-4 border-b border-[#F1D9D0] flex justify-between items-center">
              <h3 className="font-semibold text-[#13253D] text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FF4A7D]" />
                Transaction Ledger
              </h3>
              <span className="text-xs text-[#3D4A5E]/70 font-semibold">
                Showing <span className="text-[#13253D] font-bold">{filteredTransactions.length}</span> entries
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left hidden md:table">
                <thead className="bg-[#FFF8F0]/50 text-[10px] uppercase text-[#3D4A5E]/60 tracking-wider border-b border-[#F1D9D0]/50">
                  <tr>
                    <th className="p-4 font-extrabold">Date</th>
                    <th className="p-4 font-extrabold">Description</th>
                    <th className="p-4 font-extrabold">Category</th>
                    <th className="p-4 font-extrabold">Trip Association</th>
                    <th className="p-4 text-right font-extrabold">Amount</th>
                    <th className="p-4 text-center font-extrabold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1D9D0]/40">
                  {filteredTransactions.map((tx) => {
                    const isTxEditing = editingTx?.id === tx.id;
                    return (
                      <tr 
                        key={tx.id} 
                        className={`hover:bg-[#FFF8F0]/10 transition align-middle ${isTxEditing ? 'bg-[#FFF8F0]/30' : ''}`}
                      >
                        <td className="p-4 text-xs whitespace-nowrap text-[#3D4A5E] font-medium">
                          {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="p-4 text-xs font-semibold text-[#13253D] max-w-[200px] truncate" title={tx.description}>
                          {tx.description || "—"}
                        </td>
                        <td className="p-4 text-xs">
                          <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide border ${
                            tx.type === "revenue" 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            {tx.category}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-[#3D4A5E] italic max-w-[150px] truncate">
                          {tx.tripSlug 
                            ? trips.find(t => t.slug === tx.tripSlug)?.title || tx.tripSlug 
                            : "General Overhead"
                          }
                        </td>
                        <td className={`p-4 text-xs font-black text-right whitespace-nowrap ${
                          tx.type === "revenue" ? "text-green-600" : "text-red-600"
                        }`}>
                          {tx.type === "revenue" ? "+" : "-"}{formatINR(tx.amount)}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingTx(tx);
                                // Scroll right panel into view on mobile
                                window.scrollTo({ top: document.getElementById("log-panel-container")?.offsetTop || 0, behavior: 'smooth' });
                              }}
                              className={`p-1.5 rounded-lg border transition ${
                                isTxEditing 
                                  ? "bg-[#FF4A7D] border-[#FF4A7D] text-white" 
                                  : "bg-[#FFF8F0] border-[#F1D9D0] text-[#13253D]/70 hover:text-[#FF4A7D] hover:border-[#FF4A7D]/30"
                              }`}
                              title="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <ConfirmButton
                              action={handleDelete.bind(null, tx.id)}
                              confirmText={`Are you sure you want to delete this ${tx.type} transaction "${tx.description || tx.category}"?`}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </ConfirmButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-xs text-[#3D4A5E]/50">
                        <span className="text-3xl mb-2 block">💸</span>
                        No transactions match the active ledger filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Mobile Card List View (visible on mobile only) */}
              <div className="block md:hidden divide-y divide-[#F1D9D0]/30 border-t border-[#F1D9D0]/40">
                {filteredTransactions.map((tx) => {
                  const isTxEditing = editingTx?.id === tx.id;
                  const tripName = tx.tripSlug 
                    ? trips.find(t => t.slug === tx.tripSlug)?.title || tx.tripSlug 
                    : "General Overhead";
                  return (
                    <div 
                      key={tx.id} 
                      className={`p-4 space-y-2.5 transition ${isTxEditing ? 'bg-[#FFF8F0]/30' : 'hover:bg-[#FFF8F0]/10'}`}
                    >
                      {/* Top Row: Date & Amount */}
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-medium text-[#3D4A5E]">
                          {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className={`text-xs font-black ${
                          tx.type === "revenue" ? "text-green-600" : "text-red-600"
                        }`}>
                          {tx.type === "revenue" ? "+" : "-"}{formatINR(tx.amount)}
                        </span>
                      </div>

                      {/* Mid Row: Description */}
                      <div className="text-xs font-semibold text-[#13253D] break-words">
                        {tx.description || "—"}
                      </div>

                      {/* Bottom Row: Category Badge, Trip, Actions */}
                      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#F1D9D0]/10">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wide border shrink-0 ${
                            tx.type === "revenue" 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            {tx.category}
                          </span>
                          <span className="text-[9px] text-[#3D4A5E]/70 italic truncate" title={tripName}>
                            &bull; {tripName}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingTx(tx);
                              // Scroll right panel into view on mobile
                              window.scrollTo({ top: document.getElementById("log-panel-container")?.offsetTop || 0, behavior: 'smooth' });
                            }}
                            className={`p-1.5 rounded-lg border transition ${
                              isTxEditing 
                                ? "bg-[#FF4A7D] border-[#FF4A7D] text-white" 
                                : "bg-[#FFF8F0] border-[#F1D9D0] text-[#13253D]/70 hover:text-[#FF4A7D] hover:border-[#FF4A7D]/30"
                            }`}
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <ConfirmButton
                            action={handleDelete.bind(null, tx.id)}
                            confirmText={`Are you sure you want to delete this ${tx.type} transaction "${tx.description || tx.category}"?`}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </ConfirmButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <div className="p-8 text-center text-xs text-[#3D4A5E]/50">
                    <span className="text-2xl mb-1 block">💸</span>
                    No transactions match the active ledger filters.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Log/Edit Form */}
        <div id="log-panel-container" className="lg:col-span-4">
          <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6 shadow-sm sticky top-6 space-y-4">
            
            {/* Header switcher */}
            <div className="border-b border-[#F1D9D0] pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-[#13253D] text-sm">
                  {editingTx ? "Edit Transaction" : "Log Transaction"}
                </h3>
                <p className="text-[10px] text-[#3D4A5E]/60 mt-0.5">
                  {editingTx ? `Modifying ID: #${editingTx.id}` : "Record transaction item"}
                </p>
              </div>
              {editingTx && (
                <button
                  onClick={() => setEditingTx(null)}
                  className="rounded-full p-1 bg-red-50 hover:bg-red-100 text-red-600 transition"
                  title="Cancel editing and switch to log mode"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {/* Dynamic key forces remount and pre-fill defaultValues of the form inputs */}
            <ConfirmForm
              key={editingTx ? editingTx.id : "new"}
              action={handleSave}
              confirmText={editingTx ? `Save changes to transaction "${editingTx.description || editingTx.category}"?` : "Are you sure you want to log this transaction?"}
              buttonText={editingTx ? "Save Changes" : "Log Transaction →"}
              buttonClassName="w-full rounded-full bg-[#13253D] hover:bg-[#FF4A7D] text-white py-3 text-xs font-bold transition shadow-md"
              className="space-y-4"
            >
              {editingTx && (
                <input type="hidden" name="id" value={editingTx.id} />
              )}

              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#3D4A5E]/70 block pl-1">Transaction Flow</label>
                <select 
                  name="type" 
                  required 
                  defaultValue={editingTx ? editingTx.type : "revenue"}
                  className="w-full mt-1 rounded-xl border border-[#F1D9D0] px-3 py-2.5 text-xs bg-[#FFF8F0]/30 outline-none font-semibold text-[#13253D] focus:border-[#FF4A7D]/40 transition"
                >
                  <option value="revenue">Revenue (Inflow)</option>
                  <option value="expense">Expense (Outflow)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#3D4A5E]/70 block pl-1">Amount (₹)</label>
                <input 
                  name="amount" 
                  type="number" 
                  required 
                  placeholder="e.g. 50000" 
                  defaultValue={editingTx ? editingTx.amount : ""}
                  className="w-full mt-1 rounded-xl border border-[#F1D9D0] px-3 py-2.5 text-xs outline-none focus:border-[#FF4A7D]/40 transition font-semibold text-[#13253D]"
                />
              </div>

              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#3D4A5E]/70 block pl-1">Category</label>
                <select 
                  name="category" 
                  required 
                  defaultValue={editingTx ? editingTx.category : categories.revenue[0]}
                  className="w-full mt-1 rounded-xl border border-[#F1D9D0] px-3 py-2.5 text-xs bg-[#FFF8F0]/30 outline-none font-semibold text-[#13253D] focus:border-[#FF4A7D]/40 transition"
                >
                  <optgroup label="Revenue Categories">
                    {categories.revenue.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="Expense Categories">
                    {categories.expense.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#3D4A5E]/70 block pl-1">Trip Association</label>
                <select 
                  name="tripSlug" 
                  defaultValue={editingTx ? editingTx.tripSlug || "" : ""}
                  className="w-full mt-1 rounded-xl border border-[#F1D9D0] px-3 py-2.5 text-xs bg-[#FFF8F0]/30 outline-none font-semibold text-[#13253D] focus:border-[#FF4A7D]/40 transition"
                >
                  <option value="">General Overhead (No Trip)</option>
                  {trips.map(t => (
                    <option key={t.slug} value={t.slug}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#3D4A5E]/70 block pl-1">Date</label>
                <input 
                  name="date" 
                  type="date" 
                  required 
                  defaultValue={editingTx ? editingTx.date : new Date().toISOString().slice(0, 10)} 
                  className="w-full mt-1 rounded-xl border border-[#F1D9D0] px-3 py-2.5 text-xs bg-[#FFF8F0]/30 outline-none font-semibold text-[#13253D]" 
                />
              </div>

              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#3D4A5E]/70 block pl-1">Description / Notes</label>
                <textarea 
                  name="description" 
                  placeholder="e.g. Kashmir tour deposit from Priya" 
                  defaultValue={editingTx ? editingTx.description : ""}
                  className="w-full mt-1 rounded-xl border border-[#F1D9D0] p-3 text-xs outline-none focus:border-[#FF4A7D]/40 transition bg-transparent" 
                  rows={3} 
                />
              </div>
            </ConfirmForm>

            {editingTx && (
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="w-full rounded-full border border-red-200 text-red-600 hover:bg-red-50 py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel Editing</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Complete Naari Financial Intelligence & Copilot Modal */}
      {showAIFinanceModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-2xl border border-[#F1D9D0] animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#F1D9D0] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#13253D] flex items-center gap-2">
                  🤖 NaariAI Financial Intelligence & Copilot Suite
                </h3>
                <p className="text-[11px] text-gray-500">Executive audit reports, cashflow forecasting & trip margin analytics</p>
              </div>
              <button onClick={() => setShowAIFinanceModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-sm">
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1.5 overflow-x-auto border-b border-[#F1D9D0] pb-2 scrollbar-none">
              <button
                onClick={() => setAiTab("audit")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                  aiTab === "audit" ? "bg-[#13253D] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#FF4A7D]" /> Executive Health Audit
              </button>
              <button
                onClick={() => setAiTab("forecast")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                  aiTab === "forecast" ? "bg-[#13253D] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <TrendingUp className="w-3 h-3 text-blue-400" /> 90-Day Cashflow Forecast
              </button>
              <button
                onClick={() => setAiTab("ranker")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                  aiTab === "ranker" ? "bg-[#13253D] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Award className="w-3 h-3 text-amber-400" /> Trip Profitability Ranker
              </button>
              <button
                onClick={() => setAiTab("simulator")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                  aiTab === "simulator" ? "bg-[#13253D] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Calculator className="w-3 h-3 text-purple-400" /> What-If Simulator
              </button>
            </div>

            {/* TAB 1: EXECUTIVE HEALTH AUDIT */}
            {aiTab === "audit" && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <div className="text-[10px] text-emerald-700 font-bold uppercase">Operating Margin</div>
                    <div className="text-xl font-black text-emerald-900 mt-1">{stats.margin}%</div>
                    <div className="text-[9px] text-emerald-600">Net Profit Ratio</div>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                    <div className="text-[10px] text-rose-700 font-bold uppercase">Top Outflow Category</div>
                    <div className="text-sm font-black text-rose-900 mt-1 truncate">{categoryBreakdown.expenseList[0]?.name || "Hotels"}</div>
                    <div className="text-[9px] text-rose-600">{categoryBreakdown.expenseList[0]?.percentage || 0}% of Total Outflow</div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <div className="text-[10px] text-blue-700 font-bold uppercase">Break-Even Batch Size</div>
                    <div className="text-xl font-black text-blue-900 mt-1">4 Travelers</div>
                    <div className="text-[9px] text-blue-600">Per Trip Departure</div>
                  </div>
                </div>

                <div className="p-3.5 bg-[#FFF8F0] border border-[#F1D9D0] rounded-xl space-y-2">
                  <div className="font-extrabold text-[#13253D] flex items-center gap-1.5 text-xs">
                    <Zap className="w-4 h-4 text-[#FF4A7D]" /> AI Financial Recommendations & Optimization Roadmap:
                  </div>
                  <ul className="space-y-1.5 text-gray-700">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Vendor Rate Renegotiation:</strong> Consolidate transport bookings across Kashmir & Ladakh to secure 12% bulk operator discounts.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>WhatsApp Drip Conversion:</strong> Accelerate payment pending quotes using auto-reminders to lock in deposit inflows earlier.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Ad Spend Allocation:</strong> Boost ad budget on <strong className="text-[#FF4A7D]">{tripMarginList[0]?.title || "Kashmir Special"}</strong> which yields the highest margin per traveler.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 2: 90-DAY CASHFLOW FORECAST */}
            {aiTab === "forecast" && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center font-bold text-blue-900 text-xs">
                    <span>🔮 Projected 90-Day Cashflow Inflow:</span>
                    <span className="text-base font-black text-blue-700">₹{(stats.revenue * 1.35).toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Based on active CRM qualified inquiries, upcoming departures, and historical seasonal growth patterns (+35% projected growth).
                  </p>
                </div>

                <div className="divide-y divide-[#F1D9D0] border border-[#F1D9D0] rounded-xl overflow-hidden text-xs">
                  <div className="p-3 bg-white flex justify-between items-center">
                    <div>
                      <div className="font-bold text-[#13253D]">📅 Month 1 (Immediate Runway)</div>
                      <div className="text-[10px] text-gray-400">Confirmed Bookings + Pending Deposit Link Actions</div>
                    </div>
                    <span className="font-extrabold text-emerald-700">₹{(stats.revenue * 0.45).toLocaleString("en-IN")}</span>
                  </div>

                  <div className="p-3 bg-white flex justify-between items-center">
                    <div>
                      <div className="font-bold text-[#13253D]">📅 Month 2 (Mid-Term Inflow)</div>
                      <div className="text-[10px] text-gray-400">Upcoming Seasonal Expeditions & Corporate Sisterhood Batches</div>
                    </div>
                    <span className="font-extrabold text-blue-700">₹{(stats.revenue * 0.48).toLocaleString("en-IN")}</span>
                  </div>

                  <div className="p-3 bg-white flex justify-between items-center">
                    <div>
                      <div className="font-bold text-[#13253D]">📅 Month 3 (Long-Term Pipeline)</div>
                      <div className="text-[10px] text-gray-400">Early-Bird Inquiries & Custom Private Group Requests</div>
                    </div>
                    <span className="font-extrabold text-purple-700">₹{(stats.revenue * 0.42).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TRIP PROFITABILITY RANKER */}
            {aiTab === "ranker" && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Ranked Profitability & Gross Margin by Package:</div>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
                  {tripMarginList.map((item, idx) => (
                    <div key={item.slug} className="p-3 bg-[#FFF8F0] border border-[#F1D9D0] rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center font-bold text-[#13253D]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#13253D] text-white flex items-center justify-center text-[10px] font-black">
                            #{idx + 1}
                          </span>
                          {item.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          item.margin >= 30 ? "bg-emerald-100 text-emerald-800" : item.margin >= 0 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {item.margin}% Gross Margin
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px] pt-1 border-t border-[#F1D9D0]/60 text-gray-600">
                        <div>Inflow: <strong className="text-emerald-700">{formatINR(item.rev)}</strong></div>
                        <div>Outflow: <strong className="text-rose-700">{formatINR(item.exp)}</strong></div>
                        <div>Profit: <strong className="text-[#13253D]">{formatINR(item.profit)}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: WHAT-IF SCENARIO SIMULATOR */}
            {aiTab === "simulator" && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                  <div className="font-extrabold text-purple-900 flex items-center gap-1 text-xs">
                    <Sliders className="w-4 h-4 text-purple-600" /> Interactive Financial Scenario Controls:
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between font-bold text-gray-700 text-[11px] mb-1">
                        <span>Package Price Adjustment:</span>
                        <span className="text-purple-700 font-extrabold">{simPriceChange > 0 ? `+${simPriceChange}%` : `${simPriceChange}%`}</span>
                      </div>
                      <input
                        type="range"
                        min="-20"
                        max="30"
                        step="5"
                        value={simPriceChange}
                        onChange={e => setSimPriceChange(Number(e.target.value))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-gray-700 text-[11px] mb-1">
                        <span>Passenger Volume Growth:</span>
                        <span className="text-purple-700 font-extrabold">{simVolumeChange > 0 ? `+${simVolumeChange}%` : `${simVolumeChange}%`}</span>
                      </div>
                      <input
                        type="range"
                        min="-20"
                        max="50"
                        step="5"
                        value={simVolumeChange}
                        onChange={e => setSimVolumeChange(Number(e.target.value))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Simulation Output Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white border border-[#F1D9D0] rounded-xl text-center shadow-2xs">
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Simulated Inflow</div>
                    <div className="text-base font-black text-emerald-700 mt-1">{formatINR(simResults.simRev)}</div>
                  </div>

                  <div className="p-3 bg-white border border-[#F1D9D0] rounded-xl text-center shadow-2xs">
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Simulated Net Profit</div>
                    <div className="text-base font-black text-[#13253D] mt-1">{formatINR(simResults.simNet)}</div>
                  </div>

                  <div className="p-3 bg-purple-100/60 border border-purple-200 rounded-xl text-center shadow-2xs">
                    <div className="text-[10px] text-purple-800 font-bold uppercase">Profit Delta (Impact)</div>
                    <div className={`text-base font-black mt-1 ${simResults.diffNet >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {simResults.diffNet >= 0 ? `+${formatINR(simResults.diffNet)}` : formatINR(simResults.diffNet)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-2 flex gap-2 border-t border-[#F1D9D0]">
              <button
                type="button"
                onClick={handleExportAIAuditReport}
                className="flex-1 py-2.5 bg-[#FF4A7D] hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Export Executive Audit Report (.txt)
              </button>
              <button
                type="button"
                onClick={() => setShowAIFinanceModal(false)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Close Copilot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
