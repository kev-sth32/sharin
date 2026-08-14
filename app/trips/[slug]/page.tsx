import { getMergedTrips, getMergedDepartures } from "@/lib/public-store";
import { notFound } from "next/navigation";
import { formatINR, locationMap } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EnquiryForm from "@/components/forms/EnquiryForm";
import BookingWidget from "@/components/trip/BookingWidget";
import Link from "next/link";
import { Clock, Users, MapPin, ShieldCheck, Check, X, AlertTriangle, Hotel, Utensils, Bus, Star, Briefcase, Camera, FileText, Tag } from "lucide-react";
import SafeImage from "@/components/trip/SafeImage";

const getGalleryImages = (trip: any) => {
  const dest = (trip.destinationSlug || "").toLowerCase();
  
  // Custom gallery if provided
  const customGallery = trip.gallery && trip.gallery.length > 0 ? trip.gallery : [];
  
  // Combine hero image and gallery, filter duplicates
  let images = Array.from(new Set([trip.heroImage, ...customGallery].filter(Boolean)));
  
  // Fallbacks for each destination to reach at least 5 images
  const fallbacks: Record<string, string[]> = {
    kashmir: [
      "https://images.unsplash.com/photo-1750846338152-cc2e60bd6fdd?w=800&q=80",
      "https://images.unsplash.com/photo-1771098524443-a8384b118ca5?w=800&q=80",
      "https://images.unsplash.com/photo-1771761597326-a1a418653554?w=800&q=80",
      "https://images.unsplash.com/photo-1670684960824-64378aa634c6?w=800&q=80",
      "https://images.unsplash.com/photo-1731083704547-024b82e8bfef?w=800&q=80"
    ],
    kerala: [
      "https://images.unsplash.com/photo-1742106855258-2d7dd403f84a?w=800&q=80",
      "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80",
      "https://images.unsplash.com/photo-1742106854691-014b06968f74?w=800&q=80",
      "https://images.unsplash.com/photo-1742106856193-5cc3424ac450?w=800&q=80",
      "https://images.unsplash.com/photo-1742106854508-3b9172e52545?w=800&q=80"
    ],
    goa: [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80",
      "https://images.unsplash.com/photo-1473116763269-255415b9ff22?w=800&q=80"
    ],
    himachal: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
      "https://images.unsplash.com/photo-1595815771613-e38f95959446?w=800&q=80",
      "https://images.unsplash.com/photo-1526772661823-3f88f33771cd?w=800&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"
    ],
    meghalaya: [
      "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=800&q=80",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80"
    ],
    rajasthan: [
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80",
      "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80",
      "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80"
    ],
    international: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
      "https://images.unsplash.com/photo-1537953773315-2213cd2709e2?w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80",
      "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=800&q=80"
    ],
    bali: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
      "https://images.unsplash.com/photo-1537953773315-2213cd2709e2?w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80",
      "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=800&q=80"
    ]
  };

  const matchedKey = Object.keys(fallbacks).find((k) => dest.includes(k)) || "kashmir";
  const list = fallbacks[matchedKey];
  
  // Fill up with fallbacks up to 5 unique images
  for (let i = 0; i < list.length && images.length < 5; i++) {
    if (!images.includes(list[i])) {
      images.push(list[i]);
    }
  }
  
  return images.slice(0, 5);
};

const getInclusionIcon = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes("hotel") || t.includes("accommodation") || t.includes("stay") || t.includes("villa") || t.includes("homestay")) return Hotel;
  if (t.includes("meal") || t.includes("food") || t.includes("dinner") || t.includes("breakfast") || t.includes("lunch")) return Utensils;
  if (t.includes("transport") || t.includes("vehicle") || t.includes("bus") || t.includes("tempo") || t.includes("car") || t.includes("cab") || t.includes("flight") || t.includes("train")) return Bus;
  if (t.includes("leader") || t.includes("guide") || t.includes("first aid") || t.includes("safety") || t.includes("audited") || t.includes("support")) return ShieldCheck;
  return MapPin;
};

