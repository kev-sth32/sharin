"use client";

import { useState, useMemo, Fragment } from "react";
import { updateLeadFull } from "@/lib/admin-store";
import ConfirmForm from "@/components/admin/ConfirmForm";
import { Search, Filter, Calendar, MapPin, User, Phone, Mail, FileText, X, CheckCircle, RefreshCw, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

const statuses = ["new", "contacted", "itinerary_shared", "payment_pending", "booked", "lost", "support_needed"] as const;

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  destination: string;
  travelMonth: string;
  travelers: number;
  budget: string;
  message: string;
  status: string;
  notes?: string;
  followUpAt?: string;
  source: string;
  createdAt: string;
}

interface LeadsCRMProps {
  initialLeads: Lead[];
}

export default function LeadsCRM({ initialLeads }: LeadsCRMProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [expandedLeads, setExpandedLeads] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedLeads(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allExpanded = filteredAndSortedLeads.reduce((acc, l) => {
      acc[l.id] = true;
      return acc;
    }, {} as Record<number, boolean>);
    setExpandedLeads(allExpanded);
  };

  const collapseAll = () => {
    setExpandedLeads({});
  };

  // Get unique destinations and sources for filter dropdowns
  const uniqueDestinations = useMemo(() => {
    const dests = new Set(leads.map(l => l.destination).filter(Boolean));
    return Array.from(dests).sort();
  }, [leads]);

  const uniqueSources = useMemo(() => {
    const sources = new Set(leads.map(l => l.source).filter(Boolean));
    return Array.from(sources).sort();
  }, [leads]);

  // Handle lead update (retains local state sync)
  const handleLeadUpdate = async (id: number, status: string, notes: string, followUpAt: string) => {
    const res = await updateLeadFull(id, status, notes, followUpAt);
    if (res?.success) {
      setLeads(prev =>
        prev.map(l => (l.id === id ? { ...l, status, notes, followUpAt, updatedAt: new Date().toISOString() } : l))
      );
    }
  };

  // Filter and sort logic
  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];

    // Search term
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        l =>
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.toLowerCase().includes(q) ||
          l.destination?.toLowerCase().includes(q) ||
          l.message?.toLowerCase().includes(q) ||
          l.notes?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(l => l.status === statusFilter);
    }

    // Destination filter
    if (destinationFilter !== "all") {
      result = result.filter(l => l.destination === destinationFilter);
    }

    // Source filter
    if (sourceFilter !== "all") {
      result = result.filter(l => l.source === sourceFilter);
    }

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [leads, searchTerm, statusFilter, destinationFilter, sourceFilter, sortBy]);

  // Dynamic statistics based on filtered list
  const stats = useMemo(() => {
    const total = filteredAndSortedLeads.length;
    const booked = filteredAndSortedLeads.filter(l => l.status === "booked").length;
    const pending = filteredAndSortedLeads.filter(l => l.status === "payment_pending").length;
    const newLeads = filteredAndSortedLeads.filter(l => l.status === "new").length;
    const contacted = filteredAndSortedLeads.filter(l => l.status === "contacted" || l.status === "itinerary_shared").length;

    return { total, booked, pending, newLeads, contacted };
  }, [filteredAndSortedLeads]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDestinationFilter("all");
    setSourceFilter("all");
    setSortBy("newest");
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "booked":
        return "bg-green-50 text-green-700 border-green-200";
      case "new":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "payment_pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "contacted":
      case "itinerary_shared":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "lost":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "support_needed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-[#F1D9D0] rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-[#13253D]/50">Filtered Leads</div>
          <div className="text-2xl font-bold mt-1 text-[#13253D]">{stats.total}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-green-800/60">Booked (Paid)</div>
          <div className="text-2xl font-bold mt-1 text-green-700">{stats.booked}</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-amber-800/60">Payments Pending</div>
          <div className="text-2xl font-bold mt-1 text-amber-700">{stats.pending}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-blue-800/60">New Inquiries</div>
          <div className="text-2xl font-bold mt-1 text-blue-700">{stats.newLeads}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 shadow-sm col-span-2 md:col-span-1">
          <div className="text-[10px] uppercase font-bold text-purple-800/60">Follow-ups Active</div>
          <div className="text-2xl font-bold mt-1 text-purple-700">{stats.contacted}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#F1D9D0] rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#3D4A5E]/40" />
            <input
              type="text"
              placeholder="Search by name, email, phone, itinerary notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-[#F1D9D0] bg-[#FFF8F0]/30 text-sm outline-none focus:border-[#FF4A7D]/40 transition"
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

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Status Select */}
            <div className="flex items-center gap-1 bg-[#FFF8F0] border border-[#F1D9D0] rounded-full px-3 py-1.5">
              <span className="text-[10px] font-bold text-[#13253D]/50 uppercase">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold outline-none text-[#13253D]"
              >
                <option value="all">All</option>
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Destination Select */}
            <div className="flex items-center gap-1 bg-[#FFF8F0] border border-[#F1D9D0] rounded-full px-3 py-1.5">
              <span className="text-[10px] font-bold text-[#13253D]/50 uppercase">Dest:</span>
              <select
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold outline-none text-[#13253D]"
              >
                <option value="all">All Destinations</option>
                {uniqueDestinations.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Source Select */}
            <div className="flex items-center gap-1 bg-[#FFF8F0] border border-[#F1D9D0] rounded-full px-3 py-1.5">
              <span className="text-[10px] font-bold text-[#13253D]/50 uppercase">Source:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold outline-none text-[#13253D]"
              >
                <option value="all">All Sources</option>
                {uniqueSources.map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1 bg-[#FFF8F0] border border-[#F1D9D0] rounded-full px-3 py-1.5">
              <span className="text-[10px] font-bold text-[#13253D]/50 uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
                className="bg-transparent text-xs font-semibold outline-none text-[#13253D]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== "all" || destinationFilter !== "all" || sourceFilter !== "all") && (
              <button
                onClick={resetFilters}
                className="rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3 py-1.5 transition flex items-center gap-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Toolbar (Expand/Collapse All + Stats info) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
        <div className="text-xs text-[#3D4A5E]">
          Showing <span className="font-semibold text-[#13253D]">{filteredAndSortedLeads.length}</span> of <span className="font-semibold text-[#13253D]">{leads.length}</span> leads
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="rounded-full bg-[#FFF8F0] hover:bg-[#F1D9D0]/40 text-[#13253D] border border-[#F1D9D0] text-xs font-bold px-3 py-1.5 transition"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="rounded-full bg-[#FFF8F0] hover:bg-[#F1D9D0]/40 text-[#13253D] border border-[#F1D9D0] text-xs font-bold px-3 py-1.5 transition"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#F1D9D0] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#FFF8F0] text-[10px] uppercase tracking-wider text-[#13253D]/60 border-b border-[#F1D9D0]">
            <tr>
              <th className="w-12 p-3 text-center"></th>
              <th className="text-left p-3">Lead Info</th>
              <th className="text-left p-3">Trip Details</th>
              <th className="text-left p-3">Current Status</th>
              <th className="text-left p-3">Source & Date</th>
              <th className="text-right p-3 pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedLeads.map((l) => {
              const isExpanded = !!expandedLeads[l.id];
              return (
                <Fragment key={l.id}>
                  <tr className={`border-t border-[#F1D9D0]/50 align-middle hover:bg-[#FFF8F0]/10 transition ${isExpanded ? 'bg-[#FFF8F0]/10' : ''}`}>
                    <td className="p-3 pl-4 text-center">
                      <button 
                        onClick={() => toggleExpand(l.id)} 
                        className="p-1.5 rounded-lg hover:bg-[#FFF8F0] text-[#13253D]/60 hover:text-[#FF4A7D] transition"
                        title={isExpanded ? "Collapse details" : "Expand details"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-[#13253D] flex items-center gap-1.5 text-xs">
                        <User className="w-3.5 h-3.5 text-[#FF4A7D] shrink-0" />
                        <span>{l.name}</span>
                      </div>
                      <div className="flex flex-col text-[10px] text-[#3D4A5E] mt-0.5 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#3D4A5E]/40 shrink-0" />
                          <a href={`mailto:${l.email}`} className="hover:underline truncate max-w-[150px]">{l.email}</a>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#3D4A5E]/40 shrink-0" />
                          <span>{l.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-xs">
                      <div className="font-semibold text-[#13253D] flex items-center gap-1 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-[#FF8A2B] shrink-0" />
                        <span>{l.destination}</span>
                      </div>
                      <div className="text-[10px] text-[#3D4A5E] mt-1 flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                        <span className="bg-[#FFF8F0] border border-[#F1D9D0]/60 rounded px-1 font-medium">{l.travelMonth}</span>
                        <span>•</span>
                        <span>{l.travelers} pax</span>
                        <span>•</span>
                        <span className="font-semibold text-[#13253D]">{l.budget}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${getStatusBadgeClass(l.status)}`}>
                        {l.status.replace("_", " ")}
                      </span>
                      {l.followUpAt && (
                        <div className="text-[9px] text-[#FF4A7D] font-semibold flex items-center gap-0.5 mt-1">
                          <Calendar className="w-2.5 h-2.5 shrink-0" />
                          <span>Remind: {new Date(l.followUpAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-[11px] text-[#3D4A5E]">
                      <div className="font-medium text-[#13253D]">{new Date(l.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-[9px] font-extrabold uppercase text-[#FF4A7D] mt-0.5">{l.source || "organic"}</div>
                    </td>
                    <td className="p-3 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`https://wa.me/${l.phone?.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white px-3 py-1.5 text-[10px] font-bold transition shadow-sm"
                        >
                          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437.002 9.861-4.416 9.864-9.852.002-2.63-1.023-5.101-2.885-6.963C16.388 1.928 13.916.904 11.285.902c-5.439 0-9.863 4.417-9.867 9.853-.001 1.73.457 3.419 1.328 4.908l-.989 3.613 3.708-.973zm11.58-6.143c-.302-.15-1.788-.882-2.057-.98-.268-.099-.463-.149-.658.15-.195.299-.754.98-.925 1.178-.17.199-.341.224-.643.075-.302-.15-1.273-.469-2.427-1.498-.897-.8-1.502-1.787-1.678-2.087-.177-.3-.019-.462.13-.611.135-.134.302-.35.454-.523.151-.174.2-.299.302-.498.101-.2.05-.374-.025-.523-.075-.15-.658-1.588-.901-2.173-.236-.57-.497-.493-.68-.5-.187-.008-.401-.01-.614-.01s-.56.08-.853.4c-.293.32-1.12 1.1-1.12 2.68 0 1.58 1.147 3.11 1.307 3.32.16.21 2.257 3.45 5.47 4.83.763.329 1.36.526 1.822.673.768.243 1.467.209 2.02.127.616-.093 1.788-.732 2.042-1.44.254-.707.254-1.314.178-1.44-.076-.124-.268-.199-.57-.348z" />
                          </svg>
                          <span>WhatsApp</span>
                        </a>
                        <button
                          onClick={() => toggleExpand(l.id)}
                          className="rounded-full bg-[#13253D] hover:bg-[#FF4A7D] text-white px-3.5 py-1.5 text-[10px] font-bold transition shadow-sm flex items-center gap-1"
                        >
                          <span>{isExpanded ? "Close" : "View"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-[#FFF8F0]/30">
                      <td colSpan={6} className="p-4 pl-12 pr-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white border border-[#F1D9D0]/60 rounded-2xl p-5 shadow-inner">
                          {/* Column 1: Traveler Details & Original Message */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#13253D]/50">Traveler Inquiry details</h4>
                            
                            <div className="bg-[#FFF8F0]/40 p-3.5 rounded-xl border border-[#F1D9D0]/30 text-xs text-[#3D4A5E] space-y-2">
                              {l.message ? (
                                <div>
                                  <div className="font-semibold text-[10px] uppercase text-[#13253D]/40 mb-1">Traveler's Message</div>
                                  <p className="italic leading-relaxed whitespace-pre-wrap">"{l.message}"</p>
                                </div>
                              ) : (
                                <p className="text-gray-400 italic">No custom message provided.</p>
                              )}
                            </div>

                            <div className="text-[10px] text-[#3D4A5E]/70 space-y-1 pl-1">
                              <div>Email: <a href={`mailto:${l.email}`} className="text-[#FF4A7D] font-medium hover:underline">{l.email}</a></div>
                              <div>Phone: <span className="font-medium text-[#13253D]">{l.phone}</span></div>
                              <div>Budget category: <span className="font-semibold text-green-700">{l.budget}</span></div>
                              <div>Destination: <span className="font-semibold text-[#13253D]">{l.destination}</span></div>
                              <div>Travel Date: <span className="font-semibold text-[#13253D]">{l.travelMonth}</span></div>
                              <div>Total Travelers: <span className="font-semibold text-[#13253D]">{l.travelers} pax</span></div>
                            </div>
                          </div>

                          {/* Column 2: Interactive CRM Action Form */}
                          <div className="space-y-3 border-t lg:border-t-0 lg:border-x border-[#F1D9D0]/40 lg:px-6">
                            <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#13253D]/50">Update Pipeline State</h4>
                            
                            <ConfirmForm
                              action={async (formData: FormData) => {
                                const status = formData.get("status") as string;
                                const notes = formData.get("notes") as string;
                                const follow = formData.get("followUpAt") as string;
                                await handleLeadUpdate(l.id, status, notes, follow);
                              }}
                              confirmText={`Update lead pipeline details for "${l.name}"?`}
                              buttonText="Save & Update Lead"
                              buttonClassName="w-full rounded-full bg-[#13253D] hover:bg-[#FF4A7D] text-white py-2 text-xs font-bold transition-all shadow-sm"
                              className="space-y-3"
                            >
                              <div>
                                <label className="text-[9px] font-extrabold uppercase text-[#13253D]/40 block pl-1 mb-1">Pipeline Status</label>
                                <select
                                  name="status"
                                  defaultValue={l.status}
                                  className="w-full rounded-xl border border-[#F1D9D0] px-2.5 py-2 text-xs bg-[#FFF8F0]/30 outline-none font-semibold text-[#13253D] focus:border-[#FF4A7D]/40 transition"
                                >
                                  {statuses.map(s => (
                                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] font-extrabold uppercase text-[#13253D]/40 block pl-1 mb-1">CRM Follow-up Notes</label>
                                <textarea
                                  name="notes"
                                  defaultValue={l.notes || ""}
                                  placeholder="Add status updates, traveler preferences, or follow-up notes..."
                                  className="w-full rounded-xl border border-[#F1D9D0] p-2.5 text-xs outline-none focus:border-[#FF4A7D]/40 transition bg-[#FFF8F0]/10"
                                  rows={3}
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-extrabold uppercase text-[#13253D]/40 block pl-1 mb-1">Set Follow-up Reminder</label>
                                <input
                                  name="followUpAt"
                                  type="datetime-local"
                                  defaultValue={l.followUpAt || ""}
                                  className="w-full rounded-xl border border-[#F1D9D0] px-2.5 py-1.5 text-xs outline-none bg-transparent text-[#13253D]"
                                />
                              </div>
                            </ConfirmForm>
                          </div>

                          {/* Column 3: Historic Logs & Details */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#13253D]/50">Status & Latest Notes History</h4>
                            
                            <div className="space-y-3">
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#3D4A5E]/50 block">Status Badge</span>
                                <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[9px] font-extrabold mt-1 uppercase tracking-wider ${getStatusBadgeClass(l.status)}`}>
                                  {l.status.replace("_", " ")}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#3D4A5E]/50 block">Active CRM Notes Log</span>
                                <p className="text-xs text-[#13253D] mt-1 bg-[#FFF8F0]/20 p-3 rounded-xl border border-[#F1D9D0]/30 italic leading-relaxed min-h-[60px] whitespace-pre-wrap">
                                  {l.notes || "No notes logged yet."}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    window.dispatchEvent(
                                      new CustomEvent("tripnaari-ai-context", {
                                        detail: { type: "lead", data: l }
                                      })
                                    );
                                  }}
                                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[#FF4A7D]/30 bg-white hover:bg-[#FFF0F4] text-[#FF4A7D] py-2 text-xs font-bold transition shadow-sm mt-2.5"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Consult AI Assistant</span>
                                </button>
                              </div>
                              {l.followUpAt && (
                                <div className="text-[10px] bg-red-50 text-red-700 border border-red-100 rounded-xl p-2.5 font-semibold flex items-start gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="block font-bold">Upcoming Follow-up</span>
                                    <span className="text-[9px] opacity-90">{new Date(l.followUpAt).toLocaleString()}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filteredAndSortedLeads.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-sm text-[#3D4A5E] bg-[#FFF8F0]/10">
                  <span className="text-3xl block mb-2">🔍</span>
                  No leads found matching your active filters or search queries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
