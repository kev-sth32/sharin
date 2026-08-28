import { NextRequest, NextResponse } from "next/server";
import { processAiLeadRefinement, sendInstagramDm, sendWhatsAppMessage } from "@/lib/ai-crm";
import { dbInstance, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

/**
 * GET Handler: Meta Webhook Verification (Challenge Response)
 * Used by Meta Developer Console when subscribing to Webhooks.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "tripnaari_crm_secret_token";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[Meta Webhook] Verification Successful!");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden - Invalid Verify Token" }, { status: 403 });
}

/**
 * POST Handler: Handles incoming Webhooks from Instagram & WhatsApp
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Meta Webhook Event Received]:", JSON.stringify(body, null, 2));

    // Acknowledge Meta immediately with 200 OK so Meta doesn't retry
    const responseAck = NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });

    // Handle Instagram Webhook Payload
    if (body.object === "instagram" || body.object === "page") {
      await handleInstagramEvent(body);
    }

    // Handle WhatsApp Webhook Payload
    if (body.object === "whatsapp_business_account") {
      await handleWhatsAppEvent(body);
    }

    return responseAck;
  } catch (err) {
    console.error("[Meta Webhook Exception]:", err);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}

/**
 * Handles Incoming Instagram Direct Messages
 */
async function handleInstagramEvent(body: any) {
  const entries = body.entry || [];
  for (const entry of entries) {
    const messaging = entry.messaging || [];
    for (const event of messaging) {
      const senderId = event.sender?.id;
      const messageText = event.message?.text;

      // Ignore echoes or non-text messages for now
      if (!senderId || !messageText || event.message?.is_echo) continue;

      console.log(`[Instagram DM] From User ${senderId}: "${messageText}"`);

      // Process via AI CRM Engine
      const aiResult = await processAiLeadRefinement(messageText, [], "instagram");

      // Store message in database if PostgreSQL DB is configured
      const db = dbInstance();
      let conversationId: number | null = null;

      if (!db._isMock) {
        try {
          let [existing] = await db
            .select()
            .from(schema.crmConversations)
            .where(eq(schema.crmConversations.externalUserId, senderId));

          if (!existing) {
            const [newConv] = await db
              .insert(schema.crmConversations)
              .values({
                channel: "instagram",
                externalUserId: senderId,
                externalUsername: `ig_${senderId.slice(-6)}`,
                customerName: `Instagram Guest`,
                mode: aiResult.extractedLead.shouldEscalate ? "human" : "ai",
                status: aiResult.extractedLead.intentScore && aiResult.extractedLead.intentScore >= 70 ? "qualified" : "active",
                lastMessageText: messageText,
              })
              .returning();
            conversationId = newConv.id;
          } else {
            conversationId = existing.id;
          }

          // Check if lead details present and update/create lead
          if (aiResult.extractedLead.phone || aiResult.extractedLead.destination) {
            await db.insert(schema.leads).values({
              name: aiResult.extractedLead.name || `IG Guest (${senderId.slice(-4)})`,
              email: aiResult.extractedLead.email || `${senderId}@instagram.user`,
              phone: aiResult.extractedLead.phone || "Pending",
              destination: aiResult.extractedLead.destination,
              travelMonth: aiResult.extractedLead.travelMonth,
              source: "instagram_dm",
              status: aiResult.extractedLead.phone ? "contacted" : "new",
              notes: `Extracted via AI Chat bot. Intent Score: ${aiResult.extractedLead.intentScore}`,
            });
          }
        } catch (dbErr) {
          console.error("[DB Sync Error - Instagram]:", dbErr);
        }
      }

      // If mode is AI, send auto-reply back to Instagram user
      await sendInstagramDm(senderId, aiResult.replyText);
    }
  }
}

/**
 * Handles Incoming WhatsApp Business Messages
 */
async function handleWhatsAppEvent(body: any) {
  const entries = body.entry || [];
  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      const value = change.value;
      const messages = value?.messages || [];
      const contacts = value?.contacts || [];

      for (const msg of messages) {
        const fromPhone = msg.from; // WhatsApp phone number
        const messageText = msg.text?.body;
        const senderName = contacts.find((c: any) => c.wa_id === fromPhone)?.profile?.name || "WhatsApp User";

        if (!fromPhone || !messageText) continue;

        console.log(`[WhatsApp Message] From ${senderName} (${fromPhone}): "${messageText}"`);

        // Process via AI CRM Engine
        const aiResult = await processAiLeadRefinement(messageText, [], "whatsapp");

        // Store message in DB
        const db = dbInstance();
        if (!db._isMock) {
          try {
            let [existing] = await db
              .select()
              .from(schema.crmConversations)
              .where(eq(schema.crmConversations.externalUserId, fromPhone));

            if (!existing) {
              await db.insert(schema.crmConversations).values({
                channel: "whatsapp",
                externalUserId: fromPhone,
                customerName: senderName,
                mode: aiResult.extractedLead.shouldEscalate ? "human" : "ai",
                status: "qualified", // Phone is already available on WhatsApp!
                lastMessageText: messageText,
              });
            }

            // Sync lead
            await db.insert(schema.leads).values({
              name: senderName,
              email: `${fromPhone}@whatsapp.user`,
              phone: `+${fromPhone}`,
              destination: aiResult.extractedLead.destination,
              travelMonth: aiResult.extractedLead.travelMonth,
              source: "whatsapp_bot",
              status: "new",
              notes: `AI Qualified via WhatsApp. Destination: ${aiResult.extractedLead.destination || 'Unspecified'}`,
            });
          } catch (dbErr) {
            console.error("[DB Sync Error - WhatsApp]:", dbErr);
          }
        }

        // Send auto-reply back via WhatsApp
        await sendWhatsAppMessage(fromPhone, aiResult.replyText);
      }
    }
  }
}
