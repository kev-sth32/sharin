"use client";

import { useState, useMemo } from "react";
import { Search, X, Edit2, Globe } from "lucide-react";
import { savePolicy } from "@/lib/admin-store";

interface Policy {
  slug: string;
  title: string;
  body: string;
  version: string;
  updated: string;
}

interface PoliciesManagerProps {
  initialPolicies: Policy[];
}

export default function PoliciesManager({ initialPolicies }: PoliciesManagerProps) {
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formVersion, setFormVersion] = useState("");
  const [formUpdated, setFormUpdated] = useState("");
  const [formBody, setFormBody] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleOpenEdit = (policy: Policy) => {
    setEditingPolicy(policy);
    setFormTitle(policy.title);
    setFormVersion(policy.version);
    setFormUpdated(policy.updated);
    setFormBody(policy.body);
    setErrorMsg("");
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPolicy(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formBody.trim() || !formVersion.trim() || !formUpdated.trim()) {
      setErrorMsg("Please fill out all fields.");
      return;
    }

    if (!editingPolicy) return;

    const res = await savePolicy(editingPolicy.slug, formTitle, formBody, formVersion, formUpdated);
    
    if (res?.success) {
      setPolicies(prev => prev.map(p => p.slug === editingPolicy.slug ? { 
        ...p, 
        title: formTitle, 
        body: formBody, 
        version: formVersion, 
        updated: formUpdated 
      } : p));
      setIsFormOpen(false);
      setEditingPolicy(null);
    } else {
      setErrorMsg("Failed to save policy updates.");
    }
  };

  // Filtered Policies logic
  const filteredPolicies = useMemo(() => {
    if (searchTerm.trim() === "") return policies;
    const q = searchTerm.toLowerCase();
    return policies.filter(
      p => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)
    );
  }, [policies, searchTerm]);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="font-display font-bold text-2xl text-[#13253D]">Policies — Version History</h1>
        <p className="text-xs text-[#3D4A5E] mt-1">Manage policies, version logs, and last updated timestamps. Updates reflect instantly across all pages.</p>
      </div>

      {/* Editor Modal / Form Drawer */}
      {isFormOpen && editingPolicy && (
        <div className="rounded-2xl border border-[#FF4A7D]/20 bg-[#FFF0F4]/30 p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center pb-2 border-b border-[#FF4A7D]/10">
            <h3 className="font-bold text-sm text-[#13253D]">
              Edit Policy: {editingPolicy.title}
            </h3>
            <button onClick={handleCloseForm} className="text-[#3D4A5E]/40 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-[#13253D]/50 uppercase block mb-1">Policy Title</label>
                <input
                  type="text"
                  placeholder="e.g. Cancellation & Refund Policy"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#F1D9D0] px-3 py-2 text-xs bg-white outline-none focus:border-[#FF4A7D]/40"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#13253D]/50 uppercase block mb-1">Version</label>
                  <input
                    type="text"
                    placeholder="e.g. 2.1"
                    value={formVersion}
                    onChange={e => setFormVersion(e.target.value)}
                    className="w-full rounded-xl border border-[#F1D9D0] px-3 py-2 text-xs bg-white outline-none focus:border-[#FF4A7D]/40"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#13253D]/50 uppercase block mb-1">Updated</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Jan 2026"
                    value={formUpdated}
                    onChange={e => setFormUpdated(e.target.value)}
                    className="w-full rounded-xl border border-[#F1D9D0] px-3 py-2 text-xs bg-white outline-none focus:border-[#FF4A7D]/40"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#13253D]/50 uppercase block mb-1">Policy Body Content (Supports Markdown / Text)</label>
              <textarea
                placeholder="Write policy content terms..."
                value={formBody}
                onChange={e => setFormBody(e.target.value)}
                className="w-full rounded-xl border border-[#F1D9D0] p-3 text-xs bg-white outline-none focus:border-[#FF4A7D]/40 font-mono"
                rows={10}
              />
            </div>

            {errorMsg && (
              <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl p-2.5">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-[#FF4A7D]/10">
              <button
                type="submit"
                className="rounded-full bg-[#13253D] hover:bg-[#FF4A7D] text-white px-5 py-2 text-xs font-bold transition shadow-sm"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-full bg-white border border-[#F1D9D0] text-[#13253D] px-5 py-2 text-xs font-bold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white border border-[#F1D9D0] rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#3D4A5E]/40" />
          <input
            type="text"
            placeholder="Search policies by name, version or content keywords..."
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
      </div>

      {/* Policies Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPolicies.map((p) => (
          <div key={p.slug} className="rounded-2xl bg-white border border-[#F1D9D0] p-5 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-[15px] text-[#13253D]">{p.title}</h3>
              <div className="text-[11px] text-[#3D4A5E] mt-1.5 font-medium">
                Slug: <span className="font-mono text-[10px] text-[#FF4A7D]">{p.slug}</span> &bull; v{p.version} &bull; {p.updated}
              </div>
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-[#F1D9D0]/40">
              <button
                onClick={() => handleOpenEdit(p)}
                className="rounded-full bg-[#13253D] hover:bg-[#FF4A7D] text-white px-4 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Policy</span>
              </button>
              <a
                href={`/policies/${p.slug}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#FFF8F0] border border-[#F1D9D0] text-[#13253D] hover:bg-[#FFF0F4]/40 px-4 py-1.5 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-[#3D4A5E]" />
                <span>View Live</span>
              </a>
            </div>
          </div>
        ))}
        {filteredPolicies.length === 0 && (
          <div className="col-span-full p-12 text-center text-sm text-[#3D4A5E] bg-white border border-[#F1D9D0] rounded-2xl shadow-sm">
            <span className="text-3xl block mb-2">🔍</span>
            No policies found matching your search term.
          </div>
        )}
      </div>
    </div>
  );
}
