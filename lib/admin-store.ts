"use server";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { tripPackagesSeed, testimonialsSeed, tripLeadersSeed, faqsSeed, blogSeed } from "./data";

const dataDir = path.join(process.cwd(), ".data");

function ensureDir() { if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true }); }

function readFile(name: string, fallback: any[] = []) {
  ensureDir();
  const fp = path.join(dataDir, name);
  if (!fs.existsSync(fp)) return fallback;
  try { return JSON.parse(fs.readFileSync(fp, "utf-8")); } catch { return fallback; }
}
function writeFile(name: string, data: any) {
  ensureDir();
  fs.writeFileSync(path.join(dataDir, name), JSON.stringify(data, null, 2));
  revalidatePath("/", "layout");
}

// ===== Core Data Merge =====
export async function getAdminData() {
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
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hours ago
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
        followUpAt: new Date(Date.now() + 2 * 24 * 3600000).toISOString().slice(0, 16), // 2 days from now
        source: "enquiry",
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString() // 1 day ago
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
        createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString() // 3 days ago
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
        followUpAt: new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 16), // 4 hours from now
        source: "homepage",
        createdAt: new Date(Date.now() - 4 * 24 * 3600000).toISOString() // 4 days ago
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
        followUpAt: new Date(Date.now() + 24 * 3600000).toISOString().slice(0, 16), // tomorrow
        source: "newsletter",
        createdAt: new Date(Date.now() - 6 * 24 * 3600000).toISOString() // 6 days ago
      }
    ];
    leads.push(...seedLeads);
    writeFile("leads.json", leads);
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
  // If departures is empty, populate it on first load
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
    writeFile("departures.json", departures);
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
    writeFile("transactions.json", transactions);
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


  const testimonials = [...testimonialsSeed.map((t: any, i: number)=>({ id: 1000+i, isApproved: true, ...t })), ...testimonialsOverrides];
  const tripLeaders = [
    ...tripLeadersSeed.map((l: any) => {
      const over = leadersOverrides.find((o: any) => o.slug === l.slug);
      return over ? { ...l, ...over } : l;
    }),
    ...leadersCustom
  ];

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
      netProfit,
    },
    leads: leads.reverse(),
    trips,

    testimonials,
    tripLeaders,
    departures,
    faqs: faqsSeed,
    blogs: blogSeed,
    tripsOverrides,
    tripsCustom,
  };
}

export async function getTripBySlug(slug: string) {
  const data = await getAdminData();
  return data.trips.find((t: any)=>t.slug===slug) || null;
}

