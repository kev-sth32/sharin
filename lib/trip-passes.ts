import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { dbInstance, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { broadcastCrmEvent } from "@/lib/crm-events";

const dataDir = path.join(process.cwd(), ".data");

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readJsonFile(name: string, fallback: any[] = []): any[] {
  ensureDir();
  const fp = path.join(dataDir, name);
  if (!fs.existsSync(fp)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return fallback;
  }
}

function writeJsonFile(name: string, data: any[]) {
  ensureDir();
  const fp = path.join(dataDir, name);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf-8");
}

export interface TripPassData {
  id: number;
  ticketId: string;
  quoteId?: string;
  conversationId?: number;
  leadId?: number;
  tripTitle: string;
  tripSlug: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string;
  emergencyContact?: string;
  departureDate: string;
  travelersCount: number;
  tripLeaderName: string;
  pickupLocation: string;
  totalAmount: number;
  depositPaid: number;
  balanceDue: number;
  balanceDueDate?: string;
  balanceStatus: "cleared" | "pending";
  checkInStatus: "confirmed" | "checked_in";
  checkedInAt?: string;
  checkedInBy?: string;
  qrCodeDataUrl?: string;
  createdAt: string;
}

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 320,
      margin: 2,
      color: {
        dark: "#13253D", // TripNaari Indigo
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    });
  } catch (err) {
    console.error("[QR Code Error]:", err);
    return "";
  }
}

export async function createTripPass(input: {
  quoteId?: string;
  conversationId?: number;
  leadId?: number;
  tripTitle: string;
  tripSlug: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string;
  emergencyContact?: string;
  departureDate: string;
  travelersCount?: number;
  tripLeaderName?: string;
  pickupLocation?: string;
  totalAmount: number;
  depositPaid: number;
  siteUrl?: string;
}): Promise<TripPassData> {
  const ticketId = `TN-PASS-${Math.floor(100000 + Math.random() * 900000)}`;
  const siteUrl = input.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://tripnaari.com";
  const verificationUrl = `${siteUrl}/boarding-pass/${ticketId}`;

  const qrCodeDataUrl = await generateQrDataUrl(verificationUrl);

  const travelersCount = input.travelersCount || 1;
  const balanceDue = Math.max(0, input.totalAmount - input.depositPaid);
  const balanceStatus = balanceDue <= 0 ? "cleared" : "pending";

  // Default balance due date: 14 days before departure or 30 days from now
  const balanceDueDate = "14 days before departure";

  const newPass: TripPassData = {
    id: Date.now(),
    ticketId,
    quoteId: input.quoteId,
    conversationId: input.conversationId,
    leadId: input.leadId,
    tripTitle: input.tripTitle,
    tripSlug: input.tripSlug,
    passengerName: input.passengerName,
    passengerPhone: input.passengerPhone,
    passengerEmail: input.passengerEmail,
    emergencyContact: input.emergencyContact || "+91 98618 06115 (TripNaari SOS)",
    departureDate: input.departureDate,
    travelersCount,
    tripLeaderName: input.tripLeaderName || "Sneha Kapur (Certified Female Tour Leader)",
    pickupLocation: input.pickupLocation || "Indira Gandhi International Airport, Terminal 3, Pillar 4",
    totalAmount: input.totalAmount,
    depositPaid: input.depositPaid,
    balanceDue,
    balanceDueDate,
    balanceStatus,
    checkInStatus: "confirmed",
    qrCodeDataUrl,
    createdAt: new Date().toISOString(),
  };

  const db = dbInstance();
  if (!db._isMock) {
    try {
      await db.insert(schema.tripPasses).values({
        ticketId: newPass.ticketId,
        quoteId: newPass.quoteId,
        conversationId: newPass.conversationId,
        leadId: newPass.leadId,
        tripTitle: newPass.tripTitle,
        tripSlug: newPass.tripSlug,
        passengerName: newPass.passengerName,
        passengerPhone: newPass.passengerPhone,
        passengerEmail: newPass.passengerEmail,
        emergencyContact: newPass.emergencyContact,
        departureDate: newPass.departureDate,
        travelersCount: newPass.travelersCount,
        tripLeaderName: newPass.tripLeaderName,
        pickupLocation: newPass.pickupLocation,
        totalAmount: newPass.totalAmount,
        depositPaid: newPass.depositPaid,
        balanceDue: newPass.balanceDue,
        balanceDueDate: newPass.balanceDueDate,
        balanceStatus: newPass.balanceStatus,
        checkInStatus: newPass.checkInStatus,
        qrCodeDataUrl: newPass.qrCodeDataUrl,
      });
    } catch (err) {
      console.error("[TripPass DB insert error, saving to JSON fallback]:", err);
    }
  }

  // Always keep in JSON for fallback and offline resilience
  const passes = readJsonFile("trip_passes.json", []);
  passes.unshift(newPass);
  writeJsonFile("trip_passes.json", passes);

  return newPass;
}

export async function getTripPassByTicketId(ticketId: string): Promise<TripPassData | null> {
  const db = dbInstance();
  if (!db._isMock) {
    try {
      const [pass] = await db
        .select()
        .from(schema.tripPasses)
        .where(eq(schema.tripPasses.ticketId, ticketId));
      if (pass) return pass as any;
    } catch (err) {
      console.warn("[TripPass DB fetch fallback]:", err);
    }
  }

  const passes = readJsonFile("trip_passes.json", []);
  return passes.find((p: any) => p.ticketId === ticketId) || null;
}

export async function getAllTripPasses(): Promise<TripPassData[]> {
  const db = dbInstance();
  if (!db._isMock) {
    try {
      const passes = await db.select().from(schema.tripPasses);
      if (passes.length > 0) return passes as any;
    } catch (err) {
      console.warn("[TripPass DB fetch all fallback]:", err);
    }
  }

  return readJsonFile("trip_passes.json", []);
}

export async function checkInPass(ticketId: string, checkedInBy: string = "Tour Leader"): Promise<{ success: boolean; pass?: TripPassData; error?: string }> {
  const passes = readJsonFile("trip_passes.json", []);
  const idx = passes.findIndex((p: any) => p.ticketId === ticketId);

  if (idx === -1) {
    return { success: false, error: "Boarding pass not found with Ticket ID: " + ticketId };
  }

  const pass = passes[idx];
  const now = new Date().toISOString();
  pass.checkInStatus = "checked_in";
  pass.checkedInAt = now;
  pass.checkedInBy = checkedInBy;

  passes[idx] = pass;
  writeJsonFile("trip_passes.json", passes);

  const db = dbInstance();
  if (!db._isMock) {
    try {
      await db
        .update(schema.tripPasses)
        .set({
          checkInStatus: "checked_in",
          checkedInAt: new Date(),
          checkedInBy,
        })
        .where(eq(schema.tripPasses.ticketId, ticketId));
    } catch (err) {
      console.error("[TripPass DB check-in error]:", err);
    }
  }

  broadcastCrmEvent({
    type: "passenger_checked_in",
    conversationId: pass.conversationId || 0,
    channel: "whatsapp",
    customerName: pass.passengerName,
    messageText: `[Gate Check-In Confirmed]: ${pass.passengerName} checked in for ${pass.tripTitle} by ${checkedInBy}`,
    timestamp: now,
    metadata: { ticketId, tripTitle: pass.tripTitle },
  });

  return { success: true, pass };
}
