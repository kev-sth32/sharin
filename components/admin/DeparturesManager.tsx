"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { formatINR } from "@/lib/utils";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteDeparture } from "@/lib/admin-store";

interface Departure {
  id: number;
  tripSlug: string;
  startDate: string;
  endDate: string;
  price?: number;
  seatsBooked: number;
  seatsTotal: number;
  status: string;
  isGuaranteed: boolean;
}

interface Trip {
  slug: string;
  title: string;
  priceFrom: number;
}

interface DeparturesManagerProps {
  initialDepartures: Departure[];
  trips: Trip[];
}

const statuses = ["open", "filling_fast", "sold_out", "cancelled"] as const;

export default function DeparturesManager({ initialDepartures, trips }: DeparturesManagerProps) {
  const [departures, setDepartures] = useState<Departure[]>(initialDepartures);
  const [searchTerm, setSearchTerm] = useState("");
  const [tripFilter, setTripFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  // Deletion logic
  const handleDelete = async (id: number) => {
    const res = await deleteDeparture(id);
    if (res?.success) {
      setDepartures(prev => prev.filter(d => d.id !== id));
    }
  };

  // Unique trips listing for the filter dropdown
  const uniqueTripSlugs = useMemo(() => {
    const slugs = new Set(departures.map(d => d.tripSlug).filter(Boolean));
    return Array.from(slugs).sort();
  }, [departures]);

  // Filtered and sorted departures logic
  const filteredAndSortedDepartures = useMemo(() => {
    let result = [...departures];

    // Search filter
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(d => {
        const trip = trips.find(t => t.slug === d.tripSlug);
        const tripTitle = trip ? trip.title.toLowerCase() : d.tripSlug.toLowerCase();
        return (
          tripTitle.includes(q) ||
          d.startDate.includes(q) ||
          d.endDate.includes(q) ||
          d.status.toLowerCase().includes(q)
        );
      });
    }

    // Trip filter
    if (tripFilter !== "all") {
      result = result.filter(d => d.tripSlug === tripFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(d => d.status === statusFilter);
    }

    // Sorting logic
    result.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [departures, trips, searchTerm, tripFilter, statusFilter, sortBy]);

  // Reset filters helper
  const resetFilters = () => {
    setSearchTerm("");
    setTripFilter("all");
    setStatusFilter("all");
    setSortBy("newest");
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white border border-[#F1D9D0] rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#3D4A5E]/40" />
            <input
              type="text"
              placeholder="Search departures by trip name, dates, status..."
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
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 items-center w-full md:w-auto">
            {/* Trip Filter */}
            <div className="flex items-center justify-between sm:justify-start gap-1 bg-[#FFF8F0] border border-[#F1D9D0] rounded-full px-3 py-1.5 w-full sm:w-auto">
              <span className="text-[10px] font-bold text-[#13253D]/50 uppercase shrink-0">Trip:</span>
              <select
                value={tripFilter}
                onChange={(e) => setTripFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold outline-none text-[#13253D] w-full flex-1 min-w-0 cursor-pointer text-right sm:text-left"
              >
                <option value="all">All Trips</option>
                {uniqueTripSlugs.map(slug => {
                  const tripObj = trips.find(t => t.slug === slug);
                  return (
                    <option key={slug} value={slug}>
                      {tripObj ? tripObj.title : slug}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center justify-between sm:justify-start gap-1 bg-[#FFF8F0] border border-[#F1D9D0] rounded-full px-3 py-1.5 w-full sm:w-auto">
              <span className="text-[10px] font-bold text-[#13253D]/50 uppercase shrink-0">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold outline-none text-[#13253D] w-full flex-1 min-w-0 cursor-pointer text-right sm:text-left"
              >
                <option value="all">All</option>
                {statuses.map(s => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center justify-between sm:justify-start gap-1 bg-[#FFF8F0] border border-[#F1D9D0] rounded-full px-3 py-1.5 w-full sm:w-auto col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-[#13253D]/50 uppercase shrink-0">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
                className="bg-transparent text-xs font-semibold outline-none text-[#13253D] w-full flex-1 min-w-0 cursor-pointer text-right sm:text-left"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {(searchTerm || tripFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={resetFilters}
                className="col-span-2 sm:col-span-1 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3 py-1.5 transition flex items-center justify-center gap-1 w-full sm:w-auto"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar Statistics */}
      <div className="px-1 text-xs text-[#3D4A5E]">
        Showing <span className="font-semibold text-[#13253D]">{filteredAndSortedDepartures.length}</span> of <span className="font-semibold text-[#13253D]">{departures.length}</span> departures
      </div>

      {/* Mobile departures card list (visible on mobile/tablet, hidden on desktop) */}
      <div className="lg:hidden space-y-2.5 mt-6">
        {filteredAndSortedDepartures.map((d: any) => {
          const trip = trips.find((t: any) => t.slug === d.tripSlug);
          const tripTitle = trip ? trip.title : d.tripSlug;
          const tripPrice = trip ? trip.priceFrom : 0;
          const displayPrice = d.price || tripPrice;

          const startDateFormatted = new Date(d.startDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' });
          const endDateFormatted = new Date(d.endDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });

          return (
            <div key={d.id} className="bg-white border border-[#F1D9D0] rounded-xl p-3 shadow-sm flex flex-col gap-2 text-left">
              {/* Header: Title, dates, price, seats */}
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[13px] text-[#13253D] truncate">{tripTitle}</h3>
                  <div className="text-[11px] text-[#3D4A5E] mt-0.5 font-semibold flex flex-wrap items-center gap-1.5">
                    <span>{startDateFormatted} — {endDateFormatted}</span>
                    <span className="text-[#3D4A5E]/40">•</span>
                    <span className="text-[#FF4A7D]">{formatINR(displayPrice)}</span>
                  </div>
                  <div className="text-[10px] text-[#3D4A5E]/70 mt-1 flex flex-wrap items-center gap-1.5 font-medium">
                    <span>Seats: <span className="font-bold text-[#13253D]">{d.seatsBooked}/{d.seatsTotal}</span></span>
                    {d.isGuaranteed && (
                      <>
                        <span className="text-[#3D4A5E]/30">•</span>
                        <span className="rounded bg-green-50 px-1 py-0.2 text-[8px] font-extrabold text-green-700 border border-green-200 uppercase tracking-wide font-display">Guaranteed</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider ${
                    d.status === "filling_fast" ? "bg-[#FFF0F4] text-[#FF4A7D] border border-[#FF4A7D]/20" :
                    d.status === "sold_out" ? "bg-gray-100 text-gray-600 border border-gray-200" :
                    d.status === "cancelled" ? "bg-red-50 text-red-600 border border-red-200" :
                    "bg-green-50 text-green-700 border border-green-200"
                  }`}>
                    {d.status.replace("_", " ")}
                  </span>

                  {/* Actions as small inline buttons next to header */}
                  <div className="flex gap-1.5">
                    <Link 
                      href={`/admin/departures/${d.id}/edit`} 
                      className="rounded-full bg-[#13253D] hover:bg-[#FF4A7D] text-white px-3 py-1 text-[10px] font-bold transition shadow-sm"
                    >
                      Edit
                    </Link>
                    <ConfirmButton
                      action={async () => {
                        await handleDelete(d.id);
                      }}
                      confirmText={`Are you sure you want to delete this departure for "${tripTitle}"?`}
                      className="rounded-full bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 px-3 py-1 text-[10px] font-bold transition"
                    >
                      Delete
                    </ConfirmButton>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredAndSortedDepartures.length === 0 && (
          <div className="p-8 text-center text-sm text-[#3D4A5E] bg-white border border-[#F1D9D0] rounded-2xl shadow-sm">
            No departure dates found matching active filters.
          </div>
        )}
      </div>

      {/* Desktop view: Departures Table (hidden on mobile/tablet, visible on desktop) */}
      <div className="hidden lg:block rounded-2xl border border-[#F1D9D0] bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#FFF8F0] text-[11px] uppercase text-[#13253D]/70 border-b border-[#F1D9D0]">
            <tr>
              <th className="text-left p-3 font-semibold">Trip Package</th>
              <th className="text-left p-3 font-semibold">Dates</th>
              <th className="text-left p-3 font-semibold">Price</th>
              <th className="text-left p-3 font-semibold">Seats</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold">Guaranteed</th>
              <th className="text-left p-3 font-semibold text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedDepartures.map((d: any) => {
              const trip = trips.find((t: any) => t.slug === d.tripSlug);
              const tripTitle = trip ? trip.title : d.tripSlug;
              const tripPrice = trip ? trip.priceFrom : 0;
              const displayPrice = d.price || tripPrice;

              return (
                <tr key={d.id} className="border-t border-[#F1D9D0]/50 hover:bg-[#FFF8F0]/30 transition-colors">
                  <td className="p-3 text-xs font-semibold text-[#13253D] max-w-xs truncate">{tripTitle}</td>
                  <td className="p-3 text-xs text-[#3D4A5E]">
                    {d.startDate} to {d.endDate}
                  </td>
                  <td className="p-3 text-xs font-medium text-[#13253D]">
                    {formatINR(displayPrice)}
                  </td>
                  <td className="p-3 text-xs text-[#3D4A5E]">
                    <span className="font-bold">{d.seatsBooked}</span> / {d.seatsTotal}
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      d.status === "filling_fast" ? "bg-[#FFF0F4] text-[#FF4A7D] border border-[#FF4A7D]/20" :
                      d.status === "sold_out" ? "bg-gray-100 text-gray-600 border border-gray-200" :
                      d.status === "cancelled" ? "bg-red-50 text-red-600 border border-red-200" :
                      "bg-green-50 text-green-700 border border-green-200"
                    }`}>
                      {d.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3 text-xs">
                    {d.isGuaranteed ? (
                      <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700 border border-green-200">Guaranteed</span>
                    ) : (
                      <span className="text-[#3D4A5E]/40">—</span>
                    )}
                  </td>
                  <td className="p-3 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/departures/${d.id}/edit`} 
                        className="rounded-full bg-[#13253D] text-white px-3.5 py-1.5 text-[11px] font-bold transition hover:bg-[#FF4A7D]"
                      >
                        Edit
                      </Link>
                      <ConfirmButton
                        action={async () => {
                          await handleDelete(d.id);
                        }}
                        confirmText={`Are you sure you want to delete this departure for "${tripTitle}"?`}
                        className="rounded-full bg-red-50 border border-red-200 text-red-600 px-3.5 py-1.5 text-[11px] font-bold transition hover:bg-red-100"
                      >
                        Delete
                      </ConfirmButton>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredAndSortedDepartures.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-sm text-[#3D4A5E] bg-[#FFF8F0]/10">
                  <span className="text-3xl block mb-2">🔍</span>
                  No departure dates found matching active filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