// ===== Trip CRUD =====
export async function toggleTripFeatured(slug: string) {
  const overrides = readFile("trips_overrides.json", []);
  const idx = overrides.findIndex((o: any) => o.slug === slug);
  const seedTrip = tripPackagesSeed.find(t => t.slug === slug) as any;
  if (idx >= 0) overrides[idx] = { ...overrides[idx], isFeatured: !overrides[idx].isFeatured };
  else overrides.push({ slug, isFeatured: !(seedTrip?.isFeatured) });
  writeFile("trips_overrides.json", overrides);
  return { success: true };
}
export async function toggleTripPublished(slug: string) {
  const overrides = readFile("trips_overrides.json", []);
  const idx = overrides.findIndex((o: any) => o.slug === slug);
  if (idx >= 0) {
    const isPub = overrides[idx].isPublished ?? true;
    overrides[idx] = { ...overrides[idx], isPublished: !isPub };
  } else overrides.push({ slug, isPublished: false });
  writeFile("trips_overrides.json", overrides);
  return { success: true };
}
export async function updateTripPrice(slug: string, priceFrom: number) {
  const overrides = readFile("trips_overrides.json", []);
  const idx = overrides.findIndex((o: any) => o.slug === slug);
  if (idx >= 0) overrides[idx].priceFrom = priceFrom;
  else overrides.push({ slug, priceFrom });
  writeFile("trips_overrides.json", overrides);
  return { success: true };
}
export async function deleteTrip(slug: string) {
  // For seed trips, mark as deleted via override; for custom, remove
  const custom = readFile("trips_custom.json", []);
  const filtered = custom.filter((t: any)=>t.slug!==slug);
  if (filtered.length !== custom.length) {
    writeFile("trips_custom.json", filtered);
    return { success: true };
  }
  const overrides = readFile("trips_overrides.json", []);
  const idx = overrides.findIndex((o: any) => o.slug === slug);
  if (idx >= 0) {
    overrides[idx] = { ...overrides[idx], isDeleted: true, isPublished: false };
  } else {
    overrides.push({ slug, isDeleted: true, isPublished: false });
  }
  writeFile("trips_overrides.json", overrides);
  return { success: true };
}
export async function saveTrip(formData: FormData) {
  const slug = (formData.get("slug") as string).toLowerCase().replace(/[^a-z0-9]+/g,"-");
  const existingCustom = readFile("trips_custom.json", []);
  const existingOverrides = readFile("trips_overrides.json", []);
  
  const inclusionsVal = formData.get("inclusions") as string;
  const exclusionsVal = formData.get("exclusions") as string;
  const itineraryVal = formData.get("itinerary") as string;
  const hotelsVal = formData.get("hotels") as string;

  const tripData: any = {
    slug,
    title: formData.get("title") as string,
    shortDescription: formData.get("shortDescription") as string,
    longDescription: formData.get("longDescription") as string,
    destinationSlug: formData.get("destinationSlug") as string,
    durationDays: Number(formData.get("durationDays")),
    durationNights: Number(formData.get("durationNights")),
    priceFrom: Number(formData.get("priceFrom")),
    priceOriginal: formData.get("priceOriginal") ? Number(formData.get("priceOriginal")) : undefined,
    groupSizeMin: Number(formData.get("groupSizeMin")||8),
    groupSizeMax: Number(formData.get("groupSizeMax")||16),
    difficulty: formData.get("difficulty") as string,
    comfortLevel: formData.get("comfortLevel") as string,
    heroImage: formData.get("heroImage") as string,
    highlights: (formData.get("highlights") as string)?.split(",").map(s=>s.trim()).filter(Boolean) || [],
    isFeatured: formData.get("isFeatured")==="on",
    isPublished: formData.get("isPublished")!=="off" && formData.get("isPublished")!=="false",
    itineraryChangePolicy: formData.get("itineraryChangePolicy") as string,
    itineraryPdf: formData.get("itineraryPdf") as string || undefined,
    inclusions: inclusionsVal ? JSON.parse(inclusionsVal) : undefined,
    exclusions: exclusionsVal ? JSON.parse(exclusionsVal) : undefined,
    itinerary: itineraryVal ? JSON.parse(itineraryVal) : undefined,
    hotels: hotelsVal ? JSON.parse(hotelsVal) : undefined,
    ratingAvg: "4.9",
    ratingCount: 0,
  };


  // Check if it's seed trip to update via overrides
  const isSeed = tripPackagesSeed.some(t=>t.slug===slug);
  if (isSeed) {
    const idx = existingOverrides.findIndex((o:any)=>o.slug===slug);
    if (idx>=0) existingOverrides[idx] = { ...existingOverrides[idx], ...tripData };
    else existingOverrides.push(tripData);
    writeFile("trips_overrides.json", existingOverrides);
  } else {
    const idx = existingCustom.findIndex((t:any)=>t.slug===slug);
    if (idx>=0) existingCustom[idx] = { ...existingCustom[idx], ...tripData, updatedAt: new Date().toISOString() };
    else existingCustom.push({ ...tripData, createdAt: new Date().toISOString() });
    writeFile("trips_custom.json", existingCustom);
  }
  return { success: true, slug };
}


// ===== Testimonials =====
export async function addTestimonial(data: any) {
  const overrides = readFile("testimonials_overrides.json", []);
  overrides.push({ id: Date.now(), isFeatured: true, isApproved: true, createdAt: new Date().toISOString(), ...data });
  writeFile("testimonials_overrides.json", overrides);
  return { success: true };
}
export async function approveTestimonial(id: number) {
  const overrides = readFile("testimonials_overrides.json", []);
  const updated = overrides.map((t: any) => t.id === id ? { ...t, isApproved: !t.isApproved, isFeatured: !t.isApproved } : t);
  writeFile("testimonials_overrides.json", updated);
  return { success: true };
}
export async function deleteTestimonial(id: number) {
  const overrides = readFile("testimonials_overrides.json", []);
  writeFile("testimonials_overrides.json", overrides.filter((t:any)=>t.id!==id));
  return { success: true };
}

