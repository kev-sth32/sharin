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
function writeFile(name: string, data: any, revalidate = true) {
  ensureDir();
  fs.writeFileSync(path.join(dataDir, name), JSON.stringify(data, null, 2));
  if (revalidate) {
    try {
      revalidatePath("/", "layout");
    } catch (e) {
      console.warn("revalidatePath failed (likely called during render):", e);
    }
  }
}

// ===== Core Data Merge =====
import { getAdminDataShared } from "./admin-store-shared";

export async function getAdminData() {
  return getAdminDataShared();
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
  const cancellationSlabsVal = formData.get("cancellationSlabs") as string;

  const tripData: any = {
    slug,
    title: formData.get("title") as string,
    shortDescription: formData.get("shortDescription") as string,
    longDescription: formData.get("longDescription") as string,
    destinationSlug: formData.get("destinationSlug") as string,
    locationLabel: formData.get("locationLabel") as string || undefined,
    badgeText: formData.get("badgeText") as string || undefined,
    durationDays: Number(formData.get("durationDays")),
    durationNights: Number(formData.get("durationNights")),
    priceFrom: Number(formData.get("priceFrom")),
    priceOriginal: formData.get("priceOriginal") ? Number(formData.get("priceOriginal")) : undefined,
    groupSizeMin: Number(formData.get("groupSizeMin")||8),
    groupSizeMax: Number(formData.get("groupSizeMax")||16),
    difficulty: formData.get("difficulty") as string,
    comfortLevel: formData.get("comfortLevel") as string,
    heroImage: formData.get("heroImage") as string,
    gallery: formData.get("gallery") ? JSON.parse(formData.get("gallery") as string) : undefined,
    highlights: (formData.get("highlights") as string)?.split(",").map(s=>s.trim()).filter(Boolean) || [],
    isFeatured: formData.get("isFeatured")==="on",
    isPublished: formData.get("isPublished")!=="off" && formData.get("isPublished")!=="false",
    isInternational: formData.get("isInternational")==="on",
    itineraryChangePolicy: formData.get("itineraryChangePolicy") as string,
    itineraryPdf: formData.get("itineraryPdf") as string || undefined,
    inclusions: inclusionsVal ? JSON.parse(inclusionsVal) : undefined,
    exclusions: exclusionsVal ? JSON.parse(exclusionsVal) : undefined,
    itinerary: itineraryVal ? JSON.parse(itineraryVal) : undefined,
    hotels: hotelsVal ? JSON.parse(hotelsVal) : undefined,
    
    // Custom editable details fields
    packingDisclaimer: formData.get("packingDisclaimer") as string || undefined,
    packingItems: formData.get("packingItems") ? (formData.get("packingItems") as string).split("\n").map(s=>s.trim()).filter(Boolean) : undefined,
    momentsGallery: formData.get("momentsGallery") ? (() => {
      const val = formData.get("momentsGallery") as string;
      if (val.startsWith("[")) {
        try { return JSON.parse(val); } catch { return []; }
      }
      return val.split("\n").map(s=>s.trim()).filter(Boolean);
    })() : undefined,
    cancellationSlabs: cancellationSlabsVal ? JSON.parse(cancellationSlabsVal) : undefined,
    cancellationSpecialNotes: formData.get("cancellationSpecialNotes") as string || undefined,
    
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
  const idx = overrides.findIndex((t: any) => t.id === id);
  if (idx >= 0) {
    overrides[idx] = { ...overrides[idx], isApproved: !overrides[idx].isApproved, isFeatured: overrides[idx].isApproved };
  } else {
    const seedIndex = id - 1000;
    if (seedIndex >= 0 && seedIndex < testimonialsSeed.length) {
      const seedItem = testimonialsSeed[seedIndex];
      overrides.push({
        id,
        ...seedItem,
        isApproved: false,
        isFeatured: false
      });
    }
  }
  writeFile("testimonials_overrides.json", overrides);
  return { success: true };
}
export async function deleteTestimonial(id: number) {
  const overrides = readFile("testimonials_overrides.json", []);
  const idx = overrides.findIndex((t: any) => t.id === id);
  if (idx >= 0) {
    overrides[idx] = { ...overrides[idx], isDeleted: true };
  } else {
    const seedIndex = id - 1000;
    if (seedIndex >= 0 && seedIndex < testimonialsSeed.length) {
      const seedItem = testimonialsSeed[seedIndex];
      overrides.push({
        id,
        ...seedItem,
        isDeleted: true
      });
    }
  }
  writeFile("testimonials_overrides.json", overrides);
  return { success: true };
}
export async function updateTestimonial(id: number, data: any) {
  const overrides = readFile("testimonials_overrides.json", []);
  const idx = overrides.findIndex((t: any) => t.id === id);
  if (idx >= 0) {
    overrides[idx] = { ...overrides[idx], ...data, updatedAt: new Date().toISOString() };
  } else {
    const seedIndex = id - 1000;
    if (seedIndex >= 0 && seedIndex < testimonialsSeed.length) {
      const seedItem = testimonialsSeed[seedIndex];
      overrides.push({
        id,
        ...seedItem,
        ...data,
        updatedAt: new Date().toISOString()
      });
    }
  }
  writeFile("testimonials_overrides.json", overrides);
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
  }
  return { success: true };
}

