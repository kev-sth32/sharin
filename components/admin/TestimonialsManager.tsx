"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addTestimonial, approveTestimonial, deleteTestimonial, updateTestimonial } from "@/lib/admin-store";
import { Edit2, Trash2, CheckCircle, XCircle, Plus, RefreshCw, Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  tripSlug: string;
  rating: number;
  content: string;
  isApproved?: boolean;
}

interface TestimonialsManagerProps {
  initialTestimonials: Testimonial[];
}

export default function TestimonialsManager({ initialTestimonials }: TestimonialsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [tripSlug, setTripSlug] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleEditSelect = (t: Testimonial) => {
    setEditingId(t.id);
    setName(t.name);
    setLocation(t.location || "");
    setTripSlug(t.tripSlug || "");
    setRating(t.rating || 5);
    setContent(t.content || "");
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setLocation("");
    setTripSlug("");
    setRating(5);
    setContent("");
    setMessage("");
    setError("");
  };

  const handleToggle = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to toggle approval status for "${name}"?`)) return;
    
    startTransition(async () => {
      try {
        const res = await approveTestimonial(id);
        if (res.success) {
          setMessage("Approval toggled successfully!");
          router.refresh();
        } else {
          setError("Failed to toggle approval status.");
        }
      } catch (err) {
        setError("Error communicating with server.");
      }
    });
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the testimonial from "${name}"?`)) return;

    startTransition(async () => {
      try {
        const res = await deleteTestimonial(id);
        if (res.success) {
          setMessage("Testimonial deleted successfully!");
          router.refresh();
        } else {
          setError("Failed to delete testimonial.");
        }
      } catch (err) {
        setError("Error communicating with server.");
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      setError("Name and Content are required.");
      return;
    }

    startTransition(async () => {
      try {
        let res;
        const payload = { name, location, tripSlug, rating: Number(rating), content };
        
        if (editingId !== null) {
          res = await updateTestimonial(editingId, payload);
        } else {
          res = await addTestimonial(payload);
        }

        if (res.success) {
          setMessage(editingId ? "Testimonial updated successfully!" : "Testimonial added successfully!");
          handleCancelEdit();
          router.refresh();
        } else {
          setError("Failed to save testimonial.");
        }
      } catch (err) {
        setError("Error communicating with server.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {message && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in duration-200">
          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Testimonial List (7/12) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-[#13253D]/70 uppercase tracking-widest">
              Live Testimonials ({initialTestimonials.length})
            </span>
            {isPending && (
              <span className="text-[10px] text-[#FF4A7D] font-bold flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing Database...</span>
              </span>
            )}
          </div>

          <div className="space-y-3.5">
            {initialTestimonials.length > 0 ? (
              initialTestimonials.map((t) => {
                const isApproved = t.isApproved !== false;
                return (
                  <div 
                    key={t.id} 
                    className={`rounded-2xl border bg-white p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between gap-4 ${
                      isApproved ? "border-[#F1D9D0]" : "border-amber-200 bg-amber-50/10"
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-extrabold text-sm text-[#13253D]">
                          {t.name}
                          {t.location && <span className="font-semibold text-gray-500 text-xs"> — {t.location}</span>}
                        </div>
                        
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                          <span className="text-[10px] font-black text-amber-700">{t.rating}</span>
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                        </div>
                      </div>

                      <div className="text-[10px] font-bold text-[#3D4A5E]/70 uppercase tracking-wider mt-1.5 flex flex-wrap gap-2 items-center">
                        {t.tripSlug && (
                          <span className="bg-[#FFF0F4] border border-[#FF4A7D]/10 text-[#FF4A7D] px-2 py-0.5 rounded-full">
                            Trip: {t.tripSlug}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full border ${
                          isApproved ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-100 border-amber-300 text-amber-800"
                        }`}>
                          {isApproved ? "Approved & Live" : "Pending Moderate"}
                        </span>
                      </div>

                      <p className="text-xs text-gray-700 italic mt-3.5 leading-relaxed bg-[#FFF8F0]/30 p-3 rounded-xl border border-gray-100/50">
                        “{t.content}”
                      </p>
                    </div>

                    <div className="flex justify-between items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleToggle(t.id, t.name)}
                        className={`rounded-full px-4 py-1.5 text-[10px] font-extrabold transition-all border ${
                          isApproved
                            ? "bg-[#13253D] hover:bg-amber-600 text-white border-transparent"
                            : "bg-green-600 hover:bg-green-700 text-white border-transparent"
                        }`}
                      >
                        {isApproved ? "Unapprove (Hide)" : "Approve & Publish"}
                      </button>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditSelect(t)}
                          className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[#13253D] hover:bg-[#FFF0F4] hover:text-[#FF4A7D] hover:border-[#FF4A7D]/20 transition-all"
                          title="Edit Testimonial"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id, t.name)}
                          className="p-2 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 hover:text-red-700 transition-all"
                          title="Delete Testimonial"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-3xl text-sm text-gray-400 bg-white">
                No testimonials loaded. Feel free to add some on the right.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Add/Edit Form (5/12) */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-white border border-[#F1D9D0] p-6 shadow-sm space-y-4 sticky top-24">
            <h3 className="font-bold text-[#13253D] text-base border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <Plus className="w-5 h-5 text-[#FF4A7D]" />
              <span>{editingId !== null ? "Edit Testimonial" : "Add New Testimonial"}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Customer Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Dr. Sneha R." 
                  required 
                  className="w-full rounded-xl border border-[#F1D9D0] px-4 py-2.5 text-xs bg-[#FFF8F0]/10 focus:border-[#FF4A7D] focus:ring-1 focus:ring-[#FF4A7D]/20 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Customer Location / Age / Tags</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="e.g. Bangalore, 32, Solo First Timer" 
                  className="w-full rounded-xl border border-[#F1D9D0] px-4 py-2.5 text-xs bg-[#FFF8F0]/10 focus:border-[#FF4A7D] focus:ring-1 focus:ring-[#FF4A7D]/20 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Trip Slug Reference</label>
                <input 
                  type="text" 
                  value={tripSlug} 
                  onChange={(e) => setTripSlug(e.target.value)} 
                  placeholder="e.g. kashmir-blossom-sisterhood" 
                  className="w-full rounded-xl border border-[#F1D9D0] px-4 py-2.5 text-xs bg-[#FFF8F0]/10 focus:border-[#FF4A7D] focus:ring-1 focus:ring-[#FF4A7D]/20 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Rating Star Scale</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(Number(e.target.value))} 
                  className="w-full rounded-xl border border-[#F1D9D0] px-4 py-2.5 text-xs bg-white focus:border-[#FF4A7D] focus:ring-1 focus:ring-[#FF4A7D]/20 outline-none transition-all shadow-inner font-semibold text-[#13253D]"
                >
                  <option value="5">5 Stars ★★★★★</option>
                  <option value="4">4 Stars ★★★★</option>
                  <option value="3">3 Stars ★★★</option>
                  <option value="2">2 Stars ★★</option>
                  <option value="1">1 Star ★</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Review Content / Quotes</label>
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="Paste their testimonial content here..." 
                  required 
                  rows={4} 
                  className="w-full rounded-xl border border-[#F1D9D0] px-4 py-2.5 text-xs bg-[#FFF8F0]/10 focus:border-[#FF4A7D] focus:ring-1 focus:ring-[#FF4A7D]/20 outline-none transition-all shadow-inner resize-y"
                />
              </div>

              <div className="flex gap-2 pt-2">
                {editingId !== null && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="flex-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 py-2.5 text-xs font-extrabold transition-all"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="flex-2 w-full rounded-full bg-[#FF4A7D] hover:bg-[#E63E6E] text-white py-2.5 text-xs font-extrabold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {isPending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{editingId !== null ? "Save Changes" : "Publish Testimonial"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
