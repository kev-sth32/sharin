"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Languages, 
  User, 
  ShieldCheck, 
  Plus,
  Loader2 
} from "lucide-react";
import { deleteLeader } from "@/lib/admin-store";

interface Leader {
  slug: string;
  name: string;
  bio: string;
  specialties?: string[];
  languages?: string[];
  experienceYears: number;
  tripsLed: number;
  image?: string;
  isVerified?: boolean;
}

export default function LeadersClient({
  initialLeaders
}: {
  initialLeaders: Leader[];
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (slug: string, name: string) => {
    if (!confirm(`Are you sure you want to delete trip leader "${name}"?`)) return;
    startTransition(async () => {
      const res = await deleteLeader(slug);
      if (res.success) {
        router.refresh();
      } else {
        alert("Error deleting leader");
      }
    });
  };

  // Filtered leaders
  const filteredLeaders = initialLeaders.filter(l => {
    const q = searchQuery.toLowerCase();
    const specialtiesStr = l.specialties?.join(" ").toLowerCase() || "";
    const languagesStr = l.languages?.join(" ").toLowerCase() || "";
    return (
      l.name.toLowerCase().includes(q) ||
      l.bio.toLowerCase().includes(q) ||
      specialtiesStr.includes(q) ||
      languagesStr.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#13253D]">Trip Leaders Registry</h1>
          <p className="text-xs text-[#3D4A5E] mt-1">Manage profiles, biographies, languages, and specialties of our verified trip leads.</p>
        </div>
        <Link 
          href="/admin24639/leaders/new" 
          className="inline-flex items-center gap-1.5 rounded-full bg-[#FF4A7D] hover:bg-[#E63E6E] text-white px-5 py-2.5 text-xs font-bold transition shadow-sm self-start sm:self-center active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Leader
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#F1D9D0] rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#13253D]/40" />
          <input 
            type="text"
            placeholder="Search by name, bio, specialties, or languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#F1D9D0] bg-white text-xs text-[#13253D] focus:outline-none focus:border-[#FF4A7D]/60 focus:ring-4 focus:ring-[#FF4A7D]/5 transition shadow-sm placeholder:text-[#13253D]/40"
          />
        </div>
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="text-xs font-bold text-[#FF4A7D] hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Leaders Grid */}
      <div className="relative min-h-[300px]">
        {isPending && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-2xl backdrop-blur-[1px]">
            <Loader2 className="w-8 h-8 text-[#FF4A7D] animate-spin" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeaders.map((l) => (
            <div key={l.slug} className="rounded-2xl bg-white border border-[#F1D9D0] p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div className="space-y-4">
                {/* Image & Header */}
                <div className="flex gap-4 items-start text-left">
                  {l.image ? (
                    <img 
                      src={l.image} 
                      alt={l.name} 
                      className="w-16 h-16 rounded-2xl object-cover border border-[#F1D9D0] shadow-sm shrink-0" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#FFF0F4] text-[#FF4A7D] flex items-center justify-center font-bold text-xl border border-[#FF4A7D]/10 shrink-0">
                      {l.name.charAt(0)}
                    </div>
                  )}
                  <div className="space-y-0.5 pt-1">
                    <h3 className="font-display font-bold text-[#13253D] text-base">{l.name}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Leader
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 bg-[#FFF8F0]/40 border border-[#F1D9D0]/40 rounded-xl p-3 text-center">
                  <div>
                    <div className="text-[10px] uppercase font-extrabold text-[#13253D]/40">Experience</div>
                    <div className="text-xs font-bold text-[#13253D] mt-0.5">{l.experienceYears} Years</div>
                  </div>
                  <div className="border-l border-[#F1D9D0]/50">
                    <div className="text-[10px] uppercase font-extrabold text-[#13253D]/40">Trips Led</div>
                    <div className="text-xs font-bold text-[#13253D] mt-0.5">{l.tripsLed}+ Trips</div>
                  </div>
                </div>

                {/* Bio */}
                <div className="text-xs text-[#3D4A5E]/90 leading-relaxed font-medium text-left line-clamp-4">
                  {l.bio}
                </div>

                {/* Specialties & Languages */}
                <div className="space-y-2 border-t border-[#F1D9D0]/40 pt-3">
                  {l.specialties && l.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF4A7D] shrink-0" />
                      <span className="text-[9px] font-extrabold uppercase text-[#13253D]/40 mr-1 shrink-0">Specialties:</span>
                      {l.specialties.map((s, idx) => (
                        <span key={idx} className="bg-[#FFF0F4] text-[#FF4A7D] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#FF4A7D]/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {l.languages && l.languages.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center pt-0.5">
                      <Languages className="w-3.5 h-3.5 text-[#3D4A5E]/60 shrink-0" />
                      <span className="text-[9px] font-extrabold uppercase text-[#13253D]/40 mr-1 shrink-0">Languages:</span>
                      {l.languages.map((lang, idx) => (
                        <span key={idx} className="bg-slate-50 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-5 pt-4 border-t border-[#F1D9D0]/40">
                <Link 
                  href={`/admin24639/leaders/${l.slug}/edit`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#F1D9D0] bg-white hover:bg-[#FFF8F0]/30 text-[#13253D] font-bold text-xs py-2.5 transition active:scale-[0.98]"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#FF4A7D]" />
                  Edit Bio
                </Link>
                <button 
                  onClick={() => handleDelete(l.slug, l.name)}
                  className="w-10 h-10 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition active:scale-[0.98]"
                  title="Remove leader"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredLeaders.length === 0 && (
            <div className="col-span-full bg-white border border-[#F1D9D0] rounded-2xl p-12 text-center text-[#3D4A5E]/60 text-xs shadow-sm">
              <User className="w-8 h-8 text-[#FF4A7D]/40 mx-auto mb-2" />
              No trip leaders found matching search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
