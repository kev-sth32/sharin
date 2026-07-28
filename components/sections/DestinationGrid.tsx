import Link from "next/link";
import { getMergedDestinations } from "@/lib/public-store";

export default function DestinationGrid() {
  const destinations = getMergedDestinations();
  return (
    <section className="bg-[#FFF8F0] border-y border-[#F1D9D0]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D]">Destinations • Curated for Naari</div>
            <h2 className="mt-3 font-display font-bold text-[32px] md:text-[48px] leading-[0.9] text-[#13253D]">Where do you<br/>want to bloom?</h2>
          </div>
          <Link href="/destinations" className="text-[14px] font-semibold underline underline-offset-4">View all 10 regions →</Link>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px]">
          {destinations.map((d:any, i:number)=>(
            <Link key={d.slug} href={`/destinations/${d.slug}`} className={`group relative rounded-[24px] overflow-hidden border border-[#F1D9D0] bg-white ${i===0?"row-span-2 md:col-span-2":""} ${i===3?"md:col-span-2":""}`}>
              <img src={d.heroImage} alt={d.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#13253D]/80 via-[#13253D]/10 to-transparent" />
              <div className="absolute bottom-0 p-4 md:p-5">
                <div className="inline-flex text-[10px] tracking-widest uppercase font-bold bg-white/90 backdrop-blur rounded-full px-2.5 py-1 text-[#13253D]">{d.region} • {d.bestSeason}</div>
                <h3 className="mt-2 font-display font-bold text-white text-[20px] md:text-[24px] leading-tight">{d.name}</h3>
                <div className="mt-1 text-white/80 text-[12px] leading-relaxed line-clamp-2">{d.tagline}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
