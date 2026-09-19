import { sendInstagramDm, sendWhatsAppMessage, sendWhatsAppInteractiveButtons } from "@/lib/ai-crm";
import { dbInstance, schema } from "@/lib/db";
import { eq, and, lt } from "drizzle-orm";

export interface TripQuoteInput {
  conversationId: number;
  tripSlug: string;
  tripTitle: string;
  pricePerHead: number;
  travelersCount: number;
  depositAmount: number;
  departureDate?: string;
}

export interface GeneratedQuote {
  quoteId: string;
  tripTitle: string;
  totalPrice: number;
  depositAmount: number;
  travelersCount: number;
  paymentUrl: string;
  formattedMessage: string;
}

/**
 * Generates an instant formal trip quotation and payment link
 */
export function generateTripQuotation(input: TripQuoteInput, hostUrl: string = "https://tripnaari.com"): GeneratedQuote {
  const quoteId = `TN-QUOTE-${Math.floor(100000 + Math.random() * 900000)}`;
  const totalPrice = input.pricePerHead * input.travelersCount;
  const depositAmount = input.depositAmount || Math.round(totalPrice * 0.25);

  const paymentUrl = `${hostUrl}/trips/${input.tripSlug}?booking=true&quoteId=${quoteId}&travelers=${input.travelersCount}&deposit=${depositAmount}`;

  const formattedMessage = `🧾 *OFFICIAL TRIP QUOTATION & RESERVATION LINK*
━━━━━━━━━━━━━━━━━━━━
📍 *Trip*: ${input.tripTitle}
👥 *Travelers*: ${input.travelersCount} Person(s)
📅 *Departure*: ${input.departureDate || "Flexible 2026 Batch"}
💰 *Total Package Price*: ₹${totalPrice.toLocaleString("en-IN")}
💳 *Reservation Deposit (25%)*: ₹${depositAmount.toLocaleString("en-IN")}

✨ *What's Included*: 3★ Stays, Meals, Permitted Transfers, Experienced Female Trip Leader & Group Activities.

👉 *Click to Lock Your Seat*:
${paymentUrl}

_This quotation link is valid for 48 hours to guarantee current price & seats._`;

  return {
    quoteId,
    tripTitle: input.tripTitle,
    totalPrice,
    depositAmount,
    travelersCount: input.travelersCount,
    paymentUrl,
    formattedMessage
  };
}

/**
 * Generates Pre-Trip Briefing & Packing List WhatsApp Message
 */
export function generatePreTripBriefing(customerName: string, destination: string, departureDate: string): string {
  return `🎒 *UPCOMING TRIP BRIEFING & PACKING ESSENTIALS*
━━━━━━━━━━━━━━━━━━━━
Hi ${customerName}! 🌸 Your trip to *${destination}* is just around the corner (*${departureDate}*)!

📋 *Packing Checklist*:
1. Original Govt ID / Passport
2. Comfortable walking shoes + thermal layers
3. Personal medications & sunscreen
4. Power bank & universal adapter

👩‍✈️ Your verified female Trip Leader will contact you 24 hours prior to departure. Get ready for an unforgettable journey with TripNaari! ✨`;
}

/**
 * Automated Sales Drip Engine — 3-Step Follow-Up Sequence
 *
 * Step 1 (24h): Warm check-in — "Still thinking about your trip?"
 * Step 2 (48h): Urgency + interactive WA buttons — "Only 3 seats left!"
 * Step 3 (7d):  Last-chance coupon SOLO1000 — "₹1,000 off, expires 48h"
 *               → After Step 3, lead auto-moves to "closed" to end the drip.
 */
