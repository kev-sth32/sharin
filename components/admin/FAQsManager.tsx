"use client";

import { useState, useMemo } from "react";
import { Search, X, Plus, Edit2, Trash2 } from "lucide-react";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { saveFAQ, deleteFAQ } from "@/lib/admin-store";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface FAQsManagerProps {
  initialFaqs: FAQ[];
}

const categories = ["general", "safety", "booking", "cancellation"] as const;

export default function FAQsManager({ initialFaqs }: FAQsManagerProps) {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formCategory, setFormCategory] = useState("general");
  const [errorMsg, setErrorMsg] = useState("");

  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormQuestion("");
    setFormAnswer("");
    setFormCategory("general");
    setErrorMsg("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormCategory(faq.category);
    setErrorMsg("");
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingFaq(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) {
      setErrorMsg("Please fill out all fields.");
      return;
    }

    const id = editingFaq ? editingFaq.id : null;
    const res = await saveFAQ(id, formQuestion, formAnswer, formCategory);
    
    if (res?.success) {
      if (id) {
        // Edit update
        setFaqs(prev => prev.map(f => f.id === id ? { ...f, question: formQuestion, answer: formAnswer, category: formCategory } : f));
      } else {
        // Add update
        setFaqs(prev => [...prev, { id: Date.now(), question: formQuestion, answer: formAnswer, category: formCategory }]);
      }
      setIsFormOpen(false);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await deleteFAQ(id);
    if (res?.success) {
      setFaqs(prev => prev.filter(f => f.id !== id));
    }
  };

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const cats = new Set(faqs.map(f => f.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [faqs]);

  // Filtered FAQs logic
  const filteredFaqs = useMemo(() => {
    let result = [...faqs];

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(f => f.category === categoryFilter);
    }

    return result;
  }, [faqs, searchTerm, categoryFilter]);

  return (
    <div className="space-y-6 text-left">
      {/* Action Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="font-display font-bold text-2xl text-[#13253D]">FAQs — Manage Answers Honestly</h1>
        <button
          onClick={handleOpenAdd}
          className="rounded-full bg-[#FF4A7D] hover:bg-[#E63E6E] text-white px-5 py-2.5 text-sm font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New FAQ</span>
        </button>
      </div>

      {/* Editor Modal / Form Drawer */}
      {isFormOpen && (
        <div className="rounded-2xl border border-[#FF4A7D]/20 bg-[#FFF0F4]/30 p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center pb-2 border-b border-[#FF4A7D]/10">
            <h3 className="font-bold text-sm text-[#13253D]">
              {editingFaq ? "Edit FAQ Item" : "Create New FAQ Item"}
            </h3>
            <button onClick={handleCloseForm} className="text-[#3D4A5E]/40 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-[#13253D]/50 uppercase block mb-1">Question Text</label>
              <input
                type="text"
                placeholder="e.g. Is TripNaari safe for solo first timers?"
                value={formQuestion}
                onChange={e => setFormQuestion(e.target.value)}
                className="w-full rounded-xl border border-[#F1D9D0] px-3 py-2 text-xs bg-white outline-none focus:border-[#FF4A7D]/40"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#13253D]/50 uppercase block mb-1">Answer Text</label>
              <textarea
                placeholder="Write the FAQ answer details..."
                value={formAnswer}
                onChange={e => setFormAnswer(e.target.value)}
                className="w-full rounded-xl border border-[#F1D9D0] p-3 text-xs bg-white outline-none focus:border-[#FF4A7D]/40"
                rows={4}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#13253D]/50 uppercase block mb-1">Category Tag</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full rounded-xl border border-[#F1D9D0] px-2.5 py-2 text-xs bg-white outline-none font-semibold text-[#13253D] focus:border-[#FF4A7D]/40"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
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
                {editingFaq ? "Save Changes" : "Create FAQ"}
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

      {/* Search and Filters Bar */}
      <div className="bg-white border border-[#F1D9D0] rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#3D4A5E]/40" />
            <input
              type="text"
              placeholder="Search FAQs by question or answer keywords..."
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
          <div className="flex items-center gap-1 bg-[#FFF8F0] border border-[#F1D9D0] rounded-full px-3 py-1.5 w-full md:w-auto">
            <span className="text-[10px] font-bold text-[#13253D]/50 uppercase shrink-0">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold outline-none text-[#13253D] w-full flex-1 min-w-0 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(c => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics info */}
      <div className="px-1 text-xs text-[#3D4A5E]">
        Showing <span className="font-semibold text-[#13253D]">{filteredFaqs.length}</span> of <span className="font-semibold text-[#13253D]">{faqs.length}</span> FAQs
      </div>

      {/* FAQs Cards List */}
      <div className="space-y-3">
        {filteredFaqs.map((f: FAQ) => (
          <div key={f.id} className="rounded-2xl bg-white border border-[#F1D9D0] p-4 shadow-sm space-y-3 text-left">
            <div className="flex justify-between items-start gap-4">
              <div className="font-semibold text-sm text-[#13253D]">{f.question}</div>
              <span className="rounded-full bg-[#FFF0F4] border border-[#FF4A7D]/20 px-2.5 py-0.5 text-[8px] uppercase font-bold text-[#FF4A7D] shrink-0">
                {f.category}
              </span>
            </div>
            
            <p className="text-xs leading-relaxed text-[#3D4A5E] whitespace-pre-wrap">{f.answer}</p>
            
            <div className="flex gap-2 pt-2.5 border-t border-[#F1D9D0]/40">
              <button
                onClick={() => handleOpenEdit(f)}
                className="rounded-full bg-[#13253D] hover:bg-[#FF4A7D] text-white px-3.5 py-1 text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <ConfirmButton
                action={async () => {
                  await handleDelete(f.id);
                }}
                confirmText={`Are you sure you want to delete this FAQ?`}
                className="rounded-full bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 px-3.5 py-1 text-[10px] font-bold transition flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </ConfirmButton>
            </div>
          </div>
        ))}
        {filteredFaqs.length === 0 && (
          <div className="p-12 text-center text-sm text-[#3D4A5E] bg-white border border-[#F1D9D0] rounded-2xl shadow-sm">
            <span className="text-3xl block mb-2">🔍</span>
            No FAQs found matching your active filters.
          </div>
        )}
      </div>
    </div>
  );
}