const getPackingList = (destinationSlug: string) => {
  const dest = (destinationSlug || "").toLowerCase();
  if (dest.includes("kashmir") || dest.includes("himachal") || dest.includes("spiti") || dest.includes("ladakh") || dest.includes("meghalaya") || dest.includes("arunachal")) {
    return {
      disclaimer: "Weather conditions in mountainous regions can drop rapidly. Packing in effective layers is highly recommended:",
      items: [
        "Heavy thermal innerwear (2-3 premium pairs)",
        "Insulated winter jacket / Heavy puffer down coat",
        "Comfortable fleece jackets or thick wool cardigans",
        "Sturdy sports/trekking shoes with solid rubber grips",
        "Woolen beanies, thick gloves, and infinity scarves",
        "High SPF protection sunscreen and moisturizing balms",
        "Personal reusable flask bottle for hot water mix",
        "Photocopies of Govt ID Proofs + Passport Photos",
      ]
    };
  }
  if (dest.includes("goa") || dest.includes("kerala") || dest.includes("bali") || dest.includes("international")) {
    return {
      disclaimer: "Tropical and coastal climates require breathable clothing and sun protection. Packing checklist:",
      items: [
        "Light, breathable cotton or linen clothing",
        "Swimwear / sarong / beach cover-ups",
        "Comfortable walking sandals and light sneakers",
        "Wide-brimmed sun hat or cap",
        "High-quality UV sunglasses",
        "High SPF sunscreen and moisturizing aloe gel",
        "Insect repellent cream or spray",
        "Reusable water bottle & dry bag for island trips",
      ]
    };
  }
  return {
    disclaimer: "Standard packing items for comfortable group travel:",
    items: [
      "Comfortable walking shoes & casual sandals",
      "Light jackets or shrugs for air-conditioned travel/breeze",
      "Personal medications & basic first-aid items",
      "Sunscreen, sunglasses, and cap",
      "Reusable water bottle",
      "Sanitizer & wet wipes",
      "Mobile power bank & chargers",
      "Photocopies of Govt ID Proofs",
    ]
  };
};

const getMoments = (destinationSlug: string, gallery?: string[]) => {
  const dest = (destinationSlug || "").toLowerCase();
  
  // Clean custom gallery
  const customGallery = (gallery || []).filter(Boolean);
  if (customGallery.length >= 4) {
    return customGallery.slice(0, 4);
  }

  const fallbackImages: Record<string, string[]> = {
    kashmir: [
      "https://images.unsplash.com/photo-1750846338152-cc2e60bd6fdd?w=600&q=80",
      "https://images.unsplash.com/photo-1771098524443-a8384b118ca5?w=600&q=80",
      "https://images.unsplash.com/photo-1670684960824-64378aa634c6?w=600&q=80",
      "https://images.unsplash.com/photo-1731083704547-024b82e8bfef?w=600&q=80",
    ],
    kerala: [
      "https://images.unsplash.com/photo-1742106855258-2d7dd403f84a?w=600&q=80",
      "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&q=80",
      "https://images.unsplash.com/photo-1742106854691-014b06968f74?w=600&q=80",
      "https://images.unsplash.com/photo-1742106856193-5cc3424ac450?w=600&q=80",
    ],
    goa: [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80",
    ],
    himachal: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80",
      "https://images.unsplash.com/photo-1595815771613-e38f95959446?w=600&q=80",
      "https://images.unsplash.com/photo-1526772661823-3f88f33771cd?w=600&q=80",
    ],
    meghalaya: [
      "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=600&q=80",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    ],
    rajasthan: [
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80",
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80",
      "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&q=80",
      "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=600&q=80",
    ],
    international: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
      "https://images.unsplash.com/photo-1537953773315-2213cd2709e2?w=600&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
    ],
    bali: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
      "https://images.unsplash.com/photo-1537953773315-2213cd2709e2?w=600&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
    ],
  };

  const matchedKey = Object.keys(fallbackImages).find((k) => dest.includes(k)) || "kashmir";
  const list = fallbackImages[matchedKey];
  const merged = Array.from(new Set([...customGallery, ...list]));
  return merged.slice(0, 4);
};

