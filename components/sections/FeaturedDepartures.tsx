import TripCard from "@/components/trip/TripCard";
import { getMergedTrips } from "@/lib/public-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FeaturedDepartures() {
  const allTrips = getMergedTrips();
  const featured = allTrips.filter((t:any) => t.isFeatured);
  return (
    <section className="bg-[#FFF8F0] py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D] mb-4">
            Upcoming Trips
          </div>
          <h2 className="font-display font-[800] text-[36px] md:text-[48px] leading-[1.05] text-[#13253D]">
            Your Next Adventure Starts Here.
          </h2>
          <p className="mt-4 text-[16px] md:text-[17px] leading-relaxed text-[#3D4A5E]">
            Join one of our upcoming departures and explore the world with a community of wonderful women.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((trip:any) => (
            <TripCard key={trip.slug} trip={trip} />
          ))}
          {featured.length===0 && (
            <div className="col-span-3 rounded-3xl bg-white border border-[#F1D9D0] p-12 text-center text-sm text-[#3D4A5E]">
              No upcoming trips found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

