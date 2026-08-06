import { MetadataRoute } from "next";
import { tripPackagesSeed, blogSeed } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://tripnaari.com";
  const staticRoutes = ["", "/trips", "/safety", "/about", "/contact", "/blog", "/policies", "/policies/cancellation-refund", "/policies/safety-promise"].map(p=>({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p===""?1:0.8,
  }));
  const tripRoutes = tripPackagesSeed.map(t=>({ url: `${base}/trips/${t.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 }));
  const blogRoutes = blogSeed.map(b=>({ url: `${base}/blog/${b.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 }));
  return [...staticRoutes, ...tripRoutes, ...blogRoutes];
}
