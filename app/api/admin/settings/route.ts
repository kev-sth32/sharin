import { NextRequest, NextResponse } from "next/server";
import { getCreatorSettings, saveCreatorSettings, applyQuestionsToTrips } from "@/lib/creator-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getCreatorSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, settings, scope } = body;

    if (action === "apply_to_trips") {
      const result = await applyQuestionsToTrips(scope || "upcoming");
      return NextResponse.json(result);
    }

    if (settings) {
      const updated = await saveCreatorSettings(settings);
      return NextResponse.json({
        success: true,
        message: "Settings saved successfully!",
        settings: updated,
      });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (err: any) {
    console.error("[Settings API Save Error]:", err);
    return NextResponse.json({ success: false, error: err?.message || "Internal server error" }, { status: 500 });
  }
}
