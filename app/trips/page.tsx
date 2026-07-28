import { getMergedTrips, getMergedDestinations } from "@/lib/public-store";
import TripCard from "@/components/trip/TripCard";
import EnquiryForm from "@/components/forms/EnquiryForm";
import Link from "next/link";

export const metadata = {
  title: "Women-Only Trips - Domestic & International | TripNaari",
  description: "Explore handcrafted women-only trips: Kashmir, Kerala, Meghalaya, Rajasthan, Spiti, Bali. Verified stays, women trip leaders, transparent refunds.",
};

export default async function TripsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams;
  let trips = getMergedTrips();
  const destinations = getMergedDestinations();
  if (filter === "women-only") trips = trips.filter((t:any)=>t.isWomenOnly);
  if (filter === "weekend") trips = trips.filter((t:any)=>t.durationDays <= 4);
  if (filter === "international") trips = trips.filter((t:any)=> destinations.find((d:any)=>d.slug===t.destinationSlug)?.isInternational);

  return (
    <div className="bg-[#FFF8F0]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href="/trips" className={`rounded-full px-4 py-2 text-xs font-bold border ${!filter?"bg-[#13253D] text-white":"bg-white text-[#13253D] border-[#F1D9D0]"}`}>All trips ({trips.length})</Link>
          <Link href="/trips?filter=women-only" className={`rounded-full px-4 py-2 text-xs font-bold border ${filter==="women-only"?"bg-[#FF4A7D] text-white":"bg-white"}`}>Women-only group</Link>
          <Link href="/trips?filter=weekend" className={`rounded-full px-4 py-2 text-xs font-bold border ${filter==="weekend"?"bg-[#FF4A7D] text-white":"bg-white"}`}>Weekend 3-4D</Link>
          <Link href="/trips?filter=international" className={`rounded-full px-4 py-2 text-xs font-bold border ${filter==="international"?"bg-[#FF4A7D] text-white":"bg-white"}`}>International</Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <h1 className="font-display font-bold text-[36px] md:text-[48px] leading-[0.9] tracking-tight">All departures —<br/>safe, handcrafted, sisterhood.</h1>
            <p className="mt-4 text-[#3D4A5E] max-w-2xl">Each card shows exact inclusions, hotel category, cancellation slabs, itinerary change policy. No hidden costs. Every departure has a woman trip leader 24x7. Edits from admin appear instantly.</p>

            <div className="mt-10 grid md:grid-cols-2 gap-6">
              {trips.map((trip:any)=>(
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
            </div>
          </div>

          <div className="lg:col-span-4">
            <div id="enquiry" className="sticky top-28">
              <EnquiryForm source="trips_page" />
              <div className="mt-6 rounded-2xl bg-[#13253D] text-white p-5">
                <div className="font-semibold">Why book directly?</div>
                <ul className="mt-3 space-y-2 text-xs text-white/70 leading-relaxed list-disc pl-4">
                  <li>Price guarantee — no OTA commissions hidden</li>
                  <li>Hotel preview timeline in writing</li>
                  <li>Refund 7-10 days, escalation founder level</li>
                  <li>Join WhatsApp community of 12k+ Naaris</li>
                  <li>Edit trips in /admin/trips with photo upload</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