export async function runSalesDripEngine(): Promise<{ processedCount: number; messagesSent: string[] }> {
  const db = dbInstance();
  const messagesSent: string[] = [];

  if (db._isMock) {
    console.log("[Sales Drip Engine] Executing in demo/mock mode...");
    return {
      processedCount: 3,
      messagesSent: [
        "Mock: Drip Step 1 sent to Priya (instagram)",
        "Mock: Drip Step 2 sent to Ananya (whatsapp) — urgency buttons",
        "Mock: Drip Step 3 coupon sent to Sunita (whatsapp) — SOLO1000"
      ]
    };
  }

  try {
    const now = new Date();
    const h24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const h48Ago = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const d7Ago  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ─────────────────────────────────────────────
    // STEP 1: 24h check-in — warm follow-up
    // ─────────────────────────────────────────────
    const step1Threads = await db
      .select()
      .from(schema.crmConversations)
      .where(
        and(
          eq(schema.crmConversations.status, "qualified"),
          lt(schema.crmConversations.lastMessageAt, h24Ago),
          eq(schema.crmConversations.dripStep, 0)
        )
      );

    for (const thread of step1Threads) {
      const followUp = `Hey ${thread.customerName || "there"}! 🎒 Just checking in — did you get a chance to look at our Women-Only itinerary? Let me know if you'd like a custom discount quote! 🌸`;

      if (thread.channel === "instagram") {
        await sendInstagramDm(thread.externalUserId, followUp);
      } else if (thread.channel === "whatsapp") {
        await sendWhatsAppMessage(thread.externalUserId, followUp);
      }

      await db.insert(schema.crmMessages).values({
        conversationId: thread.id,
        channel: thread.channel,
        senderType: "ai",
        content: `[DRIP STEP 1 — 24h]: ${followUp}`,
        intentDetected: "drip_followup_24h"
      });

      await db
        .update(schema.crmConversations)
        .set({ dripStep: 1, lastMessageAt: now })
        .where(eq(schema.crmConversations.id, thread.id));

      messagesSent.push(`Step 1 → ${thread.customerName} (${thread.channel})`);
    }

    // ─────────────────────────────────────────────
    // STEP 2: 48h urgency — scarcity + WA buttons
    // ─────────────────────────────────────────────
    const step2Threads = await db
      .select()
      .from(schema.crmConversations)
      .where(
        and(
          eq(schema.crmConversations.status, "qualified"),
          lt(schema.crmConversations.lastMessageAt, h48Ago),
          eq(schema.crmConversations.dripStep, 1)
        )
      );

    for (const thread of step2Threads) {
      const urgencyMsg = `🔥 *LIMITED SEATS ALERT!*\nHi ${thread.customerName || "there"}! Only *3 seats* remain for our next Women's batch! Don't miss out on an unforgettable journey. 🏔️\n\nShall I reserve your spot now?`;

      if (thread.channel === "whatsapp") {
        // Send interactive buttons on WhatsApp for higher engagement
        await sendWhatsAppInteractiveButtons(thread.externalUserId, urgencyMsg, [
          { id: "btn_reserve_yes", title: "Yes, Reserve My Seat!" },
          { id: "btn_more_info", title: "Send Itinerary PDF" },
          { id: "btn_call_me", title: "Call Me Back" }
        ]);
      } else if (thread.channel === "instagram") {
        await sendInstagramDm(thread.externalUserId, urgencyMsg);
      }

      await db.insert(schema.crmMessages).values({
        conversationId: thread.id,
        channel: thread.channel,
        senderType: "ai",
        content: `[DRIP STEP 2 — 48h urgency]: ${urgencyMsg}`,
        intentDetected: "drip_urgency_48h"
      });

      await db
        .update(schema.crmConversations)
        .set({ dripStep: 2, lastMessageAt: now })
        .where(eq(schema.crmConversations.id, thread.id));

      messagesSent.push(`Step 2 → ${thread.customerName} (${thread.channel}) — urgency buttons`);
    }

    // ─────────────────────────────────────────────
    // STEP 3: 7-day last chance — coupon + close
    // ─────────────────────────────────────────────
    const step3Threads = await db
      .select()
      .from(schema.crmConversations)
      .where(
        and(
          eq(schema.crmConversations.status, "qualified"),
          lt(schema.crmConversations.lastMessageAt, d7Ago),
          eq(schema.crmConversations.dripStep, 2)
        )
      );

    for (const thread of step3Threads) {
      const couponMsg = `🎁 *A SPECIAL GIFT JUST FOR YOU!*\nHi ${thread.customerName || "there"}! We really want you on this trip! 🌸\n\nHere's an exclusive *₹1,000 OFF* voucher — use code *SOLO1000* at checkout.\n\n⏰ This offer expires in *48 hours*. Ready to book?\n👉 https://tripnaari.com/trips`;

      if (thread.channel === "whatsapp") {
        await sendWhatsAppMessage(thread.externalUserId, couponMsg);
      } else if (thread.channel === "instagram") {
        await sendInstagramDm(thread.externalUserId, couponMsg);
      }

      await db.insert(schema.crmMessages).values({
        conversationId: thread.id,
        channel: thread.channel,
        senderType: "ai",
        content: `[DRIP STEP 3 — 7d coupon SOLO1000]: ${couponMsg}`,
        intentDetected: "drip_coupon_7d"
      });

      // After Step 3, move to "closed" — stops the drip from running again
      await db
        .update(schema.crmConversations)
        .set({ dripStep: 3, status: "closed", lastMessageAt: now })
        .where(eq(schema.crmConversations.id, thread.id));

      messagesSent.push(`Step 3 → ${thread.customerName} (${thread.channel}) — SOLO1000 coupon sent, lead closed`);
    }

    const totalProcessed = step1Threads.length + step2Threads.length + step3Threads.length;
    console.log(`[Sales Drip Engine] Processed ${totalProcessed} threads. Step1: ${step1Threads.length}, Step2: ${step2Threads.length}, Step3: ${step3Threads.length}`);

    return { processedCount: totalProcessed, messagesSent };
  } catch (err) {
    console.error("[Sales Drip Engine Exception]:", err);
    return { processedCount: 0, messagesSent };
  }
}


