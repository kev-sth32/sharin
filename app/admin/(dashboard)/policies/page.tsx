export default function PoliciesAdmin() {
  const policies = [
    { slug: "cancellation-refund", title: "Cancellation & Refund", version: "2.1", updated: "15 Jan 2026" },
    { slug: "safety-promise", title: "Safety Promise", version: "1.4", updated: "10 Jan 2026" },
    { slug: "privacy-policy", title: "Privacy", version: "1.0", updated: "01 Jan 2026" },
    { slug: "terms-conditions", title: "Terms", version: "1.2", updated: "05 Jan 2026" },
  ];
  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Policies — Version History</h1>
      <p className="text-xs text-[#3D4A5E] mt-1">Each policy has version + lastUpdated. Edit in <code>app/policies/[slug]/page.tsx</code> or CMS. History kept in schema.</p>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {policies.map(p=>(
          <div key={p.slug} className="rounded-2xl bg-white border border-[#F1D9D0] p-5">
            <div className="font-semibold">{p.title}</div>
            <div className="text-xs text-[#3D4A5E] mt-1">Slug: {p.slug} • v{p.version} • {p.updated}</div>
            <a href={`/policies/${p.slug}`} target="_blank" className="mt-3 inline-block rounded-full bg-[#FFF8F0] border px-3 py-1 text-[11px]">View live →</a>
          </div>
        ))}
      </div>
    </div>
  );
}
