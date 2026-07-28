import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { Star, Clock, Users, ShieldCheck, MapPin } from "lucide-react";

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
    ratingAvg?: string;
    ratingCount?: number;
    isFeatured?: boolean;
    groupSizeMax?: number;
  };
}

export default function TripCard({ trip }: TripCardProps) {
  const discount = trip.priceOriginal ? Math.round(((trip.priceOriginal - trip.priceFrom)/trip.priceOriginal)*100) : 0;
  return (
    <Link href={`/trips/${trip.slug}`} className="group block rounded-[24px] bg-white border border-[#F1D9D0] overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={trip.heroImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          {trip.isFeatured && <Badge variant="pink" className="bg-white/90 backdrop-blur">Featured</Badge>}
          <Badge variant="plum" className="bg-[#13253D]/80 text-white backdrop-blur border-white/20"><ShieldCheck className="w-3 h-3 mr-1" /> Women-only</Badge>
        </div>
        <div className="absolute top-3 right-3">
          {discount>0 && <div className="rounded-full bg-[#FF8A2B] text-white text-[11px] font-bold px-3 py-1">SAVE {discount}%</div>}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white text-[12px]">
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur border border-white/20 rounded-full px-2.5 py-1"><Clock className="w-3 h-3" /> {trip.durationDays}D/{trip.durationNights}N</span>
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur border border-white/20 rounded-full px-2.5 py-1"><Users className="w-3 h-3" /> Max {trip.groupSizeMax}</span>
          </div>
          <div className="inline-flex items-center gap-1 bg-white rounded-full px-2.5 py-1 text-[12px] font-bold text-[#13253D]"><Star className="w-3 h-3 fill-[#FF8A2B] text-[#FF8A2B]" /> {trip.ratingAvg} <span className="font-normal opacity-60">({trip.ratingCount})</span></div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-[18px] leading-tight text-[#13253D] group-hover:text-[#FF4A7D] transition-colors line-clamp-2">{trip.title}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[#3D4A5E] line-clamp-2">{trip.shortDescription}</p>
        {trip.highlights && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {trip.highlights.slice(0,3).map((h,i)=>(<span key={i} className="text-[11px] bg-[#FFF8F0] border border-[#F1D9D0] rounded-full px-2.5 py-1 text-[#13253D]/70">{h}</span>))}
          </div>
        )}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest font-bold text-[#13253D]/40">Starts from</div>
            <div className="flex items-baseline gap-2">
              <span className="text-[20px] font-bold text-[#13253D]">{formatINR(trip.priceFrom)}</span>
              {trip.priceOriginal && <span className="text-[13px] line-through text-[#13253D]/40">{formatINR(trip.priceOriginal)}</span>}
            </div>
            <div className="text-[11px] text-[#13253D]/60 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> Hotel revealed 7 days before • Cancellation transparent</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#13253D] text-white grid place-items-center group-hover:bg-[#FF4A7D] transition-colors">→</div>
        </div>
      </div>
    </Link>
  );
}
