import fs from "fs";
import path from "path";
import { tripPackagesSeed, testimonialsSeed, tripLeadersSeed, faqsSeed, blogSeed } from "./data";

function readFile(name: string, fallback: any[] = []) {
  const dataDir = path.join(process.cwd(), ".data");
  const fp = path.join(dataDir, name);
  if (!fs.existsSync(fp)) return fallback;
  try { return JSON.parse(fs.readFileSync(fp, "utf-8")); } catch { return fallback; }
}

export function getMergedTrips() {
  const overrides = readFile("trips_overrides.json", []);
  const custom = readFile("trips_custom.json", []);
  const merged = [
    ...tripPackagesSeed.map((t: any) => {
      const over = overrides.find((o: any) => o.slug === t.slug);
      if (over?.isDeleted) return null as any;
      return over ? { ...t, ...over } : t;
    }).filter(Boolean),
    ...custom
  ];
  // filter out deleted/in unpublished for public
  return merged.filter((t: any)=>t.isPublished!==false);
}

export function getAllTripsForAdmin() {
  const overrides = readFile("trips_overrides.json", []);
  const custom = readFile("trips_custom.json", []);
  return [
    ...tripPackagesSeed.map((t: any) => {
      const over = overrides.find((o: any) => o.slug === t.slug);
      return over ? { ...t, ...over } : t;
    }),
    ...custom
  ];
}


export function getMergedTestimonials() {
  const overrides = readFile("testimonials_overrides.json", []);
  const all = [
    ...testimonialsSeed.map((t:any,i:number)=>({ id: 1000+i, isApproved: true, isFeatured: true, ...t })),
    ...overrides
  ];
  return all.filter((t:any)=>t.isApproved!==false);
}

export function getMergedLeaders() {
  const overrides = readFile("leaders_overrides.json", []);
  const custom = readFile("leaders_custom.json", []);
  return [
    ...tripLeadersSeed.map((l:any)=>{ const over = overrides.find((o:any)=>o.slug===l.slug); return over?{...l,...over}:l; }),
    ...custom
  ];
}

export function getCustomBlogs() {
  const custom = readFile("blogs_custom.json", []);
  return [...blogSeed, ...custom];
}

export function getMergedBlogs() {
  return getCustomBlogs();
}

export function getMergedDepartures() {
  const departures = readFile("departures.json", []);
  if (departures.length === 0 && tripPackagesSeed.length > 0) {
    const today = new Date();
    const list: any[] = [];
    let idCounter = 1;
    tripPackagesSeed.forEach((t: any) => {
      const start1 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const end1 = new Date(start1.getTime() + t.durationDays * 24 * 60 * 60 * 1000);
      const start2 = new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000);
      const end2 = new Date(start2.getTime() + t.durationDays * 24 * 60 * 60 * 1000);
      
      list.push({
        id: idCounter++,
        tripSlug: t.slug,
        startDate: start1.toISOString().slice(0, 10),
        endDate: end1.toISOString().slice(0, 10),
        seatsTotal: 14,
        seatsBooked: 8,
        price: t.priceFrom,
        status: "open",
        isGuaranteed: false
      });
      list.push({
        id: idCounter++,
        tripSlug: t.slug,
        startDate: start2.toISOString().slice(0, 10),
        endDate: end2.toISOString().slice(0, 10),
        seatsTotal: 16,
        seatsBooked: 14,
        price: t.priceFrom,
        status: "filling_fast",
        isGuaranteed: true
      });
    });
    return list;
  }
  return departures;
}

export function getSettings() {
  const settings = readFile("settings.json", []);
  if (!settings || Array.isArray(settings) || typeof settings !== "object") {
    return {
      marqueeText: "🎉 Limited Offer: Get ₹2,000 Off on your first booking! Code: SISTERHOOD2000 • Group Discount: Book for 4 or more girls and get extra ₹1,500 off per person! • Book early and secure your slot with just ₹5,000 token amount!"
    };
  }
  return settings;
}

export function getHomepageGallery() {
  const custom = readFile("homepage_gallery.json", []);
  if (!custom || custom.length === 0) {
    return [
      {
        src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
        alt: "Ocean beach waves"
      },
      {
        src: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
        alt: "Travel camera map"
      },
      {
        src: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80",
        alt: "Palm tree beach"
      },
      {
        src: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600&q=80",
        alt: "Alleyway walking"
      },
      {
        src: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80",
        alt: "Waterfalls and mountains"
      },
      {
        src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
        alt: "Lake and boats"
      }
    ];
  }
  return custom;
}

