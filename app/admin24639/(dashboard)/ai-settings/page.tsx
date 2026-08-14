import { getAISettings } from "@/lib/admin-store";
import { getMergedTrips, getMergedDepartures, getMergedFAQs, getMergedPolicies } from "@/lib/public-store";
import AISettingsManager from "@/components/admin/AISettingsManager";

export default async function AISettingsAdmin() {
  const settings = await getAISettings();
  const dbCounts = {
    trips: getMergedTrips().length,
    departures: getMergedDepartures().length,
    faqs: getMergedFAQs().length,
    policies: getMergedPolicies().length,
  };

  return (
    <div className="space-y-6">
      <AISettingsManager initialSettings={settings} dbCounts={dbCounts} />
    </div>
  );
}
