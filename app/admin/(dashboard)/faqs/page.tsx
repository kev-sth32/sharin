import { faqsSeed } from "@/lib/data";

export default function FAQsAdmin() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl">FAQs — Edit Answers Honestly</h1>
      <div className="mt-6 space-y-3">
        {faqsSeed.map((f: any, i: number)=>(
          <div key={i} className="rounded-2xl bg-white border border-[#F1D9D0] p-5">
            <div className="font-semibold text-sm">{f.question}</div>
            <div className="text-xs text-[#3D4A5E] mt-2">{f.answer}</div>
            <div className="mt-2 inline-block rounded-full bg-[#FFF0F4] border border-[#FF4A7D]/20 px-2 py-1 text-[10px] uppercase font-bold text-[#FF4A7D]">{f.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