export function getMergedFAQs() {
  const faqs = readFile("faqs.json", []);
  if (faqs.length === 0) {
    const seedWithIds = faqsSeed.map((f: any, idx: number) => ({
      id: idx + 1,
      ...f
    }));
    return seedWithIds;
  }
  return faqs;
}

export function getMergedPolicies() {
  const policies = readFile("policies.json", []);
  if (policies.length === 0) {
    const seed = [
      {
        slug: "cancellation-refund",
        title: "Cancellation & Refund Policy - Transparent & Time-bound",
        version: "2.1",
        updated: "15 Jan 2026",
        body: `## Our philosophy\nWe keep policies human. Life happens. We'd rather give you credit you can use with a sister than hold money.\n\n## Slabs\n- 30+ days before departure: 90% refund to source + 10% retained as processing\n- 15-29 days: 50% refund + 50% credit valid 12 months, transferable to another Naari\n- 7-14 days: 30% refund + 50% credit\n- Less than 7 days: No refund but 70% credit, transferable\n- Less than 48 hours / No-show: No refund, credit case-by-case for emergency with proof\n\n## Timeline\nRefund processed in 7-10 working days to original payment method. Credit issued instantly via code emailed+WhatsApp.\n\n## If TripNaari cancels\nIf we cancel due to safety, political unrest, weather, low group size below 6 — you get choice: move to next date with free upgrade, or 100% refund + 10% credit as apology.\n\n## Hotel change\nIf hotel name shared 7 days before changes after, upgrade at our cost OR 50% of one night refund if same category but different property.\n\n## How to request\nUse Refund form on contact page, or email refunds@tripnaari.com with booking ID. We acknowledge in 24 hours, resolve in 5 days.\n\n## Version history\nv2.1 updated Jan 2026 — credits transferable added after feedback from housewives community.`
      },
      {
        slug: "safety-promise",
        title: "Safety Promise & Accountability",
        version: "1.4",
        updated: "10 Jan 2026",
        body: `## Trip leader accountability\nEvery departure has one verified woman trip leader. She stays in same property, travels in same vehicle, carries first-aid, oxygen (for Himalaya), emergency fund.\n\n## Verified ecosystem\n- Driver: police verified, 5+ years hill experience, no night driving without consent\n- Hotel: safety audit (door lock, location, solo women reviews), women-only floor where possible\n- Homestay: run by women / family, local reference\n\n## Emergency card\nPrinted + WhatsApp: trip leader phone, operations 24x7, local police, hospital, TripNaari founder escalation.\n\n## Communication\nWhatsApp group created 48h before. Live location shared on travel days. Trip leader active 6am-10pm, emergency line 24x7.\n\n## Feedback escalation\nLevel1: Trip leader immediate, Level2: Operations 24x7 +91 9XXXX 9XXXX (2min pick), Level3: founder@tripnaari.com (24h response). Monthly safety report in Instagram highlights.\n\n## What we don't tolerate\nHarassment, non-consensual behavior, hidden costs, bait-and-switch hotels — zero tolerance. Immediate corrective action, refund where appropriate, public learning.`
      },
      {
        slug: "privacy-policy",
        title: "Privacy Policy - Your Data, Your Sisterhood",
        version: "1.0",
        updated: "01 Jan 2026",
        body: `We collect name, email, phone, travel preferences to craft trip. We store in PostgreSQL encrypted at rest. We use your phone only for trip-related WhatsApp (no marketing without opt-in). We never sell data to third party.\n\nYou can request deletion via privacy@tripnaari.com. Newsletter unsubscribe anytime.\n\nCookies: we use analytics (anonymized) and conversion tracking. No creepy cross-site tracking.\n\nDMCA: TripNaari community photos used with consent. If you want yours removed, email.\n\nContact DPO: dpo@tripnaari.com, Bangalore.`
      },
      {
        slug: "terms-conditions",
        title: "Terms & Conditions",
        version: "1.2",
        updated: "05 Jan 2026",
        body: `Booking confirms you are 18+ or guardian consent for daughter 12+. You agree to safety code: respect local culture, no drugs, no harassment.\n\nTripNaari is not liable for weather, political curfew, natural disasters beyond control — but we will provide alternatives or refund per cancellation policy.\n\nItinerary may change due to safety, we communicate 12h prior.\n\nPayment: 30% advance to confirm seat, 100% 15 days before. EMI via partner.\n\nJurisdiction: Bangalore courts.\n\nRecognised by MSME & Startup India. We love you, Naari.`
      }
    ];
    const dataDir = path.join(process.cwd(), ".data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(path.join(dataDir, "policies.json"), JSON.stringify(seed, null, 2));
    return seed;
  }
  return policies;
}

