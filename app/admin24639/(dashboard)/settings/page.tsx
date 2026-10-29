import { getCreatorSettings } from "@/lib/creator-settings";
import SettingsConsole from "@/components/admin/settings/SettingsConsole";

export const metadata = {
  title: "Settings & Workspace Setup | TripNaari Admin",
  description: "Configure traveler intake details, PDF branding, AI channels, payments, and team seats.",
};

export default async function SettingsPage() {
  const settings = await getCreatorSettings();

  return <SettingsConsole initialSettings={settings} />;
}
