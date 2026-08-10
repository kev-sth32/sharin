"use client";
import { useState, useMemo } from "react";
import { 
  ChevronDown, Search, X, HelpCircle, ShieldCheck, 
  Calendar, XCircle, Sparkles, Info 
} from "lucide-react";
import { faqsSeed } from "@/lib/data";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export default function FAQSection({ faqs = faqsSeed }: { faqs?: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Category Configuration
  const categoriesConfig = useMemo(() => [
    { id: "all", label: "All Questions", icon: HelpCircle },
    { id: "safety", label: "Safety & Support", icon: ShieldCheck },
    { id: "booking", label: "Bookings & Cost", icon: Calendar },
    { id: "cancellation", label: "Refunds & Cancel", icon: XCircle },
    { id: "general", label: "General info", icon: Sparkles },
  ], []);

  // Filtered FAQs Logic
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
      const matchesSearch = 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  return (
    <section className="bg-[#FFF8F0] py-16 md:py-24 border-t border-[#F1D9D0]/50">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Sticky Title, Search, and Category Filters */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div>
              <div className="text-[12px] font-black tracking-[0.2em] uppercase text-[#FF4A7D] mb-3">
                FAQ
              </div>
              <h2 className="font-display font-[800] text-[28px] sm:text-[36px] lg:text-[40px] leading-[1.15] text-[#13253D]">
                Frequently Asked<br className="hidden lg:block" /> Questions
              </h2>
              <p className="text-xs sm:text-sm text-[#3D4A5E]/80 mt-3 leading-relaxed">
                Have doubts? We've compiled detailed answers about our female-led safety systems, transparent booking costs, and custom terms.
              </p>
            </div>

            {/* Keyword Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search FAQs by keywords..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setOpen(null); // Close accordion during search to avoid jumps
                }}
                className="w-full text-xs pl-11 pr-10 py-3.5 bg-white border border-[#F1D9D0] rounded-2xl focus:outline-none focus:border-[#FF4A7D] focus:ring-1 focus:ring-[#FF4A7D]/20 transition-all shadow-sm placeholder:text-gray-400 text-[#13253D] font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-3 p-1 rounded-full text-gray-400 hover:text-black transition"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Navigation Tabs (Horizontal on mobile, vertical list on desktop) */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-3 lg:pb-0 scrollbar-none whitespace-nowrap lg:whitespace-normal -mx-4 px-4 lg:mx-0 lg:px-0">
              {categoriesConfig.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setOpen(null);
                    }}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? "bg-[#FF4A7D] text-white shadow-sm hover:bg-[#ff3b71]"
                        : "bg-white text-[#13253D] border border-[#F1D9D0] hover:bg-[#FFF0F4]/40 hover:border-[#FF4A7D]/30"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Accordion FAQs List */}
          <div className="lg:col-span-7 space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16 bg-white border border-[#F1D9D0] rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FFF8F0] border border-[#F1D9D0] flex items-center justify-center">
                  <Info className="w-5 h-5 text-[#FF8A2B]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#13253D]">No FAQs Match Your Filter</h4>
                  <p className="text-[11px] text-[#3D4A5E]/70 mt-1">Try clearing your search query or switching categories.</p>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-1 text-xs font-bold text-[#FF4A7D] hover:underline"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              filteredFaqs.map((faq, i) => {
                const isFAQOpen = open === i;
                return (
                  <div 
                    key={i} 
                    className={`rounded-3xl border transition-all duration-300 bg-white ${
                      isFAQOpen 
                        ? "border-[#FF4A7D]/35 shadow-[0_8px_24px_-8px_rgba(255,74,125,0.08)] bg-white" 
                        : "border-[#F1D9D0] hover:border-[#FF4A7D]/30 hover:shadow-[0_8px_20px_-8px_rgba(19,37,61,0.04)]"
                    }`}
                  >
                    <button 
                      onClick={() => setOpen(isFAQOpen ? null : i)} 
                      className="w-full text-left flex items-center justify-between gap-4 p-5 md:p-6 group cursor-pointer"
                    >
                      <span className="font-display font-bold text-[15px] md:text-[17px] leading-snug text-[#13253D] transition-colors duration-200 group-hover:text-[#FF4A7D]">
                        {faq.question}
                      </span>
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isFAQOpen 
                          ? "bg-[#FFF0F4] text-[#FF4A7D] rotate-180" 
                          : "bg-[#FFF8F0] text-[#FF4A7D] group-hover:bg-[#FFF0F4]"
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>
                    
                    <div 
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isFAQOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-5 md:px-6 pb-5 md:pb-6 text-[13px] md:text-[14px] leading-relaxed text-[#3D4A5E] border-t border-[#F1D9D0]/10 pt-4 whitespace-pre-line font-medium">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

