import fs from "fs";
import path from "path";
import { dbInstance, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { broadcastCrmEvent } from "@/lib/crm-events";
import { createTripPass, TripPassData } from "@/lib/trip-passes";
import { sendWhatsAppMessage, sendInstagramDm } from "@/lib/ai-crm";

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

export interface PaymentProofData {
  id: number;
  quoteId?: string;
  conversationId?: number;
  leadId?: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  tripTitle: string;
  tripSlug?: string;
  departureDate?: string;
  travelersCount: number;
  amountPaid: number;
  paymentType: "deposit" | "balance" | "full";
  paymentMethod: "upi_qr" | "gpay" | "phonepe" | "bank_transfer";
  utrNumber: string;
  proofImageUrl: string;
  payerNotes?: string;
  status: "pending" | "verified" | "rejected";
  adminNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  ticketId?: string;
  createdAt: string;
}

// Sample seed proofs if none exist so the review center works right away
const seedPaymentProofs: PaymentProofData[] = [
  {
    id: 101,
    quoteId: "TN-QUOTE-948201",
    conversationId: 9001,
    customerName: "Roshni Patel",
    customerPhone: "+91 98201 44521",
    customerEmail: "roshni.patel@gmail.com",
    tripTitle: "Kashmir Blossom Sisterhood",
    tripSlug: "kashmir-blossom-sisterhood",
    departureDate: "18 Nov 2026",
    travelersCount: 2,
    amountPaid: 16000,
    paymentType: "deposit",
    paymentMethod: "gpay",
    utrNumber: "428901928371",
    proofImageUrl: "/uploads/proof-sample.jpg",
    payerNotes: "Paid via GPay from Roshni Patel SBI A/c for 2 seats.",
    status: "pending",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 102,
    quoteId: "TN-QUOTE-639104",
    conversationId: 9002,
    customerName: "Meenakshi Sundaram",
    customerPhone: "+91 94440 18274",
    customerEmail: "meena.s@outlook.com",
    tripTitle: "Ladakh High Passes Special",
    tripSlug: "ladakh-high-passes-special",
    departureDate: "05 Dec 2026",
    travelersCount: 1,
    amountPaid: 8000,
    paymentType: "deposit",
    paymentMethod: "upi_qr",
    utrNumber: "429012384910",
    proofImageUrl: "/uploads/proof-sample.jpg",
    payerNotes: "Scanned QR code at desk. Looking forward to solo trip!",
    status: "pending",
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  }
];

export async function getPaymentProofs(filterStatus?: string): Promise<PaymentProofData[]> {
  const db = dbInstance();
  if (!db._isMock) {
    try {
      const proofs = await db.select().from(schema.paymentProofs);
      if (proofs.length > 0) {
        if (filterStatus && filterStatus !== "all") {
          return proofs.filter((p: any) => p.status === filterStatus) as any;
        }
        return proofs as any;
      }
    } catch (err) {
      console.warn("[PaymentProofs DB fetch fallback]:", err);
    }
  }

  const stored = readJsonFile("payment_proofs.json", []);
  const all = stored.length > 0 ? stored : seedPaymentProofs;
  if (stored.length === 0) {
    writeJsonFile("payment_proofs.json", seedPaymentProofs);
  }

  if (filterStatus && filterStatus !== "all") {
    return all.filter((p: any) => p.status === filterStatus);
  }
  return all;
}

export async function submitPaymentProof(input: {
  quoteId?: string;
  conversationId?: number;
  leadId?: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  tripTitle: string;
  tripSlug?: string;
  departureDate?: string;
  travelersCount?: number;
  amountPaid: number;
  paymentType?: "deposit" | "balance" | "full";
  paymentMethod?: "upi_qr" | "gpay" | "phonepe" | "bank_transfer";
  utrNumber: string;
  proofImageUrl: string;
  payerNotes?: string;
}): Promise<PaymentProofData> {
  const newProof: PaymentProofData = {
    id: Date.now(),
    quoteId: input.quoteId,
    conversationId: input.conversationId,
    leadId: input.leadId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerEmail: input.customerEmail,
    tripTitle: input.tripTitle,
    tripSlug: input.tripSlug,
    departureDate: input.departureDate || "Upcoming 2026 Batch",
    travelersCount: input.travelersCount || 1,
    amountPaid: input.amountPaid,
    paymentType: input.paymentType || "deposit",
    paymentMethod: input.paymentMethod || "upi_qr",
    utrNumber: input.utrNumber,
    proofImageUrl: input.proofImageUrl,
    payerNotes: input.payerNotes,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const db = dbInstance();
  if (!db._isMock) {
    try {
      await db.insert(schema.paymentProofs).values({
        quoteId: newProof.quoteId,
        conversationId: newProof.conversationId,
        leadId: newProof.leadId,
        customerName: newProof.customerName,
        customerPhone: newProof.customerPhone,
        customerEmail: newProof.customerEmail,
        tripTitle: newProof.tripTitle,
        tripSlug: newProof.tripSlug,
        departureDate: newProof.departureDate,
        travelersCount: newProof.travelersCount,
        amountPaid: newProof.amountPaid,
        paymentType: newProof.paymentType,
        paymentMethod: newProof.paymentMethod,
        utrNumber: newProof.utrNumber,
        proofImageUrl: newProof.proofImageUrl,
        payerNotes: newProof.payerNotes,
        status: newProof.status,
      });
    } catch (err) {
      console.error("[PaymentProof DB insert error]:", err);
    }
  }

  const list = readJsonFile("payment_proofs.json", seedPaymentProofs);
  list.unshift(newProof);
  writeJsonFile("payment_proofs.json", list);

  // Broadcast real-time event to CRM
  broadcastCrmEvent({
    type: "payment_proof_submitted",
    conversationId: input.conversationId || 0,
    channel: "whatsapp",
    customerName: input.customerName,
    messageText: `[Payment Proof Submitted]: ₹${input.amountPaid.toLocaleString("en-IN")} via UTR ${input.utrNumber} for ${input.tripTitle}`,
    timestamp: new Date().toISOString(),
    metadata: {
      proofId: newProof.id,
      amount: input.amountPaid,
      utr: input.utrNumber,
    },
  });

  return newProof;
}

export async function verifyPaymentProof(
  proofId: number,
  verifiedBy: string = "Admin Finance Team",
  adminNotes?: string
): Promise<{ success: boolean; proof?: PaymentProofData; pass?: TripPassData; error?: string }> {
  const proofs = readJsonFile("payment_proofs.json", seedPaymentProofs);
  const idx = proofs.findIndex((p: any) => p.id === proofId);

  if (idx === -1) {
    return { success: false, error: "Payment proof not found" };
  }

  const proof = proofs[idx];
  const now = new Date().toISOString();

  // 1. Generate Digital Boarding Pass
  const totalAmount = proof.paymentType === "full" ? proof.amountPaid : proof.amountPaid * 4; // Estimate if not passed
  const pass = await createTripPass({
    quoteId: proof.quoteId,
    conversationId: proof.conversationId,
    leadId: proof.leadId,
    tripTitle: proof.tripTitle,
    tripSlug: proof.tripSlug || proof.tripTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    passengerName: proof.customerName,
    passengerPhone: proof.customerPhone,
    passengerEmail: proof.customerEmail,
    departureDate: proof.departureDate || "Upcoming Batch",
    travelersCount: proof.travelersCount,
    totalAmount,
    depositPaid: proof.amountPaid,
  });

  // 2. Update Proof status
  proof.status = "verified";
  proof.verifiedAt = now;
  proof.verifiedBy = verifiedBy;
  proof.adminNotes = adminNotes || "Payment verified against bank statement UTR.";
  proof.ticketId = pass.ticketId;

  proofs[idx] = proof;
  writeJsonFile("payment_proofs.json", proofs);

  // 3. Record in Finance Transactions (`transactions.json`)
  try {
    const transactions = readJsonFile("transactions.json", []);
    const newTx = {
      id: Date.now(),
      type: "revenue",
      amount: proof.amountPaid,
      category: "Tour Booking Deposit",
      tripSlug: proof.tripSlug || "general-tours",
      description: `Payment verified for ${proof.customerName} (${proof.tripTitle}) — UTR: ${proof.utrNumber}`,
      date: new Date().toISOString().slice(0, 10),
      createdAt: now,
    };
    transactions.unshift(newTx);
    writeJsonFile("transactions.json", transactions);
  } catch (txErr) {
    console.error("[Finance Tx Write Error]:", txErr);
  }

  // 4. Send Instant WhatsApp Confirmation Message with Boarding Pass Link
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tripnaari.com";
  const passUrl = `${siteUrl}/boarding-pass/${pass.ticketId}`;
  const confirmationMessage = `🎉 *PAYMENT VERIFIED & SEAT CONFIRMED!*
━━━━━━━━━━━━━━━━━━━━
Dear ${proof.customerName}! 🌸 

Your payment of *₹${proof.amountPaid.toLocaleString("en-IN")}* for *${proof.tripTitle}* (UTR: ${proof.utrNumber}) has been verified! Your seat is locked! 🏔️✨

🎫 *Your Digital Boarding Pass & QR Ticket*:
👉 ${passUrl}

Trip Details:
📍 *Trip*: ${proof.tripTitle}
📅 *Batch*: ${proof.departureDate || "2026 Departure"}
👥 *Travelers*: ${proof.travelersCount} Person(s)
💳 *Deposit Received*: ₹${proof.amountPaid.toLocaleString("en-IN")}
⏳ *Balance Due*: ₹${pass.balanceDue.toLocaleString("en-IN")} (Due 14 days before departure)

Our certified female Trip Leader will contact you 24 hours prior to travel. Welcome to the TripNaari Sisterhood! 🌸🎒`;

  try {
    await sendWhatsAppMessage(proof.customerPhone, confirmationMessage);
  } catch (waErr) {
    console.warn("[WhatsApp Notification Failed, Mock fallback applied]:", waErr);
  }

  // 5. Update CRM conversation if conversationId is linked
  broadcastCrmEvent({
    type: "payment_proof_verified",
    conversationId: proof.conversationId || 0,
    channel: "whatsapp",
    customerName: proof.customerName,
    messageText: `[Payment Verified]: ₹${proof.amountPaid.toLocaleString("en-IN")} approved. Boarding Pass ${pass.ticketId} issued!`,
    timestamp: now,
    metadata: {
      proofId: proof.id,
      ticketId: pass.ticketId,
      passUrl,
    },
  });

  return { success: true, proof, pass };
}

export async function rejectPaymentProof(
  proofId: number,
  reason: string,
  adminName: string = "Admin Team"
): Promise<{ success: boolean; proof?: PaymentProofData; error?: string }> {
  const proofs = readJsonFile("payment_proofs.json", seedPaymentProofs);
  const idx = proofs.findIndex((p: any) => p.id === proofId);

  if (idx === -1) {
    return { success: false, error: "Payment proof not found" };
  }

  const proof = proofs[idx];
  const now = new Date().toISOString();

  proof.status = "rejected";
  proof.adminNotes = reason;
  proof.verifiedAt = now;
  proof.verifiedBy = adminName;

  proofs[idx] = proof;
  writeJsonFile("payment_proofs.json", proofs);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tripnaari.com";
  const reuploadUrl = `${siteUrl}/pay/${proof.quoteId || "verify"}`;

  const rejectionMessage = `⚠️ *PAYMENT PROOF UPDATE — ACTION REQUIRED*
━━━━━━━━━━━━━━━━━━━━
Hi ${proof.customerName}, 

Our finance team reviewed your payment submission for *${proof.tripTitle}* (UTR: ${proof.utrNumber}), but could not complete verification.

*Reason*: ${reason}

Please re-upload your valid payment screenshot or correct UTR number here:
👉 ${reuploadUrl}

If you have any questions, simply reply to this message! 🌸`;

  try {
    await sendWhatsAppMessage(proof.customerPhone, rejectionMessage);
  } catch (waErr) {
    console.warn("[WhatsApp Reject Notification Failed]:", waErr);
  }

  broadcastCrmEvent({
    type: "payment_proof_rejected",
    conversationId: proof.conversationId || 0,
    channel: "whatsapp",
    customerName: proof.customerName,
    messageText: `[Payment Proof Rejected]: ${reason}`,
    timestamp: now,
    metadata: { proofId: proof.id, reason },
  });

  return { success: true, proof };
}
