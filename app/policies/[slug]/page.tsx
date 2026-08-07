import { notFound } from "next/navigation";
import { getMergedPolicies } from "@/lib/public-store";

export async function generateStaticParams() { 
  const policies = getMergedPolicies();
  return policies.map((p: any) => ({ slug: p.slug })); 
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policies = getMergedPolicies();
  const policy = policies.find((p: any) => p.slug === slug);
  
  if (!policy) return notFound();
  
  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-8 py-12">
      <h1 className="font-display font-bold text-[32px] leading-tight text-[#13253D]">{policy.title}</h1>
      <div className="mt-2 text-[12px] uppercase tracking-widest font-bold text-[#FF4A7D]">
        Last updated: {policy.updated} &bull; Version {policy.version}
      </div>
      <div className="mt-8 rounded-2xl bg-white border border-[#F1D9D0] p-6 md:p-8 card-shadow text-left">
        <pre className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-[#3D4A5E]">{policy.body}</pre>
      </div>
    </div>
  );
}
