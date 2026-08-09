import { dbInstance, isRealDb } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import fs from "fs";
import path from "path";
import NotificationPanel from "@/components/admin/NotificationPanel";

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

export const metadata = {
  title: "Push Alerts Control Panel | TripNaari Admin",
};

export default async function AdminNotificationsPage() {
  let subscribersCount = 0;
  
  if (isRealDb()) {
    try {
      const db = dbInstance();
      const subs = await db.select().from(pushSubscriptions);
      subscribersCount = subs.length;
    } catch (e) {
      console.error("Failed to query real database for subscribers:", e);
      // Fallback
      subscribersCount = getJsonSubscriptionsCount();
    }
  } else {
    subscribersCount = getJsonSubscriptionsCount();
  }

  const history = getCampaignsHistory();

  return (
    <div className="max-w-[1200px] mx-auto">
      <NotificationPanel 
        subscribersCount={subscribersCount} 
        campaignsHistory={history} 
      />
    </div>
  );
}
