import { sendInstagramDm, sendWhatsAppMessage } from "@/lib/ai-crm";
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
 * Generates Pre-Trip Briefing & Packing List WhatsApp Broadcast (Beats WhatZCRM)
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
 * Automated Sales Drip Engine
 * Evaluates pending qualified leads and fires stage-appropriate follow-ups
 */
export async function runSalesDripEngine(): Promise<{ processedCount: number; messagesSent: string[] }> {
  const db = dbInstance();
  const messagesSent: string[] = [];

  if (db._isMock) {
    console.log("[Sales Drip Engine] Executing in demo mode...");
    return { processedCount: 2, messagesSent: ["Simulated 24h follow-up to Priya", "Simulated 72h urgency to Sunita"] };
  }

  try {
    const now = new Date();
    const h24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const eligibleThreads = await db
      .select()
      .from(schema.crmConversations)
      .where(
        and(
          eq(schema.crmConversations.status, "qualified"),
          lt(schema.crmConversations.lastMessageAt, h24Ago),
          eq(schema.crmConversations.dripStep, 0)
        )
      );

    for (const thread of eligibleThreads) {
      const followUpText = `Hey ${thread.customerName || "there"}! 🎒 Just checking in—did you have a chance to review our Women-Only itinerary? Let me know if you'd like me to send a custom discount quote! 🌸`;

      if (thread.channel === "instagram") {
        await sendInstagramDm(thread.externalUserId, followUpText);
      } else if (thread.channel === "whatsapp") {
        await sendWhatsAppMessage(thread.externalUserId, followUpText);
      }

      await db.insert(schema.crmMessages).values({
        conversationId: thread.id,
        channel: thread.channel,
        senderType: "ai",
        content: `[AUTOMATED DRIP STEP 1]: ${followUpText}`,
        intentDetected: "drip_followup_24h"
      });

      await db
        .update(schema.crmConversations)
        .set({ dripStep: 1, lastMessageAt: now })
        .where(eq(schema.crmConversations.id, thread.id));

      messagesSent.push(`Drip Step 1 sent to ${thread.customerName} (${thread.channel})`);
    }

    return { processedCount: eligibleThreads.length, messagesSent };
  } catch (err) {
    console.error("[Sales Drip Engine Exception]:", err);
    return { processedCount: 0, messagesSent };
  }
}
