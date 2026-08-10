import { NextResponse } from "next/server";
import { getAISettings } from "@/lib/public-store";

export async function GET() {
  try {
    const settings = getAISettings();
    // Exclude the API key for security
    const { nvidiaApiKey, ...publicSettings } = settings;
    return NextResponse.json(publicSettings);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to load AI settings" }, { status: 500 });
  }
}
