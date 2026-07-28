import { getMergedTrips, getMergedDestinations } from "@/lib/public-store";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EnquiryForm from "@/components/forms/EnquiryForm";
import Link from "next/link";
import { Clock, Users, MapPin, ShieldCheck, Check, X, AlertTriangle, Hotel, Utensils, Bus, Star } from "lucide-react";

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
  const destinations = getMergedDestinations();
  const trip = trips.find((t:any)=>t.slug===slug);
  if (!trip) return notFound();
  const destination = destinations.find((d:any)=>d.slug===trip.destinationSlug);

  const inclusions = [
    { icon: Hotel, text: "Accommodation - Same hotel for all women, safety audited" },
    { icon: Utensils, text: "Meals: Breakfast daily, 2 dinners (local cuisine by women hosts)" },
    { icon: Bus, text: "Transport: Private tempo traveller / 4x4 with background-checked driver" },
    { icon: ShieldCheck, text: "Women trip leader 24x7, first aid kit, escalation card" },
    { icon: MapPin, text: "All entry fees, permits, inner line permits" },
  ];

  const exclusions = [
    "Personal expenses, shopping",
    "Any meal not mentioned",
    "Adventure insurance (we provide guidance)",
    "Tips (optional, at your discretion)",
    "Anything not in inclusions - no hidden costs guaranteed",
  ];

  const itinerary = [
    { day: 1, title: `Arrival in ${destination?.name} - Sisterhood icebreaker`, desc: `Meet trip leader at airport/station. Transfer to verified stay. Evening briefing: safety SOP, do's & don'ts, emergency contacts. Icebreaker: why you chose to travel fearless.`, meals: ["D"], stay: "Verified 3-star / homestay" },
    { day: 2, title: "Explore local culture with women guides", desc: `Full day sightseeing with local woman guide. Lunch at women-run cafe, artisan workshop. Evening free but trip leader available on WhatsApp + live location group active.`, meals: ["B","D"], stay: "Same hotel" },
    { day: 3, title: "Signature experience + free time by choice", desc: `Morning signature experience (${trip.highlights?.[0]||"Local experience"}). Afternoon free: cafe hopping, shopping with guide list of safe shops. Sunset together.`, meals: ["B"], stay: "Same or move for diversity" },
    { day: 4, title: "Adventure & community giving back", desc: `Adventure activity graded ${trip.difficulty}. Safety gear provided, female instructor where possible. Evening bonfire / folk night, sharing circles.`, meals: ["B","D"], stay: "Unique stay: houseboat/desert camp/homestay" },
    { day: 5, title: "Departure with sisterhood group forever", desc: `Transfer to airport/station. WhatsApp group remains lifetime. Feedback form with escalation awareness. You get referral code for next trip.`, meals: ["B"], stay: "—" },
  ].slice(0, trip.durationDays);

  const hotels = [
    { name: `${destination?.name} Residency (Sample)`, category: trip.comfortLevel==="premium"?"4-star":"3-star comfort", location: destination?.name, amenities: ["Locker", "24x7 reception", "Women floor option", "Early check-in on request"], confirmationTimeline: "Exact name 7 days before via email+WhatsApp" },
    { name: trip.durationDays>3 ? `Heritage Homestay - Women Led (Sample)` : `Cozy Sisterhood Villa`, category: "Women-led homestay", location: destination?.name, amenities: ["Home food option", "Family-like safety", "Local tips"], confirmationTimeline: "Exact name 7 days before" },
  ];

  return (
    <div className="bg-[#FFF8F0]">
      <div className="relative">
        <img src={trip.heroImage} alt={trip.title} className="w-full h-[56vh] md:h-[68vh] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13253D] via-[#13253D]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-[1280px] mx-auto px-4 md:px-8 pb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="pink" className="bg-white/90 backdrop-blur">Women-only</Badge>
            <Badge variant="outline" className="bg-[#13253D]/70 text-white border-white/20 backdrop-blur"><Clock className="w-3 h-3 mr-1" /> {trip.durationDays}D/{trip.durationNights}N</Badge>
            <Badge variant="outline" className="bg-[#13253D]/70 text-white border-white/20 backdrop-blur"><Users className="w-3 h-3 mr-1" /> {trip.groupSizeMin}-{trip.groupSizeMax} women</Badge>
          </div>
          <h1 className="font-display font-bold text-white text-[28px] md:text-[52px] leading-[0.9] max-w-3xl text-balance">{trip.title}</h1>
          <p className="mt-3 text-white/80 max-w-2xl text-[15px] leading-relaxed">{trip.shortDescription}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-1 bg-white text-[#13253D] rounded-full px-3 py-1 text-xs font-bold"><Star className="w-3 h-3 fill-[#FF8A2B] text-[#FF8A2B]" /> {trip.ratingAvg} ({trip.ratingCount})</span>
            <span className="text-white/70 text-xs">Verified stays • Women driver-assisted • Refund transparent</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="rounded-[20px] bg-white border border-[#F1D9D0] p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-widest font-bold text-[#13253D]/50">Starts from</div>
              <div className="flex items-baseline gap-3"><span className="text-2xl font-bold text-[#13253D]">{formatINR(trip.priceFrom)}</span>{trip.priceOriginal && <span className="line-through text-[#13253D]/40">{formatINR(trip.priceOriginal)}</span>}<span className="rounded-full bg-[#FF8A2B] text-white text-[11px] font-bold px-2 py-0.5">Save ₹{trip.priceOriginal ? trip.priceOriginal - trip.priceFrom : 0}</span></div>
              <div className="text-[11px] text-[#3D4A5E] mt-1">Per person, twin sharing • EMI available • No hidden fees</div>
            </div>
            <Link href="#enquiry"><Button size="lg">Check dates →</Button></Link>
          </div>

          <div className="mt-8">
            <h2 className="font-display font-bold text-2xl text-[#13253D]">Why this trip feels different</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {trip.highlights?.map((h:string,i:number)=>(
                <div key={i} className="rounded-xl bg-[#FFF0F4] border border-[#FF4A7D]/15 px-4 py-3 text-[13px] font-medium text-[#5B2063] flex gap-2"><Check className="w-4 h-4 text-[#FF4A7D] mt-0.5 shrink-0" /> {h}</div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="font-display font-bold text-2xl text-[#13253D]">Day-wise sisterhood plan</h2>
            <p className="text-sm text-[#3D4A5E] mt-2">Hotel names confirmed 7 days before. If weather/safety requires change, alternatives provided 12 hours prior — never downgraded at your cost.</p>
            <div className="mt-6 space-y-4">
              {itinerary.map((d)=>(
                <div key={d.day} className="rounded-2xl bg-white border border-[#F1D9D0] p-6 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#13253D] text-white grid place-items-center font-bold text-sm shrink-0">D{d.day}</div>
                  <div>
                    <h3 className="font-semibold text-[#13253D]">{d.title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-[#3D4A5E]">{d.desc}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full bg-[#FFF8F0] border border-[#F1D9D0] px-2.5 py-1">Meals: {d.meals.join(", ")}</span>
                      <span className="rounded-full bg-[#FFF8F0] border border-[#F1D9D0] px-2.5 py-1">Stay: {d.stay}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-[#FFF6EF] border border-[#FF8A2B]/20 p-4 flex gap-3 text-[13px] text-[#3D4A5E]">
              <AlertTriangle className="w-5 h-5 text-[#FF8A2B] shrink-0" />
              <div><strong className="text-[#13253D]">Itinerary change policy:</strong> {trip.itineraryChangePolicy}</div>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6">
              <h3 className="font-semibold flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Inclusions — crystal clear</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex gap-2 text-[13px] text-[#3D4A5E]"><Hotel className="w-4 h-4 text-[#FF4A7D] shrink-0 mt-0.5" /> Accommodation - Same hotel for all women</li>
                <li className="flex gap-2 text-[13px] text-[#3D4A5E]"><Utensils className="w-4 h-4 text-[#FF4A7D] shrink-0 mt-0.5" /> Meals: Breakfast daily + 2 dinners</li>
                <li className="flex gap-2 text-[13px] text-[#3D4A5E]"><Bus className="w-4 h-4 text-[#FF4A7D] shrink-0 mt-0.5" /> Transport verified</li>
                <li className="flex gap-2 text-[13px] text-[#3D4A5E]"><ShieldCheck className="w-4 h-4 text-[#FF4A7D] shrink-0 mt-0.5" /> Women trip leader 24x7</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6">
              <h3 className="font-semibold flex items-center gap-2"><X className="w-4 h-4 text-[#13253D]/50" /> Exclusions — no surprises</h3>
              <ul className="mt-4 space-y-2 text-[13px] text-[#3D4A5E]">
                <li>• Personal expenses</li>
                <li>• Any meal not mentioned</li>
                <li>• Insurance guidance provided</li>
                <li>• Tips optional</li>
              </ul>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="font-display font-bold text-2xl text-[#13253D]">Hotel preview — timeline in writing</h2>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              {hotels.map((h,i)=>(
                <div key={i} className="rounded-2xl bg-white border border-[#F1D9D0] p-5">
                  <div className="flex items-center justify-between"><div className="font-semibold text-sm">{h.name}</div><Badge variant="outline" className="text-[10px]">{h.category}</Badge></div>
                  <div className="text-[12px] text-[#3D4A5E] mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {h.location}</div>
                  <div className="mt-3 flex flex-wrap gap-1.5">{h.amenities.map((a,j)=><span key={j} className="text-[10px] rounded-full bg-[#FFF8F0] border border-[#F1D9D0] px-2 py-1">{a}</span>)}</div>
                  <div className="mt-3 text-[11px] rounded-lg bg-[#FFF0F4] border border-[#FF4A7D]/10 p-2 text-[#5B2063]">🕒 {h.confirmationTimeline}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div id="enquiry" className="sticky top-28">
            <EnquiryForm source={`trip_${trip.slug}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