export async function deleteLeader(slug: string) {
  const custom = readFile("leaders_custom.json", []);
  const filteredCustom = custom.filter((l: any) => l.slug !== slug);
  if (filteredCustom.length !== custom.length) {
    writeFile("leaders_custom.json", filteredCustom);
    return { success: true };
  }
  const overrides = readFile("leaders_overrides.json", []);
  const idx = overrides.findIndex((o: any) => o.slug === slug);
  if (idx >= 0) {
    overrides[idx] = { ...overrides[idx], isDeleted: true };
  } else {
    overrides.push({ slug, isDeleted: true });
  }
  writeFile("leaders_overrides.json", overrides);
  return { success: true };
}

// ===== Blogs =====
export async function saveBlogPost(formData: FormData) {
  const idStr = formData.get("id") as string;
  const id = idStr ? Number(idStr) : Date.now();
  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string || title).toLowerCase().replace(/[^a-z0-9]+/g,"-");
  const category = formData.get("category") as string || "General";
  const excerpt = formData.get("excerpt") as string || "";
  const content = formData.get("content") as string || "";
  const heroImage = formData.get("heroImage") as string || "";
  const isPublished = formData.get("isPublished") !== "false" && formData.get("isPublished") !== "off";

  const blogData = {
    id,
    title,
    slug,
    category,
    excerpt,
    content,
    heroImage,
    isPublished,
    publishedAt: new Date().toISOString()
  };

  const blogs = readFile("blogs_custom.json", []);
  // Match by ID or Slug to avoid duplicates on edit
  const idx = blogs.findIndex((b: any) => b.id === id || b.slug === slug);
  if (idx >= 0) {
    blogs[idx] = { ...blogs[idx], ...blogData };
  } else {
    blogs.push(blogData);
  }
  writeFile("blogs_custom.json", blogs);
  
  // If it was in the deleted list, remove it from there
  const deleted = readFile("blogs_deleted.json", []);
  const filteredDeleted = deleted.filter((s: string) => s !== slug);
  if (filteredDeleted.length !== deleted.length) {
    writeFile("blogs_deleted.json", filteredDeleted);
  }

  return { success: true };
}

