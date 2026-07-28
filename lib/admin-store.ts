"use server";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { tripPackagesSeed, destinationsSeed, testimonialsSeed, tripLeadersSeed, faqsSeed, blogSeed } from "./data";

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
  const custom = readFile("custom_trips.json", []);
  const newsletter = readFile("newsletter.json", []);
  const contacts = readFile("contacts.json", []);
  const refunds = readFile("refunds.json", []);
  const tripsOverrides = readFile("trips_overrides.json", []);
  const tripsCustom = readFile("trips_custom.json", []);
  const destOverrides = readFile("destinations_overrides.json", []);
  const destCustom = readFile("destinations_custom.json", []);
  const testimonialsOverrides = readFile("testimonials_overrides.json", []);
  const leadersOverrides = readFile("leaders_overrides.json", []);
  const leadersCustom = readFile("leaders_custom.json", []);

  const transactions = readFile("transactions.json", []);
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

  const destinations = [
    ...destinationsSeed.map((d: any) => {
      const over = destOverrides.find((o: any) => o.slug === d.slug);
      if (over?.isDeleted) return null as any;
      return over ? { ...d, ...over } : d;
    }).filter(Boolean),
    ...destCustom
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
      destinations: destinations.length,
      testimonials: testimonials.length,
      totalRevenue,
      totalExpenses,
      netProfit,
    },
    leads: leads.reverse(),
    trips,
    destinations,
    testimonials,
    tripLeaders,
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
export async function getDestinationBySlug(slug: string) {
  const data = await getAdminData();
  return data.destinations.find((d: any)=>d.slug===slug) || null;
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

// ===== Destination CRUD =====
export async function toggleDestinationPublished(slug: string) {
  const overrides = readFile("destinations_overrides.json", []);
  const idx = overrides.findIndex((o: any) => o.slug === slug);
  if (idx >= 0) overrides[idx].isPublished = !overrides[idx].isPublished;
  else overrides.push({ slug, isPublished: false });
  writeFile("destinations_overrides.json", overrides);
  return { success: true };
}
export async function saveDestination(formData: FormData) {
  const slug = (formData.get("slug") as string).toLowerCase().replace(/[^a-z0-9]+/g,"-");
  const custom = readFile("destinations_custom.json", []);
  const overrides = readFile("destinations_overrides.json", []);
  const data: any = {
    slug,
    name: formData.get("name") as string,
    tagline: formData.get("tagline") as string,
    description: formData.get("description") as string,
    region: formData.get("region") as string,
    heroImage: formData.get("heroImage") as string,
    bestSeason: formData.get("bestSeason") as string,
    idealFor: (formData.get("idealFor") as string)?.split(",").map(s=>s.trim()).filter(Boolean) || [],
    isInternational: formData.get("isInternational")==="on",
    isPublished: formData.get("isPublished")!=="off",
  };
  const isSeed = destinationsSeed.some(d=>d.slug===slug);
  if (isSeed) {
    const idx = overrides.findIndex((o:any)=>o.slug===slug);
    if (idx>=0) overrides[idx] = { ...overrides[idx], ...data };
    else overrides.push(data);
    writeFile("destinations_overrides.json", overrides);
  } else {
    const idx = custom.findIndex((d:any)=>d.slug===slug);
    if (idx>=0) custom[idx] = { ...custom[idx], ...data };
    else custom.push({ ...data, createdAt: new Date().toISOString() });
    writeFile("destinations_custom.json", custom);
  }
  return { success: true, slug };
}
export async function deleteDestination(slug: string) {
  const custom = readFile("destinations_custom.json", []);
  const filtered = custom.filter((d:any)=>d.slug!==slug);
  if (filtered.length!==custom.length) { writeFile("destinations_custom.json", filtered); return {success:true}; }
  const overrides = readFile("destinations_overrides.json", []);
  const idx = overrides.findIndex((o: any) => o.slug === slug);
  if (idx >= 0) {
    overrides[idx] = { ...overrides[idx], isDeleted: true, isPublished: false };
  } else {
    overrides.push({ slug, isDeleted: true, isPublished: false });
  }
  writeFile("destinations_overrides.json", overrides);
  return { success: true };
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


