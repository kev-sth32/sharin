import { NextResponse } from "next/server";
import { getAISettings, getMergedTrips, getMergedDepartures } from "@/lib/public-store";

export async function GET() {
  try {
    const settings = getAISettings();
    // Exclude sensitive API key for security
    const { nvidiaApiKey, ...publicSettings } = settings;
    const trips = getMergedTrips();
    const departures = getMergedDepartures();

    return NextResponse.json({
      ...publicSettings,
      tripsSummary: trips.map((t: any) => ({
        slug: t.slug,
        title: t.title,
        shortDescription: t.shortDescription,
        heroImage: t.heroImage,
        durationDays: t.durationDays,
        durationNights: t.durationNights,
        priceFrom: t.priceFrom,
        priceOriginal: t.priceOriginal,
        ratingAvg: t.ratingAvg,
        ratingCount: t.ratingCount,
        highlights: t.highlights || []
      })),
      departuresSummary: departures
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to load AI settings" }, { status: 500 });
  }
}

