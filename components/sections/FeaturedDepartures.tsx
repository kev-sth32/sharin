import TripCard from "@/components/trip/TripCard";
import { getMergedTrips } from "@/lib/public-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FeaturedDepartures() {
  const allTrips = getMergedTrips();
  const featured = allTrips.filter((t:any) => t.isFeatured);
  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D]">Featured departures • Women-only • Verified</div>
          <h2 className="mt-3 font-display font-bold text-[32px] md:text-[48px] leading-[0.95] tracking-tight text-[#13253D]">Handcrafted trips that<br /> actually feel safe.</h2>
          <p className="mt-4 text-[16px] leading-relaxed text-[#3D4A5E] max-w-xl">No hidden costs, no scary stays. We show inclusions, hotel category, cancellation timeline before you pay. Trip leader stays with you from pickup to drop.</p>
        </div>
        <Link href="/trips"><Button variant="outline" size="md">View all departures →</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map((trip:any) => (
          <TripCard key={trip.slug} trip={{
            slug: trip.slug,
            title: trip.title,
            shortDescription: trip.shortDescription,
            durationDays: trip.durationDays,
            durationNights: trip.durationNights,
            priceFrom: trip.priceFrom,
            priceOriginal: trip.priceOriginal,
            heroImage: trip.heroImage,
            highlights: trip.highlights,
            ratingAvg: trip.ratingAvg,
            ratingCount: trip.ratingCount,
            isFeatured: trip.isFeatured,
            groupSizeMax: trip.groupSizeMax,
          }} />
        ))}
        {featured.length===0 && <div className="col-span-3 rounded-2xl bg-white border border-[#F1D9D0] p-8 text-center text-sm">No featured trips — mark trips as featured in /admin/trips</div>}
      </div>

      <div className="mt-10 rounded-[24px] bg-[#13253D] text-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="font-display font-bold text-xl md:text-2xl">Not found your month? Get calendar on WhatsApp.</div>
          <div className="text-white/60 text-sm mt-1">We send exact dates, hotel previews, cancellation policy when you ask. No 10 calls.</div>
        </div>
        <Link href="#enquiry"><Button size="lg" className="bg-white text-[#13253D] hover:bg-[#FFF8F0] border-white">Get dates on WhatsApp →</Button></Link>
      </div>
    </section>
  );
}