export async function generateStaticParams() {
  const trips = getMergedTrips();
  return trips.map((t:any)=>({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trips = getMergedTrips();
  const trip = trips.find((t:any)=>t.slug===slug);
  if (!trip) return {};
  return {
    title: `${trip.title} - Women Only Trip | TripNaari`,
    description: trip.shortDescription,
  };
}

export default async function TripDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trips = getMergedTrips();
  const trip = trips.find((t:any)=>t.slug===slug);
  if (!trip) return notFound();
  const destinationName = trip.destinationSlug ? (locationMap[trip.destinationSlug] || "India").split(",")[0] : "India";

  const allDepartures = getMergedDepartures();
  const tripDepartures = allDepartures
    .filter((d: any) => d.tripSlug === slug)
    .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const inclusions = trip.inclusions && trip.inclusions.length > 0 ? trip.inclusions : [
    { icon: Hotel, text: "Accommodation - Same hotel for all women, safety audited" },
    { icon: Utensils, text: "Meals: Breakfast daily, 2 dinners (local cuisine by women hosts)" },
    { icon: Bus, text: "Transport: Private tempo traveller / 4x4 with background-checked driver" },
    { icon: ShieldCheck, text: "Women trip leader 24x7, first aid kit, escalation card" },
    { icon: MapPin, text: "All entry fees, permits, inner line permits" },
  ];

  const exclusions = trip.exclusions && trip.exclusions.length > 0 ? trip.exclusions : [
    "Personal expenses, shopping",
    "Any meal not mentioned",
    "Adventure insurance (we provide guidance)",
    "Tips (optional, at your discretion)",
    "Anything not in inclusions - no hidden costs guaranteed",
  ];

  const defaultItinerary = [
    { day: 1, title: `Arrival in ${destinationName} - Sisterhood icebreaker`, desc: `Meet trip leader at airport/station. Transfer to verified stay. Evening briefing: safety SOP, do's & don'ts, emergency contacts. Icebreaker: why you chose to travel fearless.`, meals: ["D"], stay: "Verified 3-star / homestay" },
    { day: 2, title: "Explore local culture with women guides", desc: `Full day sightseeing with local woman guide. Lunch at women-run cafe, artisan workshop. Evening free but trip leader available on WhatsApp + live location group active.`, meals: ["B","D"], stay: "Same hotel" },
    { day: 3, title: "Signature experience + free time by choice", desc: `Morning signature experience (${trip.highlights?.[0]||"Local experience"}). Afternoon free: cafe hopping, shopping with guide list of safe shops. Sunset together.`, meals: ["B"], stay: "Same or move for diversity" },
    { day: 4, title: "Adventure & community giving back", desc: `Adventure activity graded ${trip.difficulty}. Safety gear provided, female instructor where possible. Evening bonfire / folk night, sharing circles.`, meals: ["B","D"], stay: "Unique stay: houseboat/desert camp/homestay" },
    { day: 5, title: "Departure with sisterhood group forever", desc: `Transfer to airport/station. WhatsApp group remains lifetime. Feedback form with escalation awareness. You get referral code for next trip.`, meals: ["B"], stay: "—" },
  ].slice(0, trip.durationDays);

  const itinerary = trip.itinerary && trip.itinerary.length > 0 ? trip.itinerary : defaultItinerary;

  const defaultHotels = [
    { name: `${destinationName} Residency (Sample)`, category: trip.comfortLevel==="premium"?"4-star":"3-star comfort", location: destinationName, amenities: ["Locker", "24x7 reception", "Women floor option", "Early check-in on request"], confirmationTimeline: "Exact name 7 days before via email+WhatsApp" },
    { name: trip.durationDays>3 ? `Heritage Homestay - Women Led (Sample)` : `Cozy Sisterhood Villa`, category: "Women-led homestay", location: destinationName, amenities: ["Home food option", "Family-like safety", "Local tips"], confirmationTimeline: "Exact name 7 days before" },
  ];

  const hotels = trip.hotels && trip.hotels.length > 0 ? trip.hotels : defaultHotels;

  const packingInfo = {
    disclaimer: trip.packingDisclaimer || getPackingList(trip.destinationSlug || "").disclaimer,
    items: trip.packingItems && trip.packingItems.length > 0 ? trip.packingItems : getPackingList(trip.destinationSlug || "").items,
  };

  const momentsList = trip.momentsGallery && trip.momentsGallery.length > 0 ? trip.momentsGallery : getMoments(trip.destinationSlug || "", trip.gallery);

  const defaultSlabs = [
    { window: "30 Days or more before departure date", refund: "100% Refund", terms: "Full amount refunded back to source account. No hidden penalties." },
    { window: "Between 15 to 30 Days before departure date", refund: "50% Refund", terms: "Half package cost refunded or 80% dynamic rollover credit voucher provided." },
    { window: "Between 7 to 14 Days before departure date", refund: "25% Refund", terms: "Quarterly package cost returned. Operational logistics fees apply." },
    { window: "Less than 7 Days before departure date", refund: "No Refund (0%)", terms: "Strictly non-refundable due to advance mountain vehicle and hotel bookings." }
  ];
  const cancellationSlabs = trip.cancellationSlabs && trip.cancellationSlabs.length > 0 ? trip.cancellationSlabs : defaultSlabs;

  const defaultSpecialNotes = "Permit application processing tokens, special high altitude entry clearances, and customized border transit passes are fully non-refundable once initiated by state regulators. In instances of unexpected road blockages, landslides, natural emergencies, or severe snowfall restrictions, preventing entry past critical checkpoints, alternate valley exploration circuits will be systematically organized by TripNaari coordinators; direct payment cash disbursements cannot be processed under state-leased environmental restrictions.";
  const cancellationSpecialNotes = trip.cancellationSpecialNotes || defaultSpecialNotes;

  const galleryImages = getGalleryImages(trip);
  const durationLabel = `${trip.durationDays} Days / ${trip.durationNights} Nights`;
  const routeLabel = trip.destinationSlug ? (locationMap[trip.destinationSlug] || "India").split(",")[0] : "India";
  const paceLabel = trip.difficulty === "easy" ? "Easy Pace" : trip.difficulty === "moderate" ? "Moderate Pace" : "Adventure Pace";

  return (
    <div className="bg-[#FFF8F0] min-h-screen">
      
      {/* Clean Modern Header Section */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-8 pb-2">
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <Badge variant="outline" className="bg-white border-[#F1D9D0] text-[#13253D]/80 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#FF4A7D]" />
            <span>{durationLabel}</span>
          </Badge>
          <Badge variant="outline" className="bg-white border-[#F1D9D0] text-[#13253D]/80 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#FF4A7D]" />
            <span>{routeLabel}</span>
          </Badge>
          <Badge variant="outline" className="bg-[#FFF0F4] border-[#FF4A7D]/20 text-[#FF4A7D] text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            <span>{paceLabel}</span>
          </Badge>
        </div>

        <h1 className="font-display font-[800] text-3xl md:text-5xl text-[#13253D] tracking-tight text-balance">
          {trip.title}
        </h1>
        
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 bg-[#FF8A2B]/10 text-[#FF8A2B] rounded-full px-3 py-1 text-xs font-bold shadow-sm">
            <Star className="w-3.5 h-3.5 fill-[#FF8A2B] text-[#FF8A2B]" />
            <span>{trip.ratingAvg}</span>
            <span className="text-[#13253D]/50 font-normal">({trip.ratingCount || 120} reviews)</span>
          </span>
          <span className="text-[#3D4A5E]/60 text-[11px] font-bold tracking-wider uppercase">
            Verified Stays • Women Drivers • Refund Transparent
          </span>
        </div>

        {/* Asymmetric Gallery Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left Column - 1 Large Highlight Image */}
          <div className="lg:col-span-3">
            <SafeImage 
              src={galleryImages[0]} 
              alt={`${trip.title} Main View`} 
              containerClassName="overflow-hidden rounded-[24px] border border-[#F1D9D0]/50 h-full aspect-[16/10] lg:aspect-auto lg:h-[450px] shadow-sm relative group bg-[#FFF8F0]"
              imageClassName="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Right Column - 2x2 Grid of 4 Smaller Images */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((idx) => {
              const imgUrl = galleryImages[idx + 1];
              return (
                <SafeImage 
                  key={idx}
                  src={imgUrl} 
                  alt={`${trip.title} Detail View ${idx + 1}`} 
                  containerClassName="overflow-hidden rounded-[24px] border border-[#F1D9D0]/50 aspect-[4/3] lg:h-[217px] shadow-sm relative group bg-[#FFF8F0]"
                  imageClassName="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10 min-w-0">
          
          {/* Booking Widget replacing old departures/pricing cards */}
          <BookingWidget
            priceFrom={trip.priceFrom}
            priceOriginal={trip.priceOriginal}
            departures={tripDepartures}
            tripSlug={trip.slug}
            tripTitle={trip.title}
            itineraryPdf={trip.itineraryPdf}
          />

          {/* Highlights */}
          <div className="space-y-4">
            <h2 className="font-display font-[800] text-2xl text-[#13253D]">Why this trip feels different</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {trip.highlights?.map((h: string, i: number) => (
                <div key={i} className="rounded-2xl bg-white border border-[#F1D9D0] px-5 py-4 text-[14px] font-semibold text-[#13253D] flex gap-3 shadow-[0_8px_25px_-5px_rgba(19,37,61,0.03)]">
                  <Check className="w-5 h-5 text-[#FF4A7D] shrink-0 mt-0.5 stroke-[3]" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Itinerary & Info Sections */}
          <div className="space-y-10">
            {/* Day wise plan */}
            <div className="space-y-6">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h2 className="font-display font-[800] text-2xl text-[#13253D]">Day-wise sisterhood plan</h2>
                  <p className="text-sm text-[#3D4A5E] mt-2">Hotel names confirmed 7 days before. If weather/safety requires change, alternatives provided 12 hours prior.</p>
                </div>
              </div>
              <div className="relative border-l-2 border-dashed border-[#FF4A7D]/30 ml-6 pl-8 space-y-8 py-2">
                {itinerary.map((d: any) => (
                  <div key={d.day} className="relative rounded-3xl bg-white border border-[#F1D9D0] p-6 flex gap-5 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.04)]">
                    {/* Timeline Node dot */}
                    <div className="absolute -left-[41px] top-[40px] w-4 h-4 rounded-full bg-[#FF4A7D] border-4 border-white shadow-sm" />
                    
                    <div className="w-12 h-12 rounded-2xl bg-[#FF4A7D] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                      D{d.day}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display font-bold text-lg text-[#13253D]">{d.title}</h3>
                      <p className="text-[14px] leading-relaxed text-[#3D4A5E]">{d.desc}</p>
                      <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-bold">
                        <span className="rounded-full bg-[#FFF8F0] border border-[#F1D9D0] px-3 py-1 text-[#13253D]/70 uppercase tracking-wide">Meals: {d.meals.join(", ")}</span>
                        <span className="rounded-full bg-[#FFF8F0] border border-[#F1D9D0] px-3 py-1 text-[#13253D]/70 uppercase tracking-wide">Stay: {d.stay}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-[#FFF6EF] border border-[#FF8A2B]/20 p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center text-[13px] text-[#3D4A5E]">
                <div className="flex items-center gap-3 shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[#FF8A2B]" />
                  <strong className="text-[#13253D] font-bold sm:hidden">Itinerary change policy</strong>
                </div>
                <div>
                  <strong className="text-[#13253D] hidden sm:block mb-1 font-bold">Itinerary change policy</strong>
                  {trip.itineraryChangePolicy}
                </div>
              </div>
            </div>

            {/* Inclusions / Exclusions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-white border border-[#F1D9D0] p-6 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.04)]">
                <h3 className="font-display font-bold text-lg flex items-center gap-2 text-[#13253D] border-b border-[#F1D9D0]/50 pb-3 mb-4">
                  <Check className="w-5 h-5 text-green-600 stroke-[3]" /> Inclusions — crystal clear
                </h3>
                <ul className="space-y-4">
                  {inclusions.map((inc: any, index: number) => {
                    const IconComponent = typeof inc === "object" ? inc.icon : getInclusionIcon(inc);
                    const text = typeof inc === "object" ? inc.text : inc;
                    return (
                      <li key={index} className="flex gap-3 text-[13px] text-[#3D4A5E] font-medium">
                        <IconComponent className="w-4 h-4 text-[#FF4A7D] shrink-0 mt-0.5" />
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="rounded-3xl bg-white border border-[#F1D9D0] p-6 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.04)]">
                <h3 className="font-display font-bold text-lg flex items-center gap-2 text-[#13253D] border-b border-[#F1D9D0]/50 pb-3 mb-4">
                  <X className="w-5 h-5 text-red-500 stroke-[3]" /> Exclusions — no surprises
                </h3>
                <ul className="space-y-3 text-[13px] text-[#3D4A5E] font-medium">
                  {exclusions.map((exc: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span>•</span>
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Things to Pack */}
            <div className="rounded-3xl bg-white border border-[#F1D9D0] p-6 md:p-8 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.04)] space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF4A7D]/10 flex items-center justify-center text-[#FF4A7D]">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-display font-[800] text-xl text-[#13253D]">
                  Things to Pack
                </h3>
              </div>
              <p className="text-xs text-[#3D4A5E] leading-relaxed">
                {packingInfo.disclaimer}
              </p>
              <div className="grid sm:grid-cols-2 gap-4 bg-[#FFF8F0]/30 rounded-2xl border border-[#F1D9D0]/50 p-5">
                {packingInfo.items.map((item: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 text-[13px] text-[#3D4A5E] font-semibold">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FF4A7D]/10 text-[#FF4A7D] shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Moments From Our Previous Trips */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF4A7D]/10 flex items-center justify-center text-[#FF4A7D]">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="font-display font-[800] text-xl text-[#13253D]">
                  Moments From Our Previous Trips
                </h3>
              </div>
              <p className="text-xs text-[#3D4A5E]">
                Here is a glimpse of the laughs, sisterhood bonds, and adventures shared by our previous travel communities across these scenic trails.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((idx) => {
                  const img = momentsList[idx];
                  return (
                    <SafeImage 
                      key={idx}
                      src={img} 
                      alt={`Sisterhood Moment ${idx + 1}`} 
                      containerClassName="overflow-hidden rounded-2xl border border-[#F1D9D0] aspect-square shadow-sm group bg-[#FFF8F0]"
                      imageClassName="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  );
                })}
              </div>
            </div>

            {/* Booking & Cancellation Policy */}
            <div className="rounded-3xl bg-white border border-[#F1D9D0] p-6 md:p-8 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.04)] space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF4A7D]/10 flex items-center justify-center text-[#FF4A7D]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-[800] text-xl text-[#13253D]">
                    Booking & Cancellation Policy
                  </h3>
                  <p className="text-xs text-[#3D4A5E] mt-1">
                    Please carefully review our timeline-based cancellation schedule and refund distribution metrics detailed below before finalizing your slot registration.
                  </p>
                </div>
              </div>

              {/* Policy Table */}
              <div className="overflow-x-auto rounded-2xl border border-[#F1D9D0]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FFF8F0] border-b border-[#F1D9D0] text-[#13253D] font-bold">
                      <th className="p-3">Cancellation Timeline Window</th>
                      <th className="p-3 text-center">Refund Percentage</th>
                      <th className="p-3">Applicable Deduction / Policy Terms</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1D9D0]/50 text-[#3D4A5E]">
                    {cancellationSlabs.map((slab: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#FFF8F0]/10">
                        <td className="p-3 font-semibold text-[#13253D]">{slab.window}</td>
                        <td className={`p-3 text-center font-bold ${
                          slab.refund.includes("100%") || slab.refund.includes("90%") ? "text-green-600" :
                          slab.refund.includes("50%") ? "text-[#FF8A2B]" :
                          slab.refund.includes("25%") || slab.refund.includes("30%") ? "text-[#FF4A7D]" :
                          "text-red-500"
                        }`}>{slab.refund}</td>
                        <td className="p-3">{slab.terms}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Special Policy Notes */}
              <div className="rounded-2xl bg-[#FFF0F4] border border-[#FF4A7D]/10 p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#800F2D]">
                  <span>⚠️</span>
                  <span>Special Policy Notes</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#800F2D]/90">
                  {cancellationSpecialNotes}
                </p>
              </div>
            </div>

            {/* Hotel Previews */}
            <div className="space-y-6">
              <h2 className="font-display font-[800] text-2xl text-[#13253D]">Hotel preview — timeline in writing</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {hotels.map((h: any, i: number) => (
                  <div key={i} className="rounded-3xl bg-white border border-[#F1D9D0] p-6 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.04)] flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="font-display font-bold text-base text-[#13253D] leading-tight">{h.name}</div>
                        <Badge variant="plum" className="bg-[#5B2063]/10 text-[#5B2063] border-none text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 shrink-0">{h.category}</Badge>
                      </div>
                      <div className="text-[12px] text-[#3D4A5E] mt-2 flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#FF4A7D]" /> {h.location}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {h.amenities.map((a: any, j: number) => (
                          <span key={j} className="text-[10px] font-bold rounded-full bg-[#FFF8F0] border border-[#F1D9D0] px-2.5 py-1 text-[#13253D]/70 uppercase tracking-wide">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 text-[11px] font-semibold rounded-xl bg-[#FFF0F4] border border-[#FF4A7D]/10 p-3 text-[#800F2D] flex items-center gap-1.5">
                      <span>🕒</span> <span>{h.confirmationTimeline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Sticky Sidebar */}
        <div className="lg:col-span-4 min-w-0">
          <div id="enquiry" className="sticky top-28">
            <EnquiryForm source={`trip_${trip.slug}`} defaultDestination={trip.slug} />
          </div>
        </div>
      </div>
    </div>

  );
}
