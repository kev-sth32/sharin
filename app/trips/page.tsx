import { getMergedTrips } from "@/lib/public-store";
import TripCard from "@/components/trip/TripCard";
import EnquiryForm from "@/components/forms/EnquiryForm";
import Link from "next/link";

export const metadata = {
  title: "Women-Only Trips - Domestic & International | TripNaari",
  description: "Explore handcrafted women-only trips: Kashmir, Kerala, Meghalaya, Rajasthan, Spiti, Bali. Verified stays, women trip leaders, transparent refunds.",
};

export default async function TripsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams;
  const allTrips = getMergedTrips();
  
  let trips = [...allTrips];
  if (filter === "women-only") trips = trips.filter((t:any)=>t.isWomenOnly);
  if (filter === "weekend") trips = trips.filter((t:any)=>t.durationDays <= 4);
  if (filter === "international") trips = trips.filter((t:any)=> t.isInternational);

  const totalTripsCount = allTrips.length;

  return (
    <div className="bg-[#FFF8F0] min-h-screen">
      {/* Centered Page Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF0F4]/40 to-[#FFF8F0] border-b border-[#F1D9D0]/30 py-16 md:py-24">
        <div className="max-w-[800px] mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#800F2D]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#800F2D] mb-4">
            ✨ Handcrafted Departures
          </div>
          <h1 className="font-display font-[800] text-[40px] md:text-[56px] leading-[1.05] text-[#13253D] tracking-tight">
            All Departures — safe, handcrafted, sisterhood.
          </h1>
          <p className="mt-4 text-[16px] md:text-[18px] leading-relaxed text-[#3D4A5E] max-w-xl mx-auto">
            No hidden costs, no scary stays. Each departure has verified stays, background-checked transport, and an female trip leader 24x7.
          </p>

          {/* Navigation Filters */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Link 
              href="/trips" 
              className={`rounded-full px-6 py-2.5 text-xs font-bold transition-all duration-200 border ${
                !filter 
                  ? "bg-[#800F2D] border-transparent text-white shadow-md hover:bg-[#660C24]" 
                  : "bg-white border-[#F1D9D0] text-[#13253D]/80 hover:bg-[#FFF0F4]/30"
              }`}
            >
              All Trips ({totalTripsCount})
            </Link>
            <Link 
              href="/trips?filter=women-only" 
              className={`rounded-full px-6 py-2.5 text-xs font-bold transition-all duration-200 border ${
                filter === "women-only" 
                  ? "bg-[#FF4A7D] border-transparent text-white shadow-md hover:bg-[#E03A6A]" 
                  : "bg-white border-[#F1D9D0] text-[#13253D]/80 hover:bg-[#FFF0F4]/30"
              }`}
            >
              Women-Only Group
            </Link>
            <Link 
              href="/trips?filter=weekend" 
              className={`rounded-full px-6 py-2.5 text-xs font-bold transition-all duration-200 border ${
                filter === "weekend" 
                  ? "bg-[#FF4A7D] border-transparent text-white shadow-md hover:bg-[#E03A6A]" 
                  : "bg-white border-[#F1D9D0] text-[#13253D]/80 hover:bg-[#FFF0F4]/30"
              }`}
            >
              Weekend 3-4D
            </Link>
            <Link 
              href="/trips?filter=international" 
              className={`rounded-full px-6 py-2.5 text-xs font-bold transition-all duration-200 border ${
                filter === "international" 
                  ? "bg-[#FF4A7D] border-transparent text-white shadow-md hover:bg-[#E03A6A]" 
                  : "bg-white border-[#F1D9D0] text-[#13253D]/80 hover:bg-[#FFF0F4]/30"
              }`}
            >
              International Escapes
            </Link>
          </div>
        </div>
      </section>

      {/* Content Layout */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 space-y-20">
        <div>
          {trips.length === 0 ? (
            <div className="rounded-3xl border border-[#F1D9D0] bg-white p-12 text-center space-y-4 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.04)] max-w-lg mx-auto">
              <div className="text-4xl">🎒</div>
              <h3 className="font-display font-bold text-lg text-[#13253D]">No departures found for this filter</h3>
              <p className="text-sm text-[#3D4A5E] max-w-sm mx-auto">We are launching new destinations soon! Feel free to send an enquiry, and we will notify you first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.map((trip: any) => (
                <TripCard 
                  key={trip.slug} 
                  trip={{
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
                    destinationSlug: trip.destinationSlug,
                  }} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Custom planning CTA block */}
        <section className="rounded-[40px] bg-gradient-to-br from-[#FFF0F4] to-[#FFF8F0] border border-[#FF4A7D]/10 p-8 md:p-16 relative overflow-hidden shadow-[0_15px_45px_-12px_rgba(255,74,125,0.05)]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF4A7D]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF4A7D]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FF4A7D] mb-4">
                  Custom Travel Groups
                </span>
                <h2 className="font-display font-[800] text-3xl md:text-4xl text-[#13253D] leading-tight">
                  Tailor-make your perfect group sisterhood plan.
                </h2>
                <p className="text-sm leading-relaxed text-[#3D4A5E] mt-3">
                  Reunions, corporate escapes, family milestones, or bachelorette getaways. We design audited women-only or customized travel experiences.
                </p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-[#13253D]/80">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white border border-[#F1D9D0] flex items-center justify-center text-[#FF4A7D] text-xs">✓</span>
                  <span>100% Audited Hotels & Checked Drivers</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white border border-[#F1D9D0] flex items-center justify-center text-[#FF4A7D] text-xs">✓</span>
                  <span>Dedicated 24/7 Female Trip Coordinator</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white border border-[#F1D9D0] flex items-center justify-center text-[#FF4A7D] text-xs">✓</span>
                  <span>Flexible Dates & Custom Jain/Vegan Meals</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-[#F1D9D0] shadow-xl">
              <EnquiryForm source="trips_page_footer" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