// ===== Leads =====
export async function updateLeadFull(id: number, status: string, notes: string, followUpAt?: string) {
  const leads = readFile("leads.json", []);
  const updated = leads.map((l: any) => l.id === id ? { ...l, status, notes, followUpAt, updatedAt: new Date().toISOString() } : l);
  writeFile("leads.json", updated);
  return { success: true };
}
export async function deleteLead(id: number) {
  const leads = readFile("leads.json", []);
  writeFile("leads.json", leads.filter((l:any)=>l.id!==id));
  return { success: true };
}

// ===== Leaders =====
export async function saveLeader(formData: FormData) {
  const slug = (formData.get("slug") as string).toLowerCase().replace(/[^a-z0-9]+/g,"-");
  const custom = readFile("leaders_custom.json", []);
  const overrides = readFile("leaders_overrides.json", []);
  const data: any = {
    slug,
    name: formData.get("name") as string,
    bio: formData.get("bio") as string,
    specialties: (formData.get("specialties") as string)?.split(",").map(s=>s.trim()).filter(Boolean) || [],
    languages: (formData.get("languages") as string)?.split(",").map(s=>s.trim()).filter(Boolean) || [],
    experienceYears: Number(formData.get("experienceYears")||3),
    tripsLed: Number(formData.get("tripsLed")||0),
    image: formData.get("image") as string,
    isVerified: true,
  };
  const isSeed = tripLeadersSeed.some(l=>l.slug===slug);
  if (isSeed) {
    const idx = overrides.findIndex((o:any)=>o.slug===slug);
    if (idx>=0) overrides[idx] = { ...overrides[idx], ...data };
    else overrides.push(data);
    writeFile("leaders_overrides.json", overrides);
  } else {
    const idx = custom.findIndex((l:any)=>l.slug===slug);
    if (idx>=0) custom[idx] = { ...custom[idx], ...data };
    else custom.push(data);
    writeFile("leaders_custom.json", custom);
  }
  return { success: true };
}

// ===== Blogs =====
export async function createBlogPost(data: { title: string; slug: string; excerpt: string; content: string; category: string; heroImage?: string }) {
  const blogs = readFile("blogs_custom.json", []);
  const slug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g,"-");
  blogs.push({ id: Date.now(), isPublished: true, publishedAt: new Date().toISOString(), ...data, slug });
  writeFile("blogs_custom.json", blogs);
  return { success: true };
}
export async function deleteBlog(slug: string) {
  const blogs = readFile("blogs_custom.json", []);
  writeFile("blogs_custom.json", blogs.filter((b:any)=>b.slug!==slug));
  return { success: true };
}

// ===== Gallery =====
export async function deleteGalleryImage(url: string) {
  const gallery = readFile("gallery_uploads.json", []);
  writeFile("gallery_uploads.json", gallery.filter((g:any)=>g.url!==url));
  // try delete file
  try {
    const fsPath = `${process.cwd()}/public${url}`;
    if (fs.existsSync(fsPath)) fs.unlinkSync(fsPath);
  } catch {}
  return { success: true };
}

// ===== Transactions =====
export async function getTransactions() {
  return readFile("transactions.json", []);
}

export async function saveTransaction(formData: FormData) {
  const transactions = readFile("transactions.json", []);
  
  const idStr = formData.get("id") as string;
  const transaction = {
    id: idStr ? Number(idStr) : Date.now(),
    type: formData.get("type") as "revenue" | "expense",
    amount: Number(formData.get("amount")),
    category: formData.get("category") as string,
    tripSlug: formData.get("tripSlug") as string || undefined,
    description: formData.get("description") as string || "",
    date: formData.get("date") as string || new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString()
  };

  const idx = transactions.findIndex((t: any) => t.id === transaction.id);
  if (idx >= 0) {
    transactions[idx] = { ...transactions[idx], ...transaction };
  } else {
    transactions.push(transaction);
  }

  writeFile("transactions.json", transactions);
  return { success: true };
}

