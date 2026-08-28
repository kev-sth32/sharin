import { NextRequest, NextResponse } from "next/server";
import { dbInstance, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { sendInstagramDm, sendWhatsAppMessage } from "@/lib/ai-crm";
import { generateTripQuotation, runSalesDripEngine } from "@/lib/sales-engine";

// Mock memory store when database is in fallback mode
let mockConversations = [
  {
    id: 101,
    channel: "instagram",
    externalUserId: "ig_priya_sharma",
    externalUsername: "priya_travels",
    customerName: "Priya Sharma",
    assignedAgent: "Sneha Kapur",
    mode: "ai",
    status: "active",
    dripStep: 0,
    lastMessageText: "Hi! Can you tell me more about the Ladakh Women Special trip for July?",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    unreadCount: 1,
    messages: [
      { id: 1, senderType: "user", content: "Hi! Can you tell me more about the Ladakh Women Special trip for July?", createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { id: 2, senderType: "ai", content: "Hey Priya! 🏔️ Our Ladakh Women-Only expedition for July is 7 Days / 6 Nights starting at ₹32,999! Includes stays, pass permits, transfers & trip leader. What dates work for you?", createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString() }
    ],
    lead: {
      destination: "Ladakh",
      travelMonth: "July 2026",
      phone: "+919876543210",
      intentScore: 85
    }
  },
  {
    id: 102,
    channel: "whatsapp",
    externalUserId: "919811223344",
    externalUsername: "+91 98112 23344",
    customerName: "Ananya Roy",
    assignedAgent: "Rahul Sharma",
    mode: "human",
    status: "escalated",
    dripStep: 1,
    lastMessageText: "I want to speak with a human agent about custom booking for 4 girls.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unreadCount: 2,
    messages: [
      { id: 10, senderType: "user", content: "Hi, interested in Meghalaya in October for a group of 4.", createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
      { id: 11, senderType: "ai", content: "That sounds amazing! Meghalaya is breathtaking in October. 🌿 For a group of 4, we offer group discounts!", createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
      { id: 12, senderType: "user", content: "I want to speak with a human agent about custom booking for 4 girls.", createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() }
    ],
    lead: {
      destination: "Meghalaya",
      travelMonth: "October 2026",
      phone: "+919811223344",
      intentScore: 95
    }
  }
];

export async function GET(req: NextRequest) {
  try {
    const db = dbInstance();
    if (db._isMock) {
      return NextResponse.json({ success: true, conversations: mockConversations });
    }

    const conversations = await db
      .select()
      .from(schema.crmConversations)
      .orderBy(desc(schema.crmConversations.lastMessageAt));

    return NextResponse.json({ success: true, conversations });
  } catch (err) {
    console.error("[CRM API GET Error]:", err);
    return NextResponse.json({ success: false, conversations: mockConversations });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, conversationId, mode, messageText, agentName, quoteInput } = body;
    const db = dbInstance();

    // Action 1: Toggle Mode (AI vs Human Takeover)
    if (action === "toggle_mode") {
      if (db._isMock) {
        const target = mockConversations.find(c => c.id === conversationId);
        if (target) target.mode = mode;
        return NextResponse.json({ success: true, mode });
      }

      await db
        .update(schema.crmConversations)
        .set({ mode })
        .where(eq(schema.crmConversations.id, conversationId));

      return NextResponse.json({ success: true, mode });
    }

    // Action 2: Assign Lead to Agent
    if (action === "assign_agent") {
      if (db._isMock) {
        const target = mockConversations.find(c => c.id === conversationId);
        if (target) target.assignedAgent = agentName;
        return NextResponse.json({ success: true, assignedAgent: agentName });
      }

      await db
        .update(schema.crmConversations)
        .set({ assignedAgent: agentName })
        .where(eq(schema.crmConversations.id, conversationId));

      return NextResponse.json({ success: true, assignedAgent: agentName });
    }

    // Action 3: Generate & Send Formal Quotation Link
    if (action === "generate_quote") {
      if (!quoteInput || !conversationId) {
        return NextResponse.json({ error: "Missing quote input parameters" }, { status: 400 });
      }

      const quote = generateTripQuotation(quoteInput);

      if (db._isMock) {
        const target = mockConversations.find(c => c.id === conversationId);
        if (target) {
          target.messages.push({
            id: Date.now(),
            senderType: "admin",
            content: quote.formattedMessage,
            createdAt: new Date().toISOString()
          });
          target.lastMessageText = `[Quotation Sent]: ${quote.tripTitle} - ₹${quote.totalPrice}`;
          target.lastMessageAt = new Date().toISOString();
          target.status = "quote_sent";

          if (target.channel === "instagram") {
            await sendInstagramDm(target.externalUserId, quote.formattedMessage);
          } else {
            await sendWhatsAppMessage(target.externalUserId, quote.formattedMessage);
          }
        }
        return NextResponse.json({ success: true, quote });
      }

      const [conv] = await db
        .select()
        .from(schema.crmConversations)
        .where(eq(schema.crmConversations.id, conversationId));

      if (conv) {
        await db.insert(schema.crmMessages).values({
          conversationId: conv.id,
          channel: conv.channel,
          senderType: "admin",
          content: quote.formattedMessage,
          intentDetected: "quote_sent"
        });

        await db
          .update(schema.crmConversations)
          .set({
            status: "quote_sent",
            quoteData: quote,
            lastMessageText: `[Quotation Sent]: ₹${quote.totalPrice}`,
            lastMessageAt: new Date(),
          })
          .where(eq(schema.crmConversations.id, conv.id));

        if (conv.channel === "instagram") {
          await sendInstagramDm(conv.externalUserId, quote.formattedMessage);
        } else {
          await sendWhatsAppMessage(conv.externalUserId, quote.formattedMessage);
        }
      }

      return NextResponse.json({ success: true, quote });
    }

    // Action 4: Trigger Automated Sales Drip Engine
    if (action === "trigger_drip") {
      const dripResult = await runSalesDripEngine();
      return NextResponse.json({ success: true, ...dripResult });
    }

    // Action 5: Send Manual Admin Reply
    if (action === "send_admin_reply") {
      if (!conversationId || !messageText) {
        return NextResponse.json({ error: "Missing conversationId or messageText" }, { status: 400 });
      }

      if (db._isMock) {
        const target = mockConversations.find(c => c.id === conversationId);
        if (target) {
          target.messages.push({
            id: Date.now(),
            senderType: "admin",
            content: messageText,
            createdAt: new Date().toISOString()
          });
          target.lastMessageText = messageText;
          target.lastMessageAt = new Date().toISOString();
          target.unreadCount = 0;
          target.mode = "human";

          if (target.channel === "instagram") {
            await sendInstagramDm(target.externalUserId, messageText);
          } else {
            await sendWhatsAppMessage(target.externalUserId, messageText);
          }
        }
        return NextResponse.json({ success: true, message: "Reply sent successfully" });
      }

      const [conv] = await db
        .select()
        .from(schema.crmConversations)
        .where(eq(schema.crmConversations.id, conversationId));

      if (conv) {
        await db.insert(schema.crmMessages).values({
          conversationId: conv.id,
          channel: conv.channel,
          senderType: "admin",
          content: messageText,
        });

        await db
          .update(schema.crmConversations)
          .set({
            mode: "human",
            lastMessageText: messageText,
            lastMessageAt: new Date(),
          })
          .where(eq(schema.crmConversations.id, conv.id));

        if (conv.channel === "instagram") {
          await sendInstagramDm(conv.externalUserId, messageText);
        } else {
          await sendWhatsAppMessage(conv.externalUserId, messageText);
        }
      }

      return NextResponse.json({ success: true, message: "Reply sent successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[CRM API POST Error]:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
