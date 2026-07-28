import { blogSeed } from "@/lib/data";
import { notFound } from "next/navigation";

export async function generateStaticParams() { return blogSeed.map(b=>({slug:b.slug})); }

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogSeed.find(b=>b.slug===slug);
  if (!post) return notFound();
  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-8 py-12">
      <div className="text-[11px] uppercase tracking-widest font-bold text-[#FF4A7D]">{post.category}</div>
      <h1 className="mt-3 font-display font-bold text-[32px] leading-tight">{post.title}</h1>
      <p className="mt-3 text-[#3D4A5E]">{post.excerpt}</p>
      <div className="mt-8 rounded-2xl bg-white border border-[#F1D9D0] p-8 text-[14px] leading-relaxed text-[#3D4A5E]">
        <p>This is a demo article for {post.title}. In production CMS, content is rich text with SEO fields, author, FAQ structured data, and gallery. Our team writes from actual trips, not AI fluff — includes what went wrong and how we fixed it.</p>
        <p className="mt-4">TripNaari voice: bold, feminine, safe, transparent. We share hotel audit checklists, safety card template, and refund timeline screenshots.</p>
      </div>
    </div>
  );
}
