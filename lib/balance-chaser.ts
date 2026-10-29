import { getAllTripPasses, getTripPassByTicketId, TripPassData } from "@/lib/trip-passes";
import { sendWhatsAppMessage, sendInstagramDm } from "@/lib/ai-crm";
import { broadcastCrmEvent } from "@/lib/crm-events";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), ".data");
function readJsonFile(name: string, fallback: any[] = []): any[] {
  const fp = path.join(dataDir, name);
  if (!fs.existsSync(fp)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return fallback;
  }
}
function writeJsonFile(name: string, data: any[]) {
  const fp = path.join(dataDir, name);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf-8");
}

export interface BalanceDueRecord {
  ticketId: string;
  passengerName: string;
  passengerPhone: string;
  tripTitle: string;
  departureDate: string;
  totalAmount: number;
  depositPaid: number;
  balanceDue: number;
  balanceDueDate: string;
  balanceStatus: "cleared" | "pending";
  remindersSent: number;
  lastReminderAt?: string;
}

export async function getBalanceDueBookings(): Promise<BalanceDueRecord[]> {
  const passes = await getAllTripPasses();
  const balanceLogs = readJsonFile("balance_reminders.json", []);

  return passes
    .filter((p) => p.balanceDue > 0 && p.balanceStatus === "pending")
    .map((p) => {
      const log = balanceLogs.find((l: any) => l.ticketId === p.ticketId);
      return {
        ticketId: p.ticketId,
        passengerName: p.passengerName,
        passengerPhone: p.passengerPhone,
        tripTitle: p.tripTitle,
        departureDate: p.departureDate,
        totalAmount: p.totalAmount,
        depositPaid: p.depositPaid,
        balanceDue: p.balanceDue,
        balanceDueDate: p.balanceDueDate || "14 days prior to departure",
        balanceStatus: p.balanceStatus,
        remindersSent: log?.remindersSent || 0,
        lastReminderAt: log?.lastReminderAt,
      };
    });
}

export async function sendBalanceReminder(
  ticketId: string,
  options?: { customAmount?: number; dueDate?: string }
): Promise<{ success: boolean; messageText: string; error?: string }> {
  const pass = await getTripPassByTicketId(ticketId);
  if (!pass) {
    return { success: false, messageText: "", error: "Trip pass not found for " + ticketId };
  }

  const amountDue = options?.customAmount !== undefined ? options.customAmount : pass.balanceDue;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tripnaari.com";
  const payUrl = `${siteUrl}/pay/${pass.quoteId || ticketId}?type=balance&amount=${amountDue}`;

  const messageText = `🏔️ *UPCOMING EXPEDITION: FINAL BALANCE REMINDER*
━━━━━━━━━━━━━━━━━━━━
Hi ${pass.passengerName}! 🌸 

Your journey for *${pass.tripTitle}* (*${pass.departureDate}*) is getting closer! ✨

To finalize your hotel reservations, internal permits, and domestic transfers, please settle the remaining balance:

💰 *Total Package*: ₹${pass.totalAmount.toLocaleString("en-IN")}
💳 *Deposit Received*: ₹${pass.depositPaid.toLocaleString("en-IN")}
⏳ *Remaining Balance Due*: *₹${amountDue.toLocaleString("en-IN")}*
📅 *Due Date*: ${options?.dueDate || pass.balanceDueDate || "Within 48 hours"}

👉 *Click to Clear Balance via UPI / QR*:
${payUrl}

Once settled, your verified flight / pickup vouchers and hotel names will be unlocked on your Digital Boarding Pass! 🎒`;

  try {
    await sendWhatsAppMessage(pass.passengerPhone, messageText);
  } catch (err) {
    console.warn("[WhatsApp Balance Send Error]:", err);
  }

  // Record reminder log
  const balanceLogs = readJsonFile("balance_reminders.json", []);
  const idx = balanceLogs.findIndex((l: any) => l.ticketId === ticketId);
  const now = new Date().toISOString();

  if (idx >= 0) {
    balanceLogs[idx].remindersSent = (balanceLogs[idx].remindersSent || 0) + 1;
    balanceLogs[idx].lastReminderAt = now;
  } else {
    balanceLogs.push({
      ticketId,
      passengerPhone: pass.passengerPhone,
      remindersSent: 1,
      lastReminderAt: now,
    });
  }
  writeJsonFile("balance_reminders.json", balanceLogs);

  broadcastCrmEvent({
    type: "balance_reminder_sent",
    conversationId: pass.conversationId || 0,
    channel: "whatsapp",
    customerName: pass.passengerName,
    messageText: `[Balance Reminder Sent]: ₹${amountDue.toLocaleString("en-IN")} due for ${pass.tripTitle}`,
    timestamp: now,
    metadata: { ticketId, amountDue },
  });

  return { success: true, messageText };
}

export async function runAutomatedBalanceChaser(): Promise<{ processedCount: number; reminders: string[] }> {
  const records = await getBalanceDueBookings();
  const reminders: string[] = [];
  const now = Date.now();

  for (const record of records) {
    // Only send if never sent or if last sent > 48 hours ago
    const lastTime = record.lastReminderAt ? new Date(record.lastReminderAt).getTime() : 0;
    const hoursSinceLast = (now - lastTime) / (1000 * 60 * 60);

    if (!record.lastReminderAt || hoursSinceLast >= 48) {
      const res = await sendBalanceReminder(record.ticketId);
      if (res.success) {
        reminders.push(`Sent reminder to ${record.passengerName} (₹${record.balanceDue.toLocaleString("en-IN")})`);
      }
    }
  }

  return { processedCount: reminders.length, reminders };
}
