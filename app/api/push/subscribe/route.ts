import { NextResponse } from "next/server";
import { dbInstance, isRealDb } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), ".data");
const jsonFile = "push_subscriptions.json";

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function getJsonSubscriptions(): any[] {
  ensureDir();
  const fp = path.join(dataDir, jsonFile);
  if (!fs.existsSync(fp)) return [];
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return [];
  }
}

function saveJsonSubscriptions(subs: any[]) {
  ensureDir();
  const fp = path.join(dataDir, jsonFile);
  fs.writeFileSync(fp, JSON.stringify(subs, null, 2));
}

export async function POST(req: Request) {
  try {
    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return NextResponse.json(
        { success: false, error: "Invalid subscription details. Must provide endpoint, auth, and p256dh keys." },
        { status: 400 }
      );
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    if (isRealDb()) {
      const db = dbInstance();
      // Check if already subscribed
      const existing = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, endpoint));

      if (existing.length === 0) {
        await db.insert(pushSubscriptions).values({
          endpoint,
          p256dh,
          auth,
        });
      } else {
        // Update keys if already exists
        await db
          .update(pushSubscriptions)
          .set({ p256dh, auth })
          .where(eq(pushSubscriptions.endpoint, endpoint));
      }
    } else {
      // Fallback JSON persistence
      const subs = getJsonSubscriptions();
      const existingIndex = subs.findIndex((s) => s.endpoint === endpoint);

      if (existingIndex === -1) {
        subs.push({
          id: Date.now(),
          endpoint,
          p256dh,
          auth,
          createdAt: new Date().toISOString(),
        });
      } else {
        subs[existingIndex] = {
          ...subs[existingIndex],
          p256dh,
          auth,
        };
      }
      saveJsonSubscriptions(subs);
    }

    return NextResponse.json({ success: true, message: "Subscription registered successfully" });
  } catch (error: any) {
    console.error("Error in subscription POST route:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json({ success: false, error: "Endpoint is required" }, { status: 400 });
    }

    if (isRealDb()) {
      const db = dbInstance();
      await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
    } else {
      // Fallback JSON persistence
      const subs = getJsonSubscriptions();
      const updated = subs.filter((s) => s.endpoint !== endpoint);
      saveJsonSubscriptions(updated);
    }

    return NextResponse.json({ success: true, message: "Subscription removed successfully" });
  } catch (error: any) {
    console.error("Error in subscription DELETE route:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
