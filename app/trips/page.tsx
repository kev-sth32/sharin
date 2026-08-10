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
  if (filter === "domestic") {
    trips = trips.filter((t: any) => !t.isInternational);
  } else if (filter === "international") {
    trips = trips.filter((t: any) => t.isInternational);
  }

  const totalTripsCount = allTrips.length;
  const domesticCount = allTrips.filter((t: any) => !t.isInternational).length;
  const internationalCount = allTrips.filter((t: any) => t.isInternational).length;

  return (
    <div className="bg-[#FFF8F0] min-h-screen">
      {/* Centered Page Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF0F4]/40 to-[#FFF8F0] border-b border-[#F1D9D0]/30 py-10 md:py-14">
        <div className="max-w-[800px] mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#800F2D]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#800F2D] mb-3">
            ✨ Handcrafted Departures
          </div>
          <h1 className="font-display font-[800] text-3xl md:text-4xl lg:text-[44px] leading-[1.15] text-[#13253D] tracking-tight">
            All Departures — safe, handcrafted, sisterhood.
          </h1>
          <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-[#3D4A5E] max-w-xl mx-auto">
            No hidden costs, no scary stays. Each departure has verified stays, background-checked transport, and a female trip leader 24x7.
          </p>

          {/* Navigation Filters */}
          <div className="inline-flex bg-white/80 backdrop-blur-sm border border-[#F1D9D0]/60 p-1 rounded-full shadow-[0_4px_20px_-4px_rgba(128,15,45,0.08)] mt-8">
            <Link 
              href="/trips" 
              className={`rounded-full px-5 py-2 text-xs md:text-sm font-bold transition-all duration-200 ${
                !filter 
                  ? "bg-[#800F2D] text-white shadow-sm" 
                  : "text-[#13253D]/70 hover:text-[#800F2D] hover:bg-[#FFF0F4]/30"
              }`}
            >
              All Trips ({totalTripsCount})
            </Link>
            <Link 
              href="/trips?filter=domestic" 
              className={`rounded-full px-5 py-2 text-xs md:text-sm font-bold transition-all duration-200 ${
                filter === "domestic" 
                  ? "bg-[#800F2D] text-white shadow-sm" 
                  : "text-[#13253D]/70 hover:text-[#800F2D] hover:bg-[#FFF0F4]/30"
              }`}
            >
              Domestic ({domesticCount})
            </Link>
            <Link 
              href="/trips?filter=international" 
              className={`rounded-full px-5 py-2 text-xs md:text-sm font-bold transition-all duration-200 ${
                filter === "international" 
                  ? "bg-[#800F2D] text-white shadow-sm" 
                  : "text-[#13253D]/70 hover:text-[#800F2D] hover:bg-[#FFF0F4]/30"
              }`}
            >
              International ({internationalCount})
            </Link>
          </div>
        </div>
      </section>

      {/* Content Layout */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16 space-y-16">
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
