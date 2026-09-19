import { NextRequest, NextResponse } from "next/server";
import { processAiLeadRefinement, sendInstagramDm, sendWhatsAppMessage } from "@/lib/ai-crm";
import { dbInstance, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { broadcastCrmEvent } from "@/lib/crm-events";

/**
 * GET Handler: Meta Webhook Verification (Challenge Response)
 * Used by Meta Developer Console when subscribing to Webhooks.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (!VERIFY_TOKEN) {
    console.error("[Meta Webhook] META_WEBHOOK_VERIFY_TOKEN env var is not set. Rejecting verification.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 403 });
  }

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
 * Generates a deterministic numeric conversation ID from a string (phone/userId).
 * Stable across all requests — eliminates the random ID bug that broke SSE matching.
 */
function stableConversationId(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Return positive int in range 5000–9999 (avoids colliding with mock IDs 101, 102)
  return 5000 + Math.abs(hash % 5000);
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

      // Generate stable conversationId for this sender
      const conversationId = stableConversationId(`ig_${senderId}`);

      // Fetch conversation history from DB for AI context
      const db = dbInstance();
      let conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [];

      if (!db._isMock) {
        try {
          const recentMessages = await db
            .select()
            .from(schema.crmMessages)
            .where(eq(schema.crmMessages.conversationId, conversationId))
            .limit(6);

          conversationHistory = recentMessages.map((m: any) => ({
            role: m.senderType === "user" ? "user" : "assistant",
            content: m.content
          }));
        } catch (e) {
          console.warn("[IG History Fetch] Could not load message history:", e);
        }
      }

      // Process via AI CRM Engine with conversation context
      const aiResult = await processAiLeadRefinement(messageText, conversationHistory, "instagram");

      // Store message in database if PostgreSQL DB is configured
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
                dripStep: 0,
              })
              .returning();
            existing = newConv;
          } else {
            // User re-engaged — reset drip so follow-up sequences start fresh
            await db
              .update(schema.crmConversations)
              .set({
                lastMessageText: messageText,
                lastMessageAt: new Date(),
                dripStep: 0,
                status: aiResult.extractedLead.shouldEscalate ? "qualified" : (existing.status || "active"),
                mode: aiResult.extractedLead.shouldEscalate ? "human" : "ai",
              })
              .where(eq(schema.crmConversations.id, existing.id));
          }

          // Save incoming user message to DB
          await db.insert(schema.crmMessages).values({
            conversationId: existing.id,
            channel: "instagram",
            senderType: "user",
            content: messageText,
            intentDetected: aiResult.intent,
          });

          // Save AI auto-reply to DB (builds conversation history for next turn)
          await db.insert(schema.crmMessages).values({
            conversationId: existing.id,
            channel: "instagram",
            senderType: "ai",
            content: aiResult.replyText,
            intentDetected: "ai_auto_reply",
          });

          // Upsert lead data if AI extracted contact info
          if (aiResult.extractedLead.phone || aiResult.extractedLead.destination) {
            await db.insert(schema.leads).values({
              name: aiResult.extractedLead.name || `IG Guest (${senderId.slice(-4)})`,
              email: aiResult.extractedLead.email || `${senderId}@instagram.user`,
              phone: aiResult.extractedLead.phone || "Pending",
              destination: aiResult.extractedLead.destination,
              travelMonth: aiResult.extractedLead.travelMonth,
              source: "instagram_dm",
              status: aiResult.extractedLead.phone ? "contacted" : "new",
              notes: `AI Bot. Intent Score: ${aiResult.extractedLead.intentScore}`,
            });
          }
        } catch (dbErr) {
          console.error("[DB Sync Error - Instagram]:", dbErr);
        }
      }

      // Broadcast live event to connected CRM dashboards via SSE
      broadcastCrmEvent({
        type: aiResult.extractedLead.shouldEscalate ? "human_escalation" : "new_message",
        conversationId,
        channel: "instagram",
        customerName: `Instagram Guest (${senderId.slice(-4)})`,
        messageText,
        timestamp: new Date().toISOString()
      });

      // Send AI auto-reply back to Instagram user
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
        const fromPhone = msg.from; // WhatsApp phone number (no +)
        const messageText = msg.text?.body;
        const senderName = contacts.find((c: any) => c.wa_id === fromPhone)?.profile?.name || "WhatsApp User";

        if (!fromPhone || !messageText) continue;

        console.log(`[WhatsApp Message] From ${senderName} (${fromPhone}): "${messageText}"`);

        // Generate stable conversationId from phone (FIXES the Math.random() bug)
        const conversationId = stableConversationId(`wa_${fromPhone}`);

        // Fetch conversation history from DB for AI memory
        const db = dbInstance();
        let conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [];

        if (!db._isMock) {
          try {
            const recentMessages = await db
              .select()
              .from(schema.crmMessages)
              .where(eq(schema.crmMessages.conversationId, conversationId))
              .limit(6);

            conversationHistory = recentMessages.map((m: any) => ({
              role: m.senderType === "user" ? "user" : "assistant",
              content: m.content
            }));
          } catch (e) {
            console.warn("[WA History Fetch] Could not load message history:", e);
          }
        }

        // Process via AI CRM Engine with conversation memory
        const aiResult = await processAiLeadRefinement(messageText, conversationHistory, "whatsapp");

        if (!db._isMock) {
          try {
            let [existing] = await db
              .select()
              .from(schema.crmConversations)
              .where(eq(schema.crmConversations.externalUserId, fromPhone));

            if (!existing) {
              const [newConv] = await db
                .insert(schema.crmConversations)
                .values({
                  channel: "whatsapp",
                  externalUserId: fromPhone,
                  externalUsername: `+${fromPhone}`,
                  customerName: senderName,
                  mode: aiResult.extractedLead.shouldEscalate ? "human" : "ai",
                  // Phone already known on WA — immediately qualifies the lead
                  status: "qualified",
                  lastMessageText: messageText,
                  dripStep: 0,
                })
                .returning();
              existing = newConv;
            } else {
              // Re-engagement: reset drip step so follow-up sequences restart
              await db
                .update(schema.crmConversations)
                .set({
                  lastMessageText: messageText,
                  lastMessageAt: new Date(),
                  dripStep: 0,
                  mode: aiResult.extractedLead.shouldEscalate ? "human" : (existing.mode || "ai"),
                })
                .where(eq(schema.crmConversations.id, existing.id));
            }

            // Save user message to DB
            await db.insert(schema.crmMessages).values({
              conversationId: existing.id,
              channel: "whatsapp",
              senderType: "user",
              content: messageText,
              intentDetected: aiResult.intent,
            });

            // Save AI auto-reply to DB (builds history for next message)
            await db.insert(schema.crmMessages).values({
              conversationId: existing.id,
              channel: "whatsapp",
              senderType: "ai",
              content: aiResult.replyText,
              intentDetected: "ai_auto_reply",
            });

            // Sync lead record
            await db.insert(schema.leads).values({
              name: senderName,
              email: `${fromPhone}@whatsapp.user`,
              phone: `+${fromPhone}`,
              destination: aiResult.extractedLead.destination,
              travelMonth: aiResult.extractedLead.travelMonth,
              source: "whatsapp_bot",
              status: "new",
              notes: `AI Bot. Destination: ${aiResult.extractedLead.destination || "Unspecified"}`,
            });
          } catch (dbErr) {
            console.error("[DB Sync Error - WhatsApp]:", dbErr);
          }
        }

        // Broadcast SSE event to all connected admin dashboards
        broadcastCrmEvent({
          type: aiResult.extractedLead.shouldEscalate ? "human_escalation" : "new_message",
          conversationId,
          channel: "whatsapp",
          customerName: senderName,
          messageText,
          timestamp: new Date().toISOString()
        });

        // Send AI auto-reply back to the WhatsApp user
        await sendWhatsAppMessage(fromPhone, aiResult.replyText);
      }
    }
  }
}
