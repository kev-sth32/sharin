import { getMergedDestinations, getMergedTrips } from "@/lib/public-store";
import { notFound } from "next/navigation";
import TripCard from "@/components/trip/TripCard";
import Link from "next/link";

export async function generateStaticParams() { 
  const dests = getMergedDestinations();
  return dests.map((d:any)=>({slug:d.slug})); 
}

export default async function DestinationDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destinations = getMergedDestinations();
  const dest = destinations.find((d:any)=>d.slug===slug);
  if (!dest) return notFound();
  const trips = getMergedTrips().filter((t:any)=>t.destinationSlug===dest.slug);
  return (
    <div>
      <div className="relative">
        <img src={dest.heroImage} alt={dest.name} className="w-full h-[50vh] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13253D] to-transparent" />
        <div className="absolute bottom-0 max-w-[1280px] mx-auto px-4 md:px-8 pb-8 text-white">
          <div className="text-[12px] uppercase tracking-widest font-bold text-[#FF8A2B]">{dest.region} • Best: {dest.bestSeason}</div>
          <h1 className="font-display font-bold text-[36px] md:text-[52px] leading-[0.9] mt-2">{dest.name}</h1>
          <p className="mt-3 max-w-2xl text-white/80">{dest.tagline} — {dest.description}</p>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12">
        <h2 className="font-display font-bold text-2xl">Trips in {dest.name} — editable from admin with photo upload</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {trips.map((t:any)=>(
            <TripCard key={t.slug} trip={{slug:t.slug, title:t.title, shortDescription:t.shortDescription, durationDays:t.durationDays, durationNights:t.durationNights, priceFrom:t.priceFrom, priceOriginal:t.priceOriginal, heroImage:t.heroImage, highlights:t.highlights, ratingAvg:t.ratingAvg, ratingCount:t.ratingCount, isFeatured:t.isFeatured, groupSizeMax:t.groupSizeMax}} />
          ))}
          {trips.length===0 && <div className="col-span-3 rounded-2xl bg-white border border-[#F1D9D0] p-8 text-center">Custom trips available. <Link href="/#enquiry" className="text-[#FF4A7D] underline">Enquire</Link> or add trips in /admin/trips/new</div>}
        </div>
      </div>
    </div>
  );
}
