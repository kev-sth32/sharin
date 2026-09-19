import fs from "fs";
import path from "path";
import { tripPackagesSeed, testimonialsSeed, tripLeadersSeed, faqsSeed, blogSeed } from "./data";

const dataDir = path.join(process.cwd(), ".data");

function ensureDir() { if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true }); }

export function readFile(name: string, fallback: any[] = []) {
  ensureDir();
  const fp = path.join(dataDir, name);
  if (!fs.existsSync(fp)) return fallback;
  try { return JSON.parse(fs.readFileSync(fp, "utf-8")); } catch { return fallback; }
}

export function writeFileShared(name: string, data: any) {
  ensureDir();
  const targetPath = path.join(dataDir, name);
  const tempPath = path.join(dataDir, `${name}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempPath, targetPath);
  } catch (err) {
    if (fs.existsSync(tempPath)) { try { fs.unlinkSync(tempPath); } catch {} }
    console.error(`[TripNaari] Failed atomic write for ${name}:`, err);
    throw err;
  }
}

export async function getAdminDataShared() {
  const leads = readFile("leads.json", []);
  if (leads.length === 0) {
    const seedLeads = [
      {
        id: 1,
        name: "Ananya Sharma",
        email: "ananya.sharma@example.com",
        phone: "+91 98765 43210",
        destination: "Kashmir",
        travelMonth: "October 2026",
        travelers: 3,
        budget: "₹30,000 - ₹50,000",
        message: "Looking for a luxury women-only getaway to Srinagar, Gulmarg, and Pahalgam. Prefer premium hotel stays and verified drivers.",
        status: "new",
        notes: "Interested in premium packages. Indicated she has a group of 3 sisters.",
        followUpAt: "",
        source: "homepage",
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
      },
      {
        id: 2,
        name: "Priya Nair",
        email: "priya.nair@example.com",
        phone: "+91 99998 88877",
        destination: "Meghalaya",
        travelMonth: "September 2026",
        travelers: 1,
        budget: "₹20,000 - ₹30,000",
        message: "Solo traveler wanting to join the Meghalaya sisterhood group departure. Very excited about the double-decker root bridge trek!",
        status: "itinerary_shared",
        notes: "Shared Meghalaya itinerary PDF and hotel details via WhatsApp. She wants to check flight options before confirming.",
        followUpAt: new Date(Date.now() + 2 * 24 * 3600000).toISOString().slice(0, 16),
        source: "enquiry",
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
      },
      {
        id: 3,
        name: "Sneha Patil",
        email: "sneha.patil@example.com",
        phone: "+91 91234 56789",
        destination: "Spiti Valley",
        travelMonth: "September 2026",
        travelers: 2,
        budget: "₹30,000 - ₹50,000",
        message: "Me and my sister want to book the Spiti road trip. Can we confirm if the trip leader is female and if hotels have heaters?",
        status: "booked",
        notes: "Confirmed women-only group leaders and hotel heating. Booking token received. Paid 10k.",
        followUpAt: "",
        source: "custom",
        createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString()
      },
      {
        id: 4,
        name: "Aditi Rao",
        email: "aditi.rao@example.com",
        phone: "+91 98111 22233",
        destination: "Kerala",
        travelMonth: "November 2026",
        travelers: 4,
        budget: "Above ₹50,000",
        message: "Custom private houseboat tour and tea plantation walk in Munnar for a group of 4 close girlfriends.",
        status: "payment_pending",
        notes: "Sent proposal deck for Munnar + Alleppey. Waiting for payment verification of token transfer.",
        followUpAt: new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 16),
        source: "homepage",
        createdAt: new Date(Date.now() - 4 * 24 * 3600000).toISOString()
      },
      {
        id: 5,
        name: "Ritu Verma",
        email: "ritu.verma@example.com",
        phone: "+91 90000 11111",
        destination: "Ladakh",
        travelMonth: "September 2026",
        travelers: 1,
        budget: "₹30,000 - ₹50,000",
        message: "Is high altitude medical support provided? I am traveling solo for the first time and want to ensure safety.",
        status: "contacted",
        notes: "Explained oxygen cylinder backup and 24/7 support line. Ritu seemed reassured, will verify budget and confirm.",
        followUpAt: new Date(Date.now() + 24 * 3600000).toISOString().slice(0, 16),
        source: "newsletter",
        createdAt: new Date(Date.now() - 6 * 24 * 3600000).toISOString()
      }
    ];
    leads.push(...seedLeads);
    writeFileShared("leads.json", leads);
  }

  const custom = readFile("custom_trips.json", []);
  const newsletter = readFile("newsletter.json", []);
  const contacts = readFile("contacts.json", []);
  const refunds = readFile("refunds.json", []);
  const tripsOverrides = readFile("trips_overrides.json", []);
  const tripsCustom = readFile("trips_custom.json", []);

  const testimonialsOverrides = readFile("testimonials_overrides.json", []);
  const leadersOverrides = readFile("leaders_overrides.json", []);
  const leadersCustom = readFile("leaders_custom.json", []);

  const departures = readFile("departures.json", []);
  if (departures.length === 0 && tripPackagesSeed.length > 0) {
    const today = new Date();
    let idCounter = 1;
    tripPackagesSeed.forEach((t: any) => {
      const start1 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const end1 = new Date(start1.getTime() + t.durationDays * 24 * 60 * 60 * 1000);
      const start2 = new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000);
      const end2 = new Date(start2.getTime() + t.durationDays * 24 * 60 * 60 * 1000);
      
      departures.push({
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
      departures.push({
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
    writeFileShared("departures.json", departures);
  }

  const transactions = readFile("transactions.json", []);
  if (transactions.length === 0) {
    const seedTx = [
      { id: 1, type: "revenue", amount: 145000, category: "Trip Bookings", tripSlug: "kashmir-girls-gateway", description: "Batch 1 bookings (5 slots)", date: "2026-07-15", createdAt: new Date().toISOString() },
      { id: 2, type: "revenue", amount: 110000, category: "Trip Bookings", tripSlug: "meghalaya-monsoon-magic", description: "Batch 2 bookings (4 slots)", date: "2026-07-20", createdAt: new Date().toISOString() },
      { id: 3, type: "expense", amount: 45000, category: "Hotel Bookings", tripSlug: "kashmir-girls-gateway", description: "Hotel advance - Srinagar Residency", date: "2026-07-22", createdAt: new Date().toISOString() },
      { id: 4, type: "expense", amount: 35000, category: "Transport Cost", tripSlug: "kashmir-girls-gateway", description: "Tempo Traveller booking 6 days", date: "2026-07-23", createdAt: new Date().toISOString() },
      { id: 5, type: "revenue", amount: 65000, category: "Custom Private Trips", tripSlug: "kerala-backwater-escape", description: "Private family trip advance", date: "2026-07-28", createdAt: new Date().toISOString() },
      { id: 6, type: "expense", amount: 18000, category: "Trip Leader Payout", tripSlug: "kashmir-girls-gateway", description: "Leader pay - batch 1 guide", date: "2026-07-30", createdAt: new Date().toISOString() },
      { id: 7, type: "expense", amount: 12000, category: "Marketing / Ads", description: "Instagram ads for Spiti Valley trip", date: "2026-08-01", createdAt: new Date().toISOString() },
      { id: 8, type: "revenue", amount: 95000, category: "Trip Bookings", tripSlug: "spiti-valley-road-trip", description: "Bookings inflow Spiti", date: "2026-08-03", createdAt: new Date().toISOString() }
    ];
    transactions.push(...seedTx);
    writeFileShared("transactions.json", transactions);
  }

  let totalRevenue = 0;
  let totalExpenses = 0;
  transactions.forEach((tx: any) => {
    if (tx.type === "revenue") totalRevenue += tx.amount;
    else if (tx.type === "expense") totalExpenses += tx.amount;
  });
  const netProfit = totalRevenue - totalExpenses;

  const trips = [
    ...tripPackagesSeed.map((t: any) => {
      const over = tripsOverrides.find((o: any) => o.slug === t.slug);
      if (over?.isDeleted) return null as any;
      return over ? { ...t, ...over } : t;
    }).filter(Boolean),
    ...tripsCustom
  ];

  const testimonials = [
    ...testimonialsSeed.map((t: any, i: number) => {
      const id = 1000 + i;
      const over = testimonialsOverrides.find((o: any) => o.id === id);
      if (over?.isDeleted) return null;
      return over ? { ...t, ...over } : { id, isApproved: true, isFeatured: true, ...t };
    }).filter(Boolean),
    ...testimonialsOverrides.filter((o: any) => (o.id >= 2000 || o.id < 1000) && !o.isDeleted)
  ];
  const tripLeaders = [
    ...tripLeadersSeed.map((l: any) => {
      const over = leadersOverrides.find((o: any) => o.slug === l.slug);
      if (over?.isDeleted) return null;
      return over ? { ...l, ...over } : l;
    }).filter(Boolean),
    ...leadersCustom
  ];

  const customBlogs = readFile("blogs_custom.json", []);
  const deletedBlogs = readFile("blogs_deleted.json", []);
  const mergedBlogs = [
    ...blogSeed.map((b: any, i: number) => ({ id: 10000 + i, isPublished: true, ...b })),
    ...customBlogs
  ].filter((b: any) => !deletedBlogs.includes(b.slug));

  return {
    stats: {
      leads: leads.length,
      custom: custom.length,
      newsletter: newsletter.length,
      contacts: contacts.length,
      refunds: refunds.length,
      trips: trips.length,
      testimonials: testimonials.length,
      departures: departures.length,
      totalRevenue,
      totalExpenses,
      netProfit
    },
    leads: [...leads].reverse(),
    trips,
    testimonials,
    tripLeaders,
    departures,
    transactions,
    faqs: faqsSeed,
    blogs: mergedBlogs,
    tripsOverrides,
    tripsCustom
  };
}
