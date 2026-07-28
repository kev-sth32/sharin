import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "TripNaari",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    db: process.env.DATABASE_URL ? "configured" : "mock-file",
    brand: "Empower | Encourage | Freedom | Safety",
  });
}
