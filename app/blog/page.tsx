import Link from "next/link";
import { getMergedBlogs } from "@/lib/public-store";

export const metadata = { title: "Blog / Resources - Safe Travel for Women | TripNaari" };

export default function BlogPage() {
  const blogs = getMergedBlogs().filter((b: any) => b.isPublished !== false);

  return (
    <div className="bg-[#FFF8F0] py-16 md:py-24 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D] mb-4">
            Blog & Resources
          </div>
          <h1 className="font-display font-[800] text-[36px] md:text-[48px] leading-[1.05] text-[#13253D]">
            Resources for Naari who wants facts, not fluff
          </h1>
          <p className="mt-4 text-[16px] md:text-[17px] leading-relaxed text-[#3D4A5E]">
            Honest safety guides, food disclosures, and destination reports from real trips.
          </p>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((b: any) => (
            <Link 
              key={b.slug} 
              href={`/blog/${b.slug}`} 
              className="rounded-3xl border border-[#F1D9D0] bg-white p-6 md:p-8 flex flex-col justify-between shadow-[0_10px_35px_-8px_rgba(19,37,61,0.06)] hover:shadow-[0_20px_50px_-10px_rgba(255,74,125,0.12)] hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="text-[11px] uppercase tracking-widest font-bold text-[#FF4A7D]">
                  {b.category}
                </div>
                <h3 className="font-display font-bold text-[20px] text-[#13253D] group-hover:text-[#FF4A7D] transition-colors leading-snug line-clamp-2">
                  {b.title}
                </h3>
                <p className="text-[14px] leading-relaxed text-[#3D4A5E] line-clamp-3">
                  {b.excerpt}
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#F1D9D0]/50 text-right text-[13px] font-bold text-[#FF4A7D] group-hover:text-[#E63E6E] transition-colors">
                Read Article →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

