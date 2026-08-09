import { NextResponse } from "next/server";
import { dbInstance, isRealDb } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), ".data");
const jsonFile = "push_subscriptions.json";
const historyFile = "notification_campaigns.json";

function getJsonSubscriptionsCount(): number {
  const fp = path.join(dataDir, jsonFile);
  if (!fs.existsSync(fp)) return 0;
  try {
    const list = JSON.parse(fs.readFileSync(fp, "utf-8"));
    return Array.isArray(list) ? list.length : 0;
  } catch {
    return 0;
  }
}

function getCampaignsHistory(): any[] {
  const fp = path.join(dataDir, historyFile);
  if (!fs.existsSync(fp)) return [];
  try {
    const list = JSON.parse(fs.readFileSync(fp, "utf-8"));
    // Sort campaigns: newest first
    return Array.isArray(list) ? list.sort((a, b) => b.id - a.id) : [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    let subscribersCount = 0;
    
    if (isRealDb()) {
      const db = dbInstance();
      const subs = await db.select().from(pushSubscriptions);
      subscribersCount = subs.length;
    } else {
      subscribersCount = getJsonSubscriptionsCount();
    }

    const history = getCampaignsHistory();

    return NextResponse.json({
      success: true,
      subscribersCount,
      history,
    });
  } catch (error: any) {
    console.error("Error in stats fetch route:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
