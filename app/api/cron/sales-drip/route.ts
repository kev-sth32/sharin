import { NextRequest, NextResponse } from "next/server";
import { runSalesDripEngine } from "@/lib/sales-engine";

export const dynamic = "force-dynamic";

/**
 * GET/POST Handler for automated background cron drip runner
 * Can be called by Vercel Cron, cPanel Cron Job, or GitHub Actions
 */
export async function GET(req: NextRequest) {
  return handleCronExecution(req);
}

export async function POST(req: NextRequest) {
  return handleCronExecution(req);
}

async function handleCronExecution(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Optional security check if CRON_SECRET is configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const url = new URL(req.url);
      const keyParam = url.searchParams.get("key");
      if (keyParam !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized cron trigger key" }, { status: 401 });
      }
    }

    console.log("[Cron Engine] Running Automated Sales Drip Evaluation...");
    const result = await runSalesDripEngine();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      evaluated: result.processedCount,
      messagesSent: result.messagesSent
    });
  } catch (err: any) {
    console.error("[Cron Engine Exception]:", err);
    return NextResponse.json({ error: "Cron execution error", message: err.message }, { status: 500 });
  }
}
