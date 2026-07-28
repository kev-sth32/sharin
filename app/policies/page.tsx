import Link from "next/link";

const policies = [
  { slug: "cancellation-refund", title: "Cancellation & Refund Policy", desc: "Transparent, time-bound slabs with credit transfer." },
  { slug: "safety-promise", title: "Safety Promise & Accountability", desc: "Women trip leader SOP, emergency card, hotel timeline." },
  { slug: "privacy-policy", title: "Privacy Policy", desc: "Your data, your sisterhood. No sale to third party." },
  { slug: "terms-conditions", title: "Terms & Conditions", desc: "Booking, liability, change policy." },
];

export default function PoliciesIndex() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12">
      <h1 className="font-display font-bold text-[36px]">Trust Center — Policies written in human language</h1>
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {policies.map(p=>(
          <Link key={p.slug} href={`/policies/${p.slug}`} className="rounded-2xl bg-white border border-[#F1D9D0] p-6 hover:border-[#FF4A7D]/30 transition">
            <div className="font-semibold">{p.title}</div>
            <div className="text-sm text-[#3D4A5E] mt-1">{p.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
