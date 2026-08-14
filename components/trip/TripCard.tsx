import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatINR, locationMap } from "@/lib/utils";
import { MapPin } from "lucide-react";

export interface TripCardProps {
  trip: {
    slug: string;
    title: string;
    shortDescription: string;
    durationDays: number;
    durationNights: number;
    priceFrom: number;
    priceOriginal?: number;
    heroImage?: string;
    highlights?: string[];
    isFeatured?: boolean;
    destinationSlug?: string;
    ratingAvg?: string;
    ratingCount?: number;
    groupSizeMax?: number;
    locationLabel?: string;
    badgeText?: string;
  };
}




export default function TripCard({ trip }: TripCardProps) {

  const locationName = (trip as any).locationLabel || (trip.destinationSlug ? (locationMap[trip.destinationSlug] || "India") : "India");
  const badgeText = (trip as any).badgeText;
  const showBadge = badgeText !== "none";
  const displayBadgeText = badgeText || (trip.isFeatured ? "Popular" : "Selling Fast");
  const isPopular = displayBadgeText.toLowerCase() === "popular";

  return (
    <Link href={`/trips/${trip.slug}`} className="group block rounded-3xl bg-white border border-[#F1D9D0] overflow-hidden shadow-[0_10px_35px_-8px_rgba(19,37,61,0.06)] hover:shadow-[0_20px_50px_-10px_rgba(255,74,125,0.12)] transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={trip.heroImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"} 
          alt={trip.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        {showBadge && (
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="pink" className="bg-[#FF4A7D] text-white border-none text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 shadow-sm">
              {displayBadgeText}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Location & Details */}
        <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-[#FF4A7D] uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-[#FF4A7D]" />
          <span>{locationName}</span>
        </div>

        {/* Title */}
        <h3 className="font-display font-[800] text-[21px] leading-[1.2] text-[#13253D] group-hover:text-[#FF4A7D] transition-colors line-clamp-1">
          {trip.title}
        </h3>

        {/* Short description / line */}
        <p className="text-[14px] leading-relaxed text-[#3D4A5E] line-clamp-2">
          {trip.shortDescription}
        </p>

        {/* Duration */}
        <div className="text-[12px] font-bold text-[#13253D]/80 bg-[#FFF8F0] border border-[#F1D9D0]/60 rounded-full px-4 py-1.5 inline-block">
          {trip.durationDays} Days / {trip.durationNights} Nights
        </div>

        {/* Price & Button */}
        <div className="pt-4 flex items-center justify-between border-t border-[#F1D9D0]/50">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-extrabold text-[#13253D]/40">
              Starts at
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-[900] text-[#13253D]">
                {formatINR(trip.priceFrom)}
              </span>
              {trip.priceOriginal && (
                <span className="text-[13px] line-through text-[#3D4A5E]/50 font-medium">
                  {formatINR(trip.priceOriginal)}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-full bg-[#FF4A7D] group-hover:bg-[#800F2D] text-white text-[12px] font-bold px-5 py-2.5 shadow-md transition-all duration-300">
            View Details
          </div>
        </div>
      </div>
    </Link>
  );
}

