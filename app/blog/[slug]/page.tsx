import { blogSeed } from "@/lib/data";
import { notFound } from "next/navigation";

export async function generateStaticParams() { return blogSeed.map(b=>({slug:b.slug})); }

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogSeed.find(b=>b.slug===slug);
  if (!post) return notFound();
  return (
    <div className="bg-[#FFF8F0] min-h-screen py-16 md:py-24">
      <div className="max-w-[800px] mx-auto px-4 md:px-8">
        {/* Post Category Tag */}
        <div className="text-[11px] uppercase tracking-widest font-bold text-[#FF4A7D]">
          {post.category}
        </div>
        
        {/* Title */}
        <h1 className="mt-4 font-display font-[800] text-[36px] md:text-[48px] leading-[1.1] text-[#13253D]">
          {post.title}
        </h1>
        
        {/* Excerpt */}
        <p className="mt-4 text-[16px] md:text-[18px] leading-relaxed text-[#3D4A5E]">
          {post.excerpt}
        </p>

        {/* Article Content Container */}
        <div className="mt-10 rounded-3xl bg-white border border-[#F1D9D0] p-8 md:p-10 text-[15px] leading-relaxed text-[#3D4A5E] space-y-6 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.04)]">
          <p>
            This is a preview article for <strong className="text-[#13253D]">{post.title}</strong>. In the production CMS, this content is rich text with integrated SEO fields, author metadata, structured FAQ schema, and post-trip photography galleries.
          </p>
          <p>
            Our travel editorial team drafts these insights based on actual trip reviews and trip leader logs, rather than generic AI templates. We share real details on hotel safety checklists, emergency escalations, and true client experiences.
          </p>
          <div className="p-5 rounded-2xl bg-[#FFF8F0] border border-[#F1D9D0] text-[#13253D] font-medium text-[14px]">
            💡 <strong className="text-[#800F2D]">TripNaari Guidelines:</strong> We always choose transparency over corporate marketing fluff. Stays are vetted, leaders are active, and refunds are processed within 7-10 days in writing.
          </div>
        </div>
      </div>
    </div>
  );
}

