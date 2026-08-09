import { NextResponse } from "next/server";
import { dbInstance, isRealDb } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import webpush from "web-push";

const dataDir = path.join(process.cwd(), ".data");
const jsonFile = "push_subscriptions.json";

function getJsonSubscriptions(): any[] {
  const fp = path.join(dataDir, jsonFile);
  if (!fs.existsSync(fp)) return [];
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return [];
  }
}

function saveJsonSubscriptions(subs: any[]) {
  const fp = path.join(dataDir, jsonFile);
  fs.writeFileSync(fp, JSON.stringify(subs, null, 2));
}

// Configure VAPID details
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:hello@tripnaari.com";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

export async function POST(req: Request) {
  try {
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      return NextResponse.json(
        { success: false, error: "VAPID keys not configured in environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { title, message, url, image, isTest } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "Title and message are required." }, { status: 400 });
    }

    // Load subscribers
    let subscribers: any[] = [];
    if (isRealDb()) {
      const db = dbInstance();
      subscribers = await db.select().from(pushSubscriptions);
    } else {
      subscribers = getJsonSubscriptions();
    }

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        sentCount: 0,
        failedCount: 0,
        prunedCount: 0,
        message: "No subscribers registered yet.",
      });
    }

    // If test mode, send only to the last registered device/subscriber
    const targets = isTest ? [subscribers[subscribers.length - 1]] : subscribers;

    let sentCount = 0;
    let failedCount = 0;
    const deadEndpoints: string[] = [];

    const payload = JSON.stringify({
      title,
      body: message,
      url: url || "/",
      image: image || undefined,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });

    const pushPromises = targets.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        sentCount++;
      } catch (error: any) {
        failedCount++;
        console.error(`Failed to push notification to ${sub.endpoint.slice(0, 40)}...`, error.statusCode);
        
        // Status code 404 or 410 indicates subscription has expired or is invalid. We should prune it.
        if (error.statusCode === 404 || error.statusCode === 410) {
          deadEndpoints.push(sub.endpoint);
        }
      }
    });

    await Promise.all(pushPromises);

    // Prune dead subscriptions
    let prunedCount = 0;
    if (deadEndpoints.length > 0) {
      prunedCount = deadEndpoints.length;
      if (isRealDb()) {
        const db = dbInstance();
        for (const ep of deadEndpoints) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, ep));
        }
      } else {
        const subs = getJsonSubscriptions();
        const cleaned = subs.filter((s) => !deadEndpoints.includes(s.endpoint));
        saveJsonSubscriptions(cleaned);
      }
    }

    // Track campaign in notification_campaigns.json history
    try {
      const historyFile = path.join(dataDir, "notification_campaigns.json");
      let history: any[] = [];
      if (fs.existsSync(historyFile)) {
        try { history = JSON.parse(fs.readFileSync(historyFile, "utf-8")); } catch {}
      }
      history.push({
        id: Date.now(),
        title,
        message,
        url: url || "/",
        image: image || null,
        isTest: !!isTest,
        sentCount,
        failedCount,
        prunedCount,
        createdAt: new Date().toISOString(),
      });
      fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    } catch (e) {
      console.error("Failed to write to notification campaign history:", e);
    }

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      prunedCount,
      message: `Notifications sent: ${sentCount} succeeded, ${failedCount} failed. Pruned ${prunedCount} inactive devices.`,
    });
  } catch (error: any) {
    console.error("Error in sending push notifications route:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