export async function deleteBlog(slug: string) {
  const blogs = readFile("blogs_custom.json", []);
  const filtered = blogs.filter((b: any) => b.slug !== slug);
  if (filtered.length !== blogs.length) {
    writeFile("blogs_custom.json", filtered);
    return { success: true };
  }

  // If it's a seed blog, track it in the deleted list
  const deleted = readFile("blogs_deleted.json", []);
  if (!deleted.includes(slug)) {
    deleted.push(slug);
    writeFile("blogs_deleted.json", deleted);
  }
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

export async function saveSettings(formData: FormData) {
  const existing = await getSettings();

  const marqueeText = formData.get("marqueeText") !== null ? (formData.get("marqueeText") as string) : existing.marqueeText;
  const whyChooseBadge = formData.get("whyChooseBadge") !== null ? (formData.get("whyChooseBadge") as string) : existing.whyChooseBadge;
  const whyChooseTitle = formData.get("whyChooseTitle") !== null ? (formData.get("whyChooseTitle") as string) : existing.whyChooseTitle;
  const whyChooseDesc = formData.get("whyChooseDesc") !== null ? (formData.get("whyChooseDesc") as string) : existing.whyChooseDesc;
  
  let whyChooseReasons = existing.whyChooseReasons;
  if (formData.get("card_title_0") !== null) {
    whyChooseReasons = [];
    for (let i = 0; i < 6; i++) {
      const icon = formData.get(`card_icon_${i}`) as string;
      const title = formData.get(`card_title_${i}`) as string;
      const desc = formData.get(`card_desc_${i}`) as string;
      whyChooseReasons.push({ icon, title, desc });
    }
  }

  const heroBadge = formData.get("heroBadge") !== null ? (formData.get("heroBadge") as string) : existing.heroBadge;
  const heroTitle = formData.get("heroTitle") !== null ? (formData.get("heroTitle") as string) : existing.heroTitle;
  const heroSubtitle = formData.get("heroSubtitle") !== null ? (formData.get("heroSubtitle") as string) : existing.heroSubtitle;
  const urgencyText = formData.get("urgencyText") !== null ? (formData.get("urgencyText") as string) : existing.urgencyText;

  let heroImages = existing.heroImages;
  const heroImagesRaw = formData.get("heroImages");
  if (heroImagesRaw !== null) {
    try {
      heroImages = JSON.parse(heroImagesRaw as string);
    } catch (e) {
      heroImages = (heroImagesRaw as string).split(",").map((s: string) => s.trim()).filter(Boolean);
    }
  }

  const heroTitleSize = formData.get("heroTitleSize") !== null ? (formData.get("heroTitleSize") as string) : existing.heroTitleSize;
  const heroSubtitleSize = formData.get("heroSubtitleSize") !== null ? (formData.get("heroSubtitleSize") as string) : existing.heroSubtitleSize;

  const pill1Badge = formData.get("pill1Badge") !== null ? (formData.get("pill1Badge") as string) : existing.pill1Badge;
  const pill1Title = formData.get("pill1Title") !== null ? (formData.get("pill1Title") as string) : existing.pill1Title;
  const pill1Desc = formData.get("pill1Desc") !== null ? (formData.get("pill1Desc") as string) : existing.pill1Desc;

  const pill2Badge = formData.get("pill2Badge") !== null ? (formData.get("pill2Badge") as string) : existing.pill2Badge;
  const pill2Title = formData.get("pill2Title") !== null ? (formData.get("pill2Title") as string) : existing.pill2Title;
  const pill2Desc = formData.get("pill2Desc") !== null ? (formData.get("pill2Desc") as string) : existing.pill2Desc;

  writeFile("settings.json", {
    marqueeText,
    whyChooseBadge,
    whyChooseTitle,
    whyChooseDesc,
    whyChooseReasons,
    heroBadge,
    heroTitle,
    heroSubtitle,
    urgencyText,
    heroImages,
    heroTitleSize,
    heroSubtitleSize,
    pill1Badge,
    pill1Title,
    pill1Desc,
    pill2Badge,
    pill2Title,
    pill2Desc
  });
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

export async function getAISettings() {
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
  
  let settings: any = null;
  const fp = path.join(dataDir, "ai_settings.json");
  if (fs.existsSync(fp)) {
    try {
      settings = JSON.parse(fs.readFileSync(fp, "utf-8"));
    } catch {}
  }

  if (!settings || Array.isArray(settings) || typeof settings !== "object") {
    writeFile("ai_settings.json", fallback, false);
    return fallback;
  }
  
  const merged = { ...fallback, ...settings };
  return merged;
}

export async function saveAISettings(settings: any) {
  writeFile("ai_settings.json", settings);
  return { success: true };
}

export async function getAIChatLogs() {
  return readFile("ai_conversations.json", []);
}

export async function clearAIChatLogs() {
  writeFile("ai_conversations.json", []);
  return { success: true };
}

export async function logConversation(
  conversationId: string,
  messages: any[],
  assistantResponse: string,
  role: string,
  context: any
) {
  try {
    ensureDir();
    const fp = path.join(dataDir, "ai_conversations.json");
    let logs: any[] = [];
    if (fs.existsSync(fp)) {
      try {
        logs = JSON.parse(fs.readFileSync(fp, "utf-8"));
      } catch {}
    }

    // Filter messages to be only clean role/content
    const cleanedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    const updatedMessages = [
      ...cleanedMessages,
      { role: "assistant", content: assistantResponse }
    ];

    const now = new Date().toISOString();
    const existingIndex = logs.findIndex((l: any) => l.id === conversationId);

    if (existingIndex >= 0) {
      logs[existingIndex] = {
        ...logs[existingIndex],
        updatedAt: now,
        messages: updatedMessages,
        messageCount: updatedMessages.length,
        context: { ...logs[existingIndex].context, ...context }
      };
    } else {
      logs.push({
        id: conversationId || `conv_${Date.now()}`,
        role: role || "customer",
        createdAt: now,
        updatedAt: now,
        messages: updatedMessages,
        messageCount: updatedMessages.length,
        context: context || {}
      });
    }

    // Sort by updatedAt descending to show latest first
    logs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Keep the latest 200 conversations
    if (logs.length > 200) {
      logs = logs.slice(0, 200);
    }

    fs.writeFileSync(fp, JSON.stringify(logs, null, 2));
  } catch (e) {
    console.error("Failed to log conversation:", e);
  }
}





