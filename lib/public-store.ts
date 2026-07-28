import fs from "fs";
import path from "path";
import { tripPackagesSeed, destinationsSeed, testimonialsSeed, tripLeadersSeed, faqsSeed, blogSeed } from "./data";

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

export function getMergedDestinations() {
  const overrides = readFile("destinations_overrides.json", []);
  const custom = readFile("destinations_custom.json", []);
  const merged = [
    ...destinationsSeed.map((d: any) => {
      const over = overrides.find((o: any) => o.slug === d.slug);
      if (over?.isDeleted) return null as any;
      return over ? { ...d, ...over } : d;
    }).filter(Boolean),
    ...custom
  ];
  return merged.filter((d:any)=>d.isPublished!==false);
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
