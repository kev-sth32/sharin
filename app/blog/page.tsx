import Link from "next/link";
import { blogSeed } from "@/lib/data";

export const metadata = { title: "Blog / Resources - Safe Travel for Women | TripNaari" };

export default function BlogPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12">
      <h1 className="font-display font-bold text-[36px]">Resources for Naari who wants facts, not fluff</h1>
      <p className="mt-3 text-[#3D4A5E]">Safety guides, food honesty, destination readiness.</p>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {blogSeed.map(b=>(
          <Link key={b.slug} href={`/blog/${b.slug}`} className="rounded-2xl bg-white border border-[#F1D9D0] p-6">
            <div className="text-[11px] uppercase tracking-widest font-bold text-[#FF4A7D]">{b.category}</div>
            <h3 className="mt-2 font-semibold leading-tight">{b.title}</h3>
            <p className="mt-2 text-sm text-[#3D4A5E]">{b.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
