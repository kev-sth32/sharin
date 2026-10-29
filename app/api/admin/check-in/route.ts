import { NextRequest, NextResponse } from "next/server";
import { getAllTripPasses, getTripPassByTicketId, checkInPass } from "@/lib/trip-passes";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");
    const tripSlug = searchParams.get("tripSlug");

    if (ticketId) {
      const pass = await getTripPassByTicketId(ticketId);
      if (!pass) {
        return NextResponse.json({ success: false, error: "Boarding pass not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, pass });
    }

    const all = await getAllTripPasses();
    if (tripSlug) {
      return NextResponse.json({ success: true, passes: all.filter(p => p.tripSlug === tripSlug) });
    }

    return NextResponse.json({ success: true, passes: all });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to fetch passes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, checkedInBy } = body;

    if (!ticketId) {
      return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
    }

    const result = await checkInPass(ticketId, checkedInBy || "Tour Leader");
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Passenger ${result.pass?.passengerName} checked in successfully!`,
      pass: result.pass,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Internal server error" }, { status: 500 });
  }
}
