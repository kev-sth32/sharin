import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import SiteLayoutWrapper from "@/components/layout/SiteLayoutWrapper";
import CustomerChatbot from "@/components/chat/CustomerChatbot";
import PWARegistry from "@/components/layout/PWARegistry";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400","500","600","700","800"],
});

export const metadata: Metadata = {
  title: {
    default: "TripNaari - Women-First Travel | Travel Fearless, We've Got Your Backpack",
    template: "%s | TripNaari",
  },
  description: "Women-oriented travel company & community for safe, handcrafted domestic & international trips. 3000+ women, verified stays, women trip leaders 24x7. Bangalore based, MSME & Startup India recognised.",
  keywords: ["women travel", "solo women travel India", "women only tours", "TripNaari", "safe travel for women", "Kashmir women trip", "Kerala women trip"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://tripnaari.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "TripNaari",
    title: "TripNaari - Travel Fearless, We've Got Your Backpack",
    description: "Empower | Encourage | Freedom | Safety. Women-only group tours, custom trips, weekend getaways.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  verification: {
    google: "tripnaari-verification",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#800F2D" />
        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context":"https://schema.org",
          "@type":"TravelAgency",
          "name":"TripNaari",
          "description":"Women-first travel company & community",
          "url":"https://tripnaari.com",
          "logo":"https://tripnaari.com/logo.png",
          "sameAs":["https://www.instagram.com/tripnaari"],
          "address":{"@type":"PostalAddress","addressLocality":"Bangalore","addressCountry":"IN"},
          "founder":"TripNaari",
          "aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":"1200"}
        })}} />
      </head>
      <body className="min-h-full flex flex-col bg-[#FFF8F0] text-[#13253D]">
        <SiteLayoutWrapper>{children}</SiteLayoutWrapper>
        <CustomerChatbot />
        <PWARegistry />
      </body>
    </html>
  );
}

