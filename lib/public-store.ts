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

