"use client";

import { useMemo } from "react";
import { formatINR } from "@/lib/utils";

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

interface Lead {
  id: number;
  status: string;
  createdAt: string;
}

interface AnalyticsChartsProps {
  transactions: Transaction[];
  leads: Lead[];
}

export default function AnalyticsCharts({ transactions, leads }: AnalyticsChartsProps) {
  // 1. Group transactions by month for the cash flow chart
  const monthlyData = useMemo(() => {
    const groups: { [key: string]: { revenue: number; expense: number; label: string } } = {};

    transactions.forEach((tx) => {
      // Parse date to "MMM YYYY" (e.g. "Jul 2026")
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

    // Sort chronologically
    return Object.keys(groups)
      .sort()
      .map((key) => ({
        key,
        ...groups[key],
      }));
  }, [transactions]);

  // 2. Leads Status breakdown
  const statusStats = useMemo(() => {
    const counts: { [key: string]: number } = {
      new: 0,
      contacted: 0,
      itinerary_shared: 0,
      payment_pending: 0,
      booked: 0,
      lost: 0,
      support_needed: 0,
    };

    leads.forEach((l) => {
      if (counts[l.status] !== undefined) {
        counts[l.status]++;
      } else {
        counts.new++; // Fallback
      }
    });

    const total = leads.length || 1;
    return Object.keys(counts).map((status) => ({
      status,
      count: counts[status],
      percentage: Math.round((counts[status] / total) * 100),
    }));
  }, [leads]);

  // Chart math dimensions
  const chartHeight = 200;
  const chartWidth = 500;
  const padding = 40;
  const graphHeight = chartHeight - padding * 2;
  const graphWidth = chartWidth - padding * 2;

  // Max value for scaling chart
  const maxVal = useMemo(() => {
    let max = 50000; // default min threshold
    monthlyData.forEach((d) => {
      if (d.revenue > max) max = d.revenue;
      if (d.expense > max) max = d.expense;
    });
    return max * 1.15; // add 15% head room
  }, [monthlyData]);

  // Lead status colors mapping
  const statusConfig: { [key: string]: { label: string; color: string; bg: string } } = {
    booked: { label: "Booked", color: "#25D366", bg: "bg-[#25D366]" },
    payment_pending: { label: "Pending Pay", color: "#FF8A2B", bg: "bg-[#FF8A2B]" },
    new: { label: "New Inquiry", color: "#3B82F6", bg: "bg-[#3B82F6]" },
    contacted: { label: "Contacted", color: "#A855F7", bg: "bg-[#A855F7]" },
    itinerary_shared: { label: "Shared Itin", color: "#EC4899", bg: "bg-[#EC4899]" },
    support_needed: { label: "Needs Help", color: "#EF4444", bg: "bg-[#EF4444]" },
    lost: { label: "Lost Lead", color: "#6B7280", bg: "bg-[#6B7280]" },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
      {/* 1. Cash Flow Chart Card */}
      <div className="bg-white border border-[#F1D9D0] rounded-[24px] p-6 shadow-sm lg:col-span-8 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-[#13253D]">Financial Performance Trend</h3>
            <p className="text-xs text-[#3D4A5E]">Comparison of Revenue vs Expenses month-by-month</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-[#25D366]">
              <span className="w-3 h-3 rounded-full bg-[#25D366] inline-block" /> Revenue
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#FF4A7D]">
              <span className="w-3 h-3 rounded-full bg-[#FF4A7D] inline-block" /> Expense
            </span>
          </div>
        </div>

        {monthlyData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-xs text-[#3D4A5E]">
            No financial transactions logged yet.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[450px]">
              {/* Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padding + graphHeight * (1 - ratio);
                const val = Math.round(maxVal * ratio);
                return (
                  <g key={i}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      stroke="#F1D9D0"
                      strokeDasharray="4,4"
                      strokeWidth={1}
                    />
                    <text
                      x={padding - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[9px] font-bold fill-[#13253D]/40"
                    >
                      {val >= 100000 ? `${(val / 100000).toFixed(1)}L` : `${val / 1000}k`}
                    </text>
                  </g>
                );
              })}

              {/* Draw Bars */}
              {monthlyData.map((d, idx) => {
                const barSpacing = graphWidth / monthlyData.length;
                const centerOfSection = padding + idx * barSpacing + barSpacing / 2;
                const barWidth = Math.min(22, barSpacing / 3);

                // Calculations
                const revHeight = (d.revenue / maxVal) * graphHeight;
                const expHeight = (d.expense / maxVal) * graphHeight;

                const revY = padding + graphHeight - revHeight;
                const expY = padding + graphHeight - expHeight;

                return (
                  <g key={d.key} className="group cursor-pointer">
                    {/* Revenue Bar */}
                    <rect
                      x={centerOfSection - barWidth - 2}
                      y={revY}
                      width={barWidth}
                      height={revHeight}
                      fill="#25D366"
                      rx={3}
                      className="transition-all duration-300 hover:opacity-85"
                    />
                    {/* Expense Bar */}
                    <rect
                      x={centerOfSection + 2}
                      y={expY}
                      width={barWidth}
                      height={expHeight}
                      fill="#FF4A7D"
                      rx={3}
                      className="transition-all duration-300 hover:opacity-85"
                    />

                    {/* X-Axis labels */}
                    <text
                      x={centerOfSection}
                      y={chartHeight - padding + 15}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-[#13253D]/70"
                    >
                      {d.label}
                    </text>

                    {/* Tooltip Hover Overlay Info (rendered inline for simplicity) */}
                    <title>{`${d.label}\nRevenue: ${formatINR(d.revenue)}\nExpense: ${formatINR(d.expense)}\nNet: ${formatINR(d.revenue - d.expense)}`}</title>
                  </g>
                );
              })}

              {/* Bottom Baseline axis */}
              <line
                x1={padding}
                y1={chartHeight - padding}
                x2={chartWidth - padding}
                y2={chartHeight - padding}
                stroke="#13253D"
                strokeWidth={1.5}
              />
            </svg>
          </div>
        )}
      </div>

      {/* 2. Leads Distribution breakdown card */}
      <div className="bg-white border border-[#F1D9D0] rounded-[24px] p-6 shadow-sm lg:col-span-4 space-y-4">
        <div>
          <h3 className="font-semibold text-[#13253D]">Leads Pipeline</h3>
          <p className="text-xs text-[#3D4A5E]">Conversion stage shares in database</p>
        </div>

        {/* Horizontal Stack Breakdown Bar */}
        <div className="h-6 w-full rounded-full bg-slate-100 flex overflow-hidden border border-[#F1D9D0]">
          {statusStats.map((item) => {
            if (item.count === 0) return null;
            const config = statusConfig[item.status] || { bg: "bg-slate-400", color: "#6B7280" };
            return (
              <div
                key={item.status}
                style={{ width: `${item.percentage}%` }}
                className={`${config.bg} transition-all duration-300 hover:brightness-95`}
                title={`${config.label}: ${item.count} leads (${item.percentage}%)`}
              />
            );
          })}
        </div>

        {/* Legend listing */}
        <div className="space-y-2 pt-2">
          {statusStats
            .filter((item) => item.count > 0)
            .sort((a, b) => b.count - a.count)
            .map((item) => {
              const config = statusConfig[item.status] || { label: item.status, color: "#6B7280" };
              return (
                <div key={item.status} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 font-medium text-[#13253D]">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    <span>{config.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#13253D]">{item.count}</span>
                    <span className="text-[10px] text-[#3D4A5E]/60">({item.percentage}%)</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
