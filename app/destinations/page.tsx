import { getMergedDestinations } from "@/lib/public-store";
import Link from "next/link";

export const metadata = { title: "Destinations | TripNaari Women-First" };

export default function DestinationsPage() {
  const destinations = getMergedDestinations();
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12">
      <h1 className="font-display font-bold text-[36px] md:text-[48px] leading-[0.9]">10+ regions, one promise: safety first.</h1>
      <p className="mt-4 text-[#3D4A5E] max-w-2xl">From Kashmir to Bali, each destination has verified stays, local women guides/hosts, safety score. Edit photos + content in /admin/destinations.</p>
      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {destinations.map((d:any)=>(
          <Link key={d.slug} href={`/destinations/${d.slug}`} className="rounded-[24px] overflow-hidden border border-[#F1D9D0] bg-white group">
            <img src={d.heroImage} alt={d.name} className="aspect-[4/3] object-cover w-full group-hover:scale-105 transition-transform duration-500" />
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-widest font-bold text-[#FF4A7D]">{d.region} • {d.bestSeason}</div>
              <h3 className="font-display font-bold text-xl mt-1">{d.name}</h3>
              <p className="text-[13px] text-[#3D4A5E] mt-2">{d.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{d.idealFor?.map((t:string)=><span key={t} className="text-[10px] rounded-full bg-[#FFF8F0] border border-[#F1D9D0] px-2 py-1">{t}</span>)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
