export function touristTripStructuredData(trip: any) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tripnaari.com";
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: trip.title,
    description: trip.shortDescription || trip.description,
    touristType: ["Women-only", "Solo Female Travelers", "Women Group Travel"],
    image: trip.heroImage ? [trip.heroImage] : [],
    offers: {
      "@type": "Offer",
      price: trip.priceFrom || trip.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/trips/${trip.slug}`,
      validFrom: new Date().toISOString().split("T")[0],
    },
    provider: {
      "@type": "TravelAgency",
      name: "TripNaari",
      url: siteUrl,
      logo: `${siteUrl}/icon.png`,
    },
    itinerary: trip.itinerary
      ? trip.itinerary.map((day: any, i: number) => ({
          "@type": "City",
          name: `Day ${day.day || i + 1}: ${day.title || ""}`,
          description: day.description || "",
        }))
      : [],
  };
}

export function faqStructuredData(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function blogArticleStructuredData(post: any) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tripnaari.com";
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.shortDescription,
    image: post.coverImage ? [post.coverImage] : [`${siteUrl}/og-image.jpg`],
    datePublished: post.createdAt || new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: "TripNaari Editorial Team",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "TripNaari",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`,
    },
  };
}

export function breadcrumbStructuredData(items: { name: string; item: string }[]) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tripnaari.com";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: it.item.startsWith("http") ? it.item : `${siteUrl}${it.item}`,
    })),
  };
}
