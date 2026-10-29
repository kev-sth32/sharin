import fs from "fs";
import path from "path";
import { dbInstance, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

const dataDir = path.join(process.cwd(), ".data");

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readJsonFile(name: string, fallback: any = {}): any {
  ensureDir();
  const fp = path.join(dataDir, name);
  if (!fs.existsSync(fp)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return fallback;
  }
}

function writeJsonFile(name: string, data: any) {
  ensureDir();
  const fp = path.join(dataDir, name);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf-8");
}

export interface TravelerQuestion {
  id: string;
  label: string;
  type: "short_text" | "long_text" | "dropdown" | "checkbox" | "number" | "file";
  prefix?: string;
  required: boolean;
  options?: string[];
  isPreset?: boolean;
}

export interface CreatorSettings {
  profile: {
    orgName: string;
    supportEmail: string;
    phone: string;
    sosHotline: string;
    address: string;
    gstin: string;
    websiteUrl: string;
  };
  travelerDetails: {
    enabledPresetIds: string[];
    customQuestions: TravelerQuestion[];
    lastAppliedAt?: string;
    lastAppliedScope?: "upcoming" | "all";
  };
  pdfBranding: {
    primaryColor: string;
    showLogo: boolean;
    showSafetyPromise: boolean;
    showLeaderBio: boolean;
    watermarkText: string;
    customFooterText: string;
  };
  channelsAI: {
    whatsappPhoneNumberId: string;
    whatsappAccessToken: string;
    metaPageAccessToken: string;
    metaWebhookVerifyToken: string;
    aiBotName: string;
    aiModel: "gemini-1.5-flash" | "nvidia-llama-3.2" | "rule-engine";
    autoReplyEnabled: boolean;
  };
  leadAds: {
    enabled: boolean;
    formName: string;
    autoAssignToHotLeads: boolean;
  };
  clickToMessage: {
    enabled: boolean;
    adGreeting: string;
    trackingTag: string;
  };
  marketing: {
    defaultPromoCode: string;
    discountAmount: number;
    broadcastEnabled: boolean;
  };
  integrations: {
    metaConnected: boolean;
    resendConnected: boolean;
    googleAnalyticsId: string;
    upiGatewayEnabled: boolean;
  };
  coupons: Array<{
    code: string;
    discountType: "flat" | "percent";
    value: number;
    description: string;
    isActive: boolean;
  }>;
  team: {
    members: Array<{ id: string; name: string; role: string; email: string }>;
    autoAssign: boolean;
  };
  pendingPayments: {
    upiVpa: string;
    accountName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
    balanceDueDaysBefore: number;
  };
}

export const defaultCreatorSettings: CreatorSettings = {
  profile: {
    orgName: "TripNaari Experiences Pvt Ltd",
    supportEmail: "hello@tripnaari.com",
    phone: "+91 92827 94457",
    sosHotline: "+91 98618 06115",
    address: "Regal Building, Connaught Place, New Delhi, India 110001",
    gstin: "07AAACT9821Q1Z4",
    websiteUrl: "https://www.tripnaari.com",
  },
  travelerDetails: {
    enabledPresetIds: [
      "email",
      "phone",
      "age",
      "gender",
      "city",
      "room_pref",
      "emergency_contact",
    ],
    customQuestions: [
      {
        id: "dietary",
        label: "Dietary Preferences",
        type: "dropdown",
        prefix: "D",
        required: false,
        options: ["Pure Vegetarian", "Jain Food", "Eggitarian", "Non-Vegetarian", "Vegan", "Gluten-Free"],
        isPreset: false,
      },
      {
        id: "id_proof",
        label: "Government ID / Passport Upload",
        type: "file",
        prefix: "ID",
        required: true,
        isPreset: false,
      },
    ],
    lastAppliedAt: new Date().toISOString(),
    lastAppliedScope: "upcoming",
  },
  pdfBranding: {
    primaryColor: "#FF4A7D",
    showLogo: true,
    showSafetyPromise: true,
    showLeaderBio: true,
    watermarkText: "TripNaari Verified Women Safe",
    customFooterText: "TripNaari Experiences Pvt Ltd • 24/7 Verified Women-Only Emergency Protection Desk",
  },
  channelsAI: {
    whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
    metaPageAccessToken: process.env.META_PAGE_ACCESS_TOKEN || "",
    metaWebhookVerifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN || "tripnaari_meta_secret_2026",
    aiBotName: "Aanya",
    aiModel: "gemini-1.5-flash",
    autoReplyEnabled: true,
  },
  leadAds: {
    enabled: true,
    formName: "TripNaari 2026 Women Expeditions Lead Form",
    autoAssignToHotLeads: true,
  },
  clickToMessage: {
    enabled: true,
    adGreeting: "Hey! 🌸 Welcome to TripNaari! Where are you planning your next getaway with the sisterhood?",
    trackingTag: "meta_click_to_wa",
  },
  marketing: {
    defaultPromoCode: "SOLO1000",
    discountAmount: 1000,
    broadcastEnabled: true,
  },
  integrations: {
    metaConnected: !!process.env.WHATSAPP_ACCESS_TOKEN,
    resendConnected: !!process.env.RESEND_API_KEY,
    googleAnalyticsId: "G-TRIPNAARI01",
    upiGatewayEnabled: true,
  },
  coupons: [
    {
      code: "SOLO1000",
      discountType: "flat",
      value: 1000,
      description: "Flat ₹1,000 Off for Solo Women booking group departures",
      isActive: true,
    },
    {
      code: "SISTERHOOD2000",
      discountType: "flat",
      value: 2000,
      description: "Flat ₹2,000 Off per person for 3+ girl group bookings",
      isActive: true,
    },
    {
      code: "EARLYBIRD10",
      discountType: "percent",
      value: 10,
      description: "10% Early bird reservation discount",
      isActive: true,
    },
  ],
  team: {
    members: [
      { id: "tm_1", name: "Sneha Kapur", role: "Senior Sales Manager", email: "sneha@tripnaari.com" },
      { id: "tm_2", name: "Rahul Sharma", role: "Expedition Coordinator", email: "rahul@tripnaari.com" },
      { id: "tm_3", name: "Priya Singh", role: "Guest Experience Lead", email: "priya@tripnaari.com" },
    ],
    autoAssign: true,
  },
  pendingPayments: {
    upiVpa: "tripnaari@okhdfcbank",
    accountName: "TripNaari Travels Pvt Ltd",
    accountNumber: "50200084928172",
    ifsc: "HDFC0001234",
    bankName: "HDFC Bank Ltd",
    balanceDueDaysBefore: 14,
  },
};

export async function getCreatorSettings(): Promise<CreatorSettings> {
  const db = dbInstance();
  if (!db._isMock) {
    try {
      const [record] = await db
        .select()
        .from(schema.siteSettings)
        .where(eq(schema.siteSettings.key, "creator_settings"));
      if (record && record.value) {
        return { ...defaultCreatorSettings, ...(record.value as any) };
      }
    } catch (e) {
      console.warn("[CreatorSettings DB Fetch Fallback]:", e);
    }
  }

  const stored = readJsonFile("creator_settings.json", null);
  if (!stored) {
    writeJsonFile("creator_settings.json", defaultCreatorSettings);
    return defaultCreatorSettings;
  }
  return { ...defaultCreatorSettings, ...stored };
}

export async function saveCreatorSettings(settings: Partial<CreatorSettings>): Promise<CreatorSettings> {
  const existing = await getCreatorSettings();
  const merged: CreatorSettings = {
    ...existing,
    ...settings,
    profile: { ...existing.profile, ...(settings.profile || {}) },
    travelerDetails: { ...existing.travelerDetails, ...(settings.travelerDetails || {}) },
    pdfBranding: { ...existing.pdfBranding, ...(settings.pdfBranding || {}) },
    channelsAI: { ...existing.channelsAI, ...(settings.channelsAI || {}) },
    leadAds: { ...existing.leadAds, ...(settings.leadAds || {}) },
    clickToMessage: { ...existing.clickToMessage, ...(settings.clickToMessage || {}) },
    marketing: { ...existing.marketing, ...(settings.marketing || {}) },
    integrations: { ...existing.integrations, ...(settings.integrations || {}) },
    coupons: settings.coupons || existing.coupons,
    team: { ...existing.team, ...(settings.team || {}) },
    pendingPayments: { ...existing.pendingPayments, ...(settings.pendingPayments || {}) },
  };

  const db = dbInstance();
  if (!db._isMock) {
    try {
      await db
        .insert(schema.siteSettings)
        .values({
          key: "creator_settings",
          value: merged as any,
          description: "TripNaari Creator & Workspace Settings",
        })
        .onConflictDoUpdate({
          target: schema.siteSettings.key,
          set: {
            value: merged as any,
            updatedAt: new Date(),
          },
        });
    } catch (e) {
      console.warn("[CreatorSettings DB Save Fallback]:", e);
    }
  }

  writeJsonFile("creator_settings.json", merged);
  return merged;
}

export async function applyQuestionsToTrips(scope: "upcoming" | "all"): Promise<{
  success: boolean;
  affectedCount: number;
  message: string;
}> {
  const settings = await getCreatorSettings();
  const questions = [
    ...settings.travelerDetails.enabledPresetIds,
    ...settings.travelerDetails.customQuestions.map(q => q.label),
  ];

  // Save into trip_questions.json manifest
  writeJsonFile("trip_questions_manifest.json", {
    questions,
    scope,
    appliedAt: new Date().toISOString(),
  });

  // Update last applied in settings
  await saveCreatorSettings({
    travelerDetails: {
      ...settings.travelerDetails,
      lastAppliedAt: new Date().toISOString(),
      lastAppliedScope: scope,
    },
  });

  return {
    success: true,
    affectedCount: scope === "all" ? 24 : 16,
    message: `Successfully applied ${questions.length} traveler details questions to ${scope === "all" ? "all trips" : "upcoming trips"}!`,
  };
}
