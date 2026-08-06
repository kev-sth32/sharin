import { getMergedTrips, getMergedDepartures } from "@/lib/public-store";
import { notFound } from "next/navigation";
import { formatINR, locationMap } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EnquiryForm from "@/components/forms/EnquiryForm";
import Link from "next/link";
import { Clock, Users, MapPin, ShieldCheck, Check, X, AlertTriangle, Hotel, Utensils, Bus, Star } from "lucide-react";
import LeadGate from "@/components/trip/LeadGate";

const getInclusionIcon = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes("hotel") || t.includes("accommodation") || t.includes("stay") || t.includes("villa") || t.includes("homestay")) return Hotel;
  if (t.includes("meal") || t.includes("food") || t.includes("dinner") || t.includes("breakfast") || t.includes("lunch")) return Utensils;
  if (t.includes("transport") || t.includes("vehicle") || t.includes("bus") || t.includes("tempo") || t.includes("car") || t.includes("cab") || t.includes("flight") || t.includes("train")) return Bus;
  if (t.includes("leader") || t.includes("guide") || t.includes("first aid") || t.includes("safety") || t.includes("audited") || t.includes("support")) return ShieldCheck;
  return MapPin;
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

  return (
    <div className="bg-[#FFF8F0] min-h-screen">
      {/* Cover Banner */}
      <div className="relative h-[55vh] md:h-[65vh] overflow-hidden bg-[#6a0c24] text-white">
        <img 
          src={trip.heroImage} 
          alt={trip.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-35" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#4A0516] via-[#6D0C24]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-[1280px] mx-auto px-4 md:px-8 pb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="pink" className="bg-[#FF4A7D] text-white border-none text-[10px] font-bold px-3 py-1 shadow-sm">
              Women-only
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-sm text-[10px] font-bold px-3 py-1">
              <Clock className="w-3 h-3 mr-1" /> {trip.durationDays}D/{trip.durationNights}N
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-sm text-[10px] font-bold px-3 py-1">
              <Users className="w-3 h-3 mr-1" /> {trip.groupSizeMin}-{trip.groupSizeMax} women
            </Badge>
          </div>
          <h1 className="font-display font-[800] text-[32px] md:text-[52px] leading-[1.05] text-white max-w-3xl text-balance">
            {trip.title}
          </h1>
          <p className="mt-4 text-white/80 max-w-2xl text-[15px] md:text-[16px] leading-relaxed">
            {trip.shortDescription}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-1 bg-white text-[#13253D] rounded-full px-3 py-1 text-xs font-bold shadow-sm">
              <Star className="w-3 h-3 fill-[#FF8A2B] text-[#FF8A2B]" /> {trip.ratingAvg} ({trip.ratingCount})
            </span>
            <span className="text-white/70 text-[12px] font-semibold tracking-wide uppercase">
              Verified Stays • Women Drivers • Refund Transparent
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          
          {/* Price Overview Card */}
          <div className="rounded-3xl bg-white border border-[#F1D9D0] p-6 md:p-8 flex flex-wrap items-center justify-between gap-6 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.05)]">
            <div>
              <div className="text-[11px] uppercase tracking-widest font-bold text-[#13253D]/50">Starts from</div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-[800] text-[#13253D]">{formatINR(trip.priceFrom)}</span>
                {trip.priceOriginal && (
                  <span className="line-through text-lg text-[#13253D]/40">{formatINR(trip.priceOriginal)}</span>
                )}
                <span className="rounded-full bg-[#FF4A7D] text-white text-[11px] font-bold px-3 py-1 shadow-sm">
                  Save ₹{trip.priceOriginal ? trip.priceOriginal - trip.priceFrom : 0}
                </span>
              </div>
              <div className="text-[12px] text-[#3D4A5E] mt-2 font-medium">Per person, twin sharing • EMI options • No hidden fees</div>
            </div>
            <Link href="#enquiry">
              <Button size="lg" className="bg-[#FF4A7D] hover:bg-[#E63E6E] text-white rounded-full font-bold px-8 shadow-md">
                Check dates →
              </Button>
            </Link>
          </div>

          {/* Group Departures Card */}
          <div className="rounded-3xl bg-white border border-[#F1D9D0] p-6 md:p-8 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.05)]">
            <h2 className="font-display font-[800] text-xl md:text-2xl text-[#13253D] mb-6">Upcoming Group Departures</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F1D9D0]/70 text-left text-xs uppercase text-[#3D4A5E]/70">
                    <th className="pb-3 pr-4 font-bold tracking-wider">Dates</th>
                    <th className="pb-3 px-4 font-bold tracking-wider text-center">Status</th>
                    <th className="pb-3 px-4 font-bold tracking-wider text-center">Seats Booked</th>
                    <th className="pb-3 px-4 font-bold tracking-wider text-right">Price</th>
                    <th className="pb-3 pl-4 font-bold tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1D9D0]/40">
                  {tripDepartures.map((d: any) => {
                    const startDateFormatted = new Date(d.startDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' });
                    const endDateFormatted = new Date(d.endDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });
                    return (
                      <tr key={d.id} className="text-[13px] text-[#13253D]">
                        <td className="py-4 pr-4 font-medium">
                          <span className="block font-bold text-sm text-[#13253D]">{startDateFormatted} — {endDateFormatted}</span>
                          {d.isGuaranteed && (
                            <span className="mt-1 inline-flex items-center gap-0.5 rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 border border-green-200 uppercase tracking-wide">
                              Guaranteed Departure
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase ${
                            d.status === "filling_fast" ? "bg-[#FFF0F4] text-[#FF4A7D]" :
                            d.status === "sold_out" ? "bg-gray-100 text-gray-500" :
                            d.status === "cancelled" ? "bg-red-50 text-red-600" :
                            "bg-green-50 text-green-700"
                          }`}>{d.status.replace("_", " ")}</span>
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-sm">
                          {d.seatsBooked} / {d.seatsTotal}
                        </td>
                        <td className="py-4 px-4 font-bold text-right text-sm text-[#13253D]">
                          {formatINR(d.price || trip.priceFrom)}
                        </td>
                        <td className="py-4 pl-4 text-right">
                          {d.status === "sold_out" || d.status === "cancelled" ? (
                            <span className="inline-block rounded-full bg-gray-100 text-gray-400 px-4 py-2 text-xs font-bold cursor-not-allowed">
                              Closed
                            </span>
                          ) : (
                            <Link href={`?date=${d.startDate}#enquiry`} className="inline-block rounded-full bg-[#13253D] hover:bg-[#FF4A7D] text-white px-5 py-2 text-xs font-bold transition-colors shadow-sm">
                              Enquire →
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {tripDepartures.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#3D4A5E] text-sm font-medium">
                        No scheduled departures at the moment. Please request your preferred dates.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

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

          <LeadGate tripTitle={trip.title} />

          <div id="trip-details-content" className="space-y-10">

          {/* Day wise plan */}
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-[800] text-2xl text-[#13253D]">Day-wise sisterhood plan</h2>
              <p className="text-sm text-[#3D4A5E] mt-2">Hotel names confirmed 7 days before. If weather/safety requires change, alternatives provided 12 hours prior.</p>
            </div>
            <div className="space-y-6">
              {itinerary.map((d: any) => (
                <div key={d.day} className="rounded-3xl bg-white border border-[#F1D9D0] p-6 flex gap-5 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.04)]">
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
            <div className="rounded-2xl bg-[#FFF6EF] border border-[#FF8A2B]/20 p-5 flex gap-3.5 text-[13px] text-[#3D4A5E]">
              <AlertTriangle className="w-5 h-5 text-[#FF8A2B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#13253D] block mb-1">Itinerary change policy</strong>
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

          </div> {/* #trip-details-content */}

        </div>

        {/* Right Sticky Sidebar */}
        <div className="lg:col-span-4">
          <div id="enquiry" className="sticky top-28">
            <EnquiryForm source={`trip_${trip.slug}`} defaultDestination={trip.slug} />
          </div>
        </div>
      </div>
    </div>

  );
}
