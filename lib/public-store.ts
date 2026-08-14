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
  const mergedSeed = testimonialsSeed.map((t: any, i: number) => {
    const id = 1000 + i;
    const over = overrides.find((o: any) => o.id === id);
    if (over?.isDeleted) return null;
    return over ? { ...t, ...over } : { id, isApproved: true, isFeatured: true, ...t };
  }).filter(Boolean);

  const custom = overrides.filter((o: any) => o.id >= 2000 || o.id < 1000);
  const all = [...mergedSeed, ...custom];
  return all.filter((t: any) => t.isApproved !== false);
}

export function getMergedLeaders() {
  const overrides = readFile("leaders_overrides.json", []);
  const custom = readFile("leaders_custom.json", []);
  return [
    ...tripLeadersSeed.map((l:any)=>{ 
      const over = overrides.find((o:any)=>o.slug===l.slug); 
      if (over?.isDeleted) return null;
      return over?{...l,...over}:l; 
    }).filter(Boolean),
    ...custom
  ];
}

export function getCustomBlogs() {
  const custom = readFile("blogs_custom.json", []);
  const deleted = readFile("blogs_deleted.json", []);
  const all = [...blogSeed, ...custom];
  return all.filter((b: any) => !deleted.includes(b.slug));
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

  const defaultReasons = [
    { icon: "Shield", title: "Women trip leader 24x7, not just a driver", desc: "Verified, wilderness first responder trained, stays in same hotel, accountable via escalation card." },
    { icon: "Map", title: "Hotel category revealed at booking, name 7 days before", desc: "We show you 2 sample properties and exact timeline. No bait-and-switch. If changed, upgrade at our cost." },
    { icon: "Wallet", title: "Transparent inclusion & refund timelines", desc: "Every trip page lists inclusions, exclusions, cancellation slabs with refund processing days (7-10 days)." },
    { icon: "Users", title: "Community, not just customers", desc: "Solo travelers, housewives, mothers, grandmothers travel together. Pre-trip icebreaker call." },
    { icon: "Clock", title: "Itinerary change policy in writing", desc: "Weather, traffic, safety, low group size: alternatives or refund options shared 12 hours prior. Never abandoned." },
    { icon: "Heart", title: "Food, safety needs actually heard", desc: "Jain, vegan, kid-friendly, medical needs collected in form and acted on. Not just a marketing checkbox." }
  ];

  const defaultMarquee = "🎉 Limited Offer: Get ₹2,000 Off on your first booking! Code: SISTERHOOD2000 • Group Discount: Book for 4 or more girls and get extra ₹1,500 off per person! • Book early and secure your slot with just ₹5,000 token amount!";

  const defaultHeroBadge = "Women-Only Travel Experience";
  const defaultHeroTitle = "Solo on Paper.<br />\n<span class=\"font-serif italic font-normal text-[#FF4A7D]\">Together in Spirit.</span>";
  const defaultHeroSubtitle = "Discover safety-first small group trips for women. Experience local cultures, form lifetime friendships, and explore the world with our experienced Trip Leaders.";
  const defaultUrgencyText = "⚡ {count} Naaris enquired last hour";
  const defaultHeroImages = [
    "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1600&q=80",
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80",
    "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1600&q=80"
  ];

  if (!settings || Array.isArray(settings) || typeof settings !== "object") {
    return {
      marqueeText: defaultMarquee,
      whyChooseBadge: "Why 6000+ women choose TripNaari",
      whyChooseTitle: "Safety is not a tagline.\nIt is accountability.",
      whyChooseDesc: "Public reviews love our safety, some mention operational hiccups. So we fixed it: every touchpoint now has a written policy, escalation, and timeline.",
      whyChooseReasons: defaultReasons,
      heroBadge: defaultHeroBadge,
      heroTitle: defaultHeroTitle,
      heroSubtitle: defaultHeroSubtitle,
      urgencyText: defaultUrgencyText,
      heroImages: defaultHeroImages,
      heroTitleSize: "Large",
      heroSubtitleSize: "Medium",
      pill1Badge: "Most Loved",
      pill1Title: "Kashmir Tulip • 5D",
      pill1Desc: "₹21,999 • 8 seats",
      pill2Badge: "Weekend",
      pill2Title: "Tirthan 3D • Solo",
      pill2Desc: "₹9,999 • Fri"
    };
  }

  return {
    marqueeText: settings.marqueeText || defaultMarquee,
    whyChooseBadge: settings.whyChooseBadge || "Why 6000+ women choose TripNaari",
    whyChooseTitle: settings.whyChooseTitle || "Safety is not a tagline.\nIt is accountability.",
    whyChooseDesc: settings.whyChooseDesc || "Public reviews love our safety, some mention operational hiccups. So we fixed it: every touchpoint now has a written policy, escalation, and timeline.",
    whyChooseReasons: settings.whyChooseReasons || defaultReasons,
    heroBadge: settings.heroBadge || defaultHeroBadge,
    heroTitle: settings.heroTitle || defaultHeroTitle,
    heroSubtitle: settings.heroSubtitle || defaultHeroSubtitle,
    urgencyText: settings.urgencyText || defaultUrgencyText,
    heroImages: settings.heroImages || defaultHeroImages,
    heroTitleSize: settings.heroTitleSize || "Large",
    heroSubtitleSize: settings.heroSubtitleSize || "Medium",
    pill1Badge: settings.pill1Badge || "Most Loved",
    pill1Title: settings.pill1Title || "Kashmir Tulip • 5D",
    pill1Desc: settings.pill1Desc || "₹21,999 • 8 seats",
    pill2Badge: settings.pill2Badge || "Weekend",
    pill2Title: settings.pill2Title || "Tirthan 3D • Solo",
    pill2Desc: settings.pill2Desc || "₹9,999 • Fri"
  };
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
        title: "Booking & Cancellation Policy",
        version: "2.2",
        updated: "10 Aug 2026",
        body: `Please carefully review our timeline-based cancellation schedule and refund distribution metrics detailed below before finalizing your slot registration.

--------------------------------------------------------------------------------
CANCELLATION TIMELINE WINDOW & REFUND TERMS
--------------------------------------------------------------------------------

1. 30 Days or more before departure date
   * Refund: 100% Refund
   * Terms: Full amount refunded back to source account. No hidden penalties.

2. Between 15 to 30 Days before departure date
   * Refund: 50% Refund
   * Terms: Half package cost refunded or 80% dynamic rollover credit voucher provided.

3. Between 7 to 14 Days before departure date
   * Refund: 25% Refund
   * Terms: Quarterly package cost returned. Operational logistics fees apply.

4. Less than 7 Days before departure date
   * Refund: No Refund (0%)
   * Terms: Strictly non-refundable due to advance mountain vehicle and hotel bookings.

--------------------------------------------------------------------------------
SPECIAL POLICY NOTES
--------------------------------------------------------------------------------
Permit application processing tokens, special high altitude entry clearances, and customized border transit passes are fully non-refundable once initiated by state regulators. In instances of unexpected road blockages, landslides, natural emergencies, or severe snowfall restrictions, preventing entry past critical checkpoints, alternate valley exploration circuits will be systematically organized by TripNaari coordinators; direct payment cash disbursements cannot be processed under state-leased environmental restrictions.`
      },
      {
        slug: "safety-promise",
        title: "Safety Promise & Accountability",
        version: "1.4",
        updated: "10 Jan 2026",
        body: `## Trip leader accountability\nEvery departure has one verified woman trip leader. She stays in same property, travels in same vehicle, carries first-aid, oxygen (for Himalaya), emergency fund.\n\n## Verified ecosystem\n- Driver: police verified, 5+ years hill experience, no night driving without consent\n- Hotel: safety audit (door lock, location, solo women reviews), women-only floor where possible\n- Homestay: run by women / family, local reference\n\n## Emergency card\nPrinted + WhatsApp: trip leader phone, operations 24x7, local police, hospital, TripNaari founder escalation.\n\n## Communication\nWhatsApp group created 48h before. Live location shared on travel days. Trip leader active 6am-10pm, emergency line 24x7.\n\n## Feedback escalation\nLevel1: Trip leader immediate, Level2: Operations 24x7 +91 92827 94457 (2min pick), Level3: founder@tripnaari.com (24h response). Monthly safety report in Instagram highlights.\n\n## What we don't tolerate\nHarassment, non-consensual behavior, hidden costs, bait-and-switch hotels — zero tolerance. Immediate corrective action, refund where appropriate, public learning.`
      },
      {
        slug: "privacy-policy",
        title: "Privacy Policy - Your Data, Your Sisterhood",
        version: "1.0",
        updated: "01 Jan 2026",
        body: `We collect name, email, phone, travel preferences to craft trip. We store in MySQL encrypted at rest. We use your phone only for trip-related WhatsApp (no marketing without opt-in). We never sell data to third party.\n\nYou can request deletion via privacy@tripnaari.com. Newsletter unsubscribe anytime.\n\nCookies: we use analytics (anonymized) and conversion tracking. No creepy cross-site tracking.\n\nDMCA: TripNaari community photos used with consent. If you want yours removed, email.\n\nContact DPO: dpo@tripnaari.com, Bangalore.`
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

export function getAISettings() {
  const dataDir = path.join(process.cwd(), ".data");
  const fp = path.join(dataDir, "ai_settings.json");
  const fallback = {
    nvidiaApiKey: "",
    geminiApiKey: "",
    modelName: "meta/llama-3.1-70b-instruct",
    welcomeMessage: "Namaste! 🙏 Welcome to TripNaari. I am NaariAI, your travel companion. I can help you find safe women-only packages, check active departures, and answer any queries you have. What destinations are you dreaming of?",
    systemInstruction: `You are "NaariAI", the official women's safety & group travel assistant for TripNaari.
TripNaari is India's leading travel brand focusing on safe solo and group travel experiences for women, sisters, mothers, and daughters.

YOUR INSTRUCTIONS:
1. ONLY answer questions using the provided TripNaari information (Trips, Departures, FAQs, Policies, Custom Knowledge) listed below.
2. Be extremely warm, friendly, encouraging, and supportive. Emphasize women's safety, sisterhood, local women leaders, and verified safety audits.
3. If a customer is asking to book a trip or wants a customized itinerary, encourage them to fill out our quick Enquiry/Booking Form. You can output "[SHOW_ENQUIRY_FORM]" at the end of your response to trigger the form interface inside the chat drawer.
4. If a user asks about topics completely unrelated to TripNaari (e.g. coding, cooking recipes, other travel operators, general news), politely state that you are only programmed to help with TripNaari trips and safety queries.
5. Do NOT hallucinate prices, dates, or destinations that are not in the context below.
6. BUDGET & MATH ACCURACY: When a user specifies a budget (e.g. "X for N people"), carefully verify that the total cost (Price Per Person * N) is mathematically less than or equal to their budget X. Do not recommend any package that exceeds their budget. Show your calculation clearly (e.g., "₹A per person * B people = ₹C total").`,
    customKnowledge: `Here are additional training details and rules for NaariAI:
- We are currently offering a special discount for solo travelers booking active trips: extra ₹1,000 off if they mention safety questions.
- All trip leaders are certified women professionals who stay in the same accommodation.
- Verification audits are done for every single hotel room lock prior to group check-in.`,
    temperature: 0.2,
    personaTone: "warm",
    includeTrips: true,
    includeDepartures: true,
    includeFaqs: true,
    qaPairs: [
      {
        id: 1786362000001,
        question: "Can children join group tours?",
        answer: "Girls aged 12+ can join group trips with mothers/guardians. Boys are strictly not allowed on group packages."
      },
      {
        id: 1786362000002,
        question: "Can I join solo? How is room sharing arranged?",
        answer: "Yes! Over 70% of our travelers join solo. We pair you with another solo female traveler of a similar age to share a twin room. You don't have to pay single supplement fees!"
      },
      {
        id: 1786362000003,
        question: "Does a female trip leader stay with us?",
        answer: "Yes, absolutely. A certified female TripNaari leader stays at the same hotels/homestays and travels in the same vehicles for 24/7 security and coordination. They are trained in wilderness first-aid."
      },
      {
        id: 1786362000004,
        question: "Do you organize custom private trips for families or friends?",
        answer: "Yes! We design custom private packages for couples, families, and girlfriend groups. Tap [SHOW_ENQUIRY_FORM] at the end of your message to submit details and request a custom quote."
      },
      {
        id: 1786362000005,
        question: "I am not very fit. Can I join your trips?",
        answer: "Most of our trips have easy-to-moderate paces. Each trip page shows its difficulty level. Our leaders provide support, and alternate light walks are arranged if you want to skip tough treks."
      },
      {
        id: 1786362000006,
        question: "How much advance do I pay to book a slot?",
        answer: "You can secure any slot with a token advance of just ₹5,000. The remaining balance is payable in installments, with the full amount due 15 days before the departure."
      },
      {
        id: 1786362000007,
        question: "Do you provide Jain or pure vegetarian food on tours?",
        answer: "Yes, we arrange pure veg, Jain, vegan, or gluten-free meals. Simply indicate your dietary preferences in the pre-trip booking form so we can alert our host properties."
      },
      {
        id: 1786362000008,
        question: "How can I meet other girls booking the same trip before departure?",
        answer: "We create a WhatsApp group 48 hours before the trip and host a virtual Zoom/Google Meet icebreaker session. This helps you get to know your fellow sisters before reaching the destination!"
      },
      {
        id: 1786362000009,
        question: "Are cab drivers police-verified?",
        answer: "Absolutely. All drivers undergo police verification and background audits. They have a minimum of 5 years of experience in mountain driving (for Himalayan trips) and are briefed on female traveler safety protocols."
      },
      {
        id: 1786362000010,
        question: "What happens in case of a medical emergency during a high-altitude trip?",
        answer: "Our leaders carry portable oxygen cylinders, comprehensive first-aid kits, and pulse oximeters. We have tie-ups with local doctors, and our 24/7 operations line coordinates rapid evacuations if required."
      }
    ] as Array<{ id: number; question: string; answer: string }>
  };
  if (!fs.existsSync(fp)) return fallback;
  try {
    const data = JSON.parse(fs.readFileSync(fp, "utf-8"));
    const merged = { ...fallback, ...data };
    return merged;
  } catch {
    return fallback;
  }
}