export async function deleteTransaction(id: number) {
  const transactions = readFile("transactions.json", []);
  const filtered = transactions.filter((t: any) => t.id !== id);
  writeFile("transactions.json", filtered);
  return { success: true };
}

// ===== Departures CRUD =====
export async function getDepartureById(id: number) {
  const data = await getAdminData();
  return data.departures.find((d: any) => d.id === id) || null;
}

export async function deleteDeparture(id: number) {
  const departures = readFile("departures.json", []);
  const filtered = departures.filter((d: any) => d.id !== id);
  writeFile("departures.json", filtered);
  return { success: true };
}

export async function saveDeparture(formData: FormData) {
  const idStr = formData.get("id") as string;
  const id = idStr ? Number(idStr) : Date.now();
  const tripSlug = formData.get("tripSlug") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const seatsTotal = Number(formData.get("seatsTotal") || 16);
  const seatsBooked = Number(formData.get("seatsBooked") || 0);
  const price = Number(formData.get("price") || 0);
  const status = formData.get("status") as string;
  const isGuaranteed = formData.get("isGuaranteed") === "on";

  const departureData = {
    id,
    tripSlug,
    startDate,
    endDate,
    seatsTotal,
    seatsBooked,
    price,
    status,
    isGuaranteed
  };

  const departures = readFile("departures.json", []);
  const idx = departures.findIndex((d: any) => d.id === id);
  if (idx >= 0) {
    departures[idx] = { ...departures[idx], ...departureData };
  } else {
    departures.push(departureData);
  }
  writeFile("departures.json", departures);
  return { success: true };
}

export async function getSettings() {
  const settings = readFile("settings.json", []);
  if (!settings || Array.isArray(settings) || typeof settings !== "object") {
    return {
      marqueeText: "🎉 Limited Offer: Get ₹2,000 Off on your first booking! Code: SISTERHOOD2000 • Group Discount: Book for 4 or more girls and get extra ₹1,500 off per person! • Book early and secure your slot with just ₹5,000 token amount!"
    };
  }
  return settings;
}

export async function saveSettings(formData: FormData) {
  const marqueeText = formData.get("marqueeText") as string;
  writeFile("settings.json", { marqueeText });
  return { success: true };
}

export async function getHomepageGalleryAdmin() {
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

export async function saveHomepageGallery(images: any[]) {
  writeFile("homepage_gallery.json", images);
  return { success: true };
}

// ===== FAQs CRUD =====
export async function getFAQs() {
  const faqs = readFile("faqs.json", []);
  if (faqs.length === 0) {
    const seedWithIds = faqsSeed.map((f: any, idx: number) => ({
      id: idx + 1,
      ...f
    }));
    writeFile("faqs.json", seedWithIds);
    return seedWithIds;
  }
  const withIds = faqs.map((f: any, idx: number) => ({
    id: f.id || idx + 1000,
    ...f
  }));
  return withIds;
}

export async function saveFAQ(id: number | null, question: string, answer: string, category: string) {
  const faqs = await getFAQs();
  if (id) {
    const updated = faqs.map((f: any) => f.id === id ? { ...f, question, answer, category } : f);
    writeFile("faqs.json", updated);
  } else {
    const newFaq = {
      id: Date.now(),
      question,
      answer,
      category
    };
    faqs.push(newFaq);
    writeFile("faqs.json", faqs);
  }
  return { success: true };
}

export async function deleteFAQ(id: number) {
  const faqs = await getFAQs();
  const filtered = faqs.filter((f: any) => f.id !== id);
  writeFile("faqs.json", filtered);
  return { success: true };
}

// ===== Policies CRUD =====
export async function getPolicies() {
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
    writeFile("policies.json", seed);
    return seed;
  }
  return policies;
}

export async function savePolicy(slug: string, title: string, body: string, version: string, updated: string) {
  const policies = await getPolicies();
  const index = policies.findIndex((p: any) => p.slug === slug);
  if (index !== -1) {
    policies[index] = { slug, title, body, version, updated };
    writeFile("policies.json", policies);
    return { success: true };
  }
  return { success: false, error: "Policy not found" };
}




