import { NextRequest, NextResponse } from "next/server";
import { dbInstance, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { sendInstagramDm, sendWhatsAppMessage, sendWhatsAppInteractiveButtons } from "@/lib/ai-crm";
import { generateTripQuotation, generatePreTripBriefing, runSalesDripEngine } from "@/lib/sales-engine";
import { broadcastCrmEvent } from "@/lib/crm-events";

// Mock memory store when database is in fallback mode
let mockConversations: any[] = [
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
    internalNotes: [
      { id: 1, author: "Sneha Kapur", text: "Customer asked for women solo discount. Advised July batch.", createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() }
    ],
    documentVault: [
      { id: 1, docType: "Aadhaar Card / Govt ID", fileName: "Priya_ID_Proof.pdf", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", uploadedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() }
    ],
    appliedCoupon: null,
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
    status: "payment_pending",
    dripStep: 1,
    internalNotes: [
      { id: 2, author: "Rahul Sharma", text: "Sent quote link for ₹99,996 for group of 4. Follow up by 5 PM.", createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() }
    ],
    documentVault: [],
    appliedCoupon: "GIRLTrip1000",
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

import { getAIChatLogs } from "@/lib/admin-store";

async function getMergedCRMConversations() {
  const liveLogs = await getAIChatLogs();
  
  const formattedLogs: any[] = (liveLogs || []).map((log: any, idx: number) => {
    const latestMsg = log.messages?.[log.messages.length - 1];
    const userMsgs = (log.messages || []).filter((m: any) => m.role === "user");
    const firstUserQuery = userMsgs[0]?.content || "";
    
    // Extract destination keyword if present
    const destMatch = ["kashmir", "kerala", "meghalaya", "spiti", "rajasthan", "goa", "ladakh"].find(d => 
      firstUserQuery.toLowerCase().includes(d) || (log.context?.pathname || "").toLowerCase().includes(d)
    );
    const destName = destMatch ? destMatch.charAt(0).toUpperCase() + destMatch.slice(1) : (log.context?.pathname?.replace("/trips/", "").replace(/-/g, " ") || "Women's Trip");

    const isHot = log.context?.isHotLead || firstUserQuery.toLowerCase().includes("book") || firstUserQuery.toLowerCase().includes("price") || firstUserQuery.toLowerCase().includes("discount");

    return {
      id: 9000 + idx + 1,
      channel: "website_chat",
      externalUserId: log.id,
      externalUsername: `web_visitor_${log.id.slice(-5)}`,
      customerName: `Web Visitor (${log.id.slice(-4)})`,
      assignedAgent: log.context?.isHotLead ? "NaariAI Priority Sales" : "NaariAI Bot",
      mode: "ai",
      status: isHot ? "qualified" : "active",
      dripStep: 0,
      internalNotes: log.context?.pathname ? [
        { id: Date.now() + idx, author: "NaariAI Analytics", text: `Visitor active on ${log.context.pathname}`, createdAt: log.createdAt || new Date().toISOString() }
      ] : [],
      documentVault: [],
      appliedCoupon: log.context?.isHotLead ? "SOLO1000" : null,
      lastMessageText: latestMsg?.content || "Conversation started",
      lastMessageAt: log.updatedAt || log.createdAt || new Date().toISOString(),
      unreadCount: 0,
      messages: (log.messages || []).map((m: any, mIdx: number) => ({
        id: (idx + 1) * 1000 + mIdx + 1,
        senderType: m.role === "user" ? "user" : "ai",
        content: m.content || "",
        createdAt: log.createdAt || new Date().toISOString()
      })),
      lead: {
        destination: destName,
        travelMonth: "Upcoming Batch",
        phone: "+91 98618 06115",
        budget: isHot ? "₹20,000 - ₹35,000" : "Standard Package",
        intentScore: log.context?.intentScore || (isHot ? 90 : 45)
      }
    };
  });

  const combined = [...mockConversations, ...formattedLogs];
  combined.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  return combined;
}

export async function GET(req: NextRequest) {
  try {
    const db = dbInstance();
    const merged = await getMergedCRMConversations();

    if (db._isMock) {
      return NextResponse.json({ success: true, conversations: merged });
    }

    const dbConversations = await db
      .select()
      .from(schema.crmConversations)
      .orderBy(desc(schema.crmConversations.lastMessageAt));

    const finalConversations = dbConversations.length > 0 ? dbConversations : merged;
    return NextResponse.json({ success: true, conversations: finalConversations });
  } catch (err) {
    console.error("[CRM API GET Error]:", err);
    const fallbackMerged = await getMergedCRMConversations();
    return NextResponse.json({ success: false, conversations: fallbackMerged });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      action, 
      conversationId, 
      mode, 
      status, 
      messageText, 
      noteText, 
      agentName, 
      quoteInput, 
      broadcastPayload,
      docType,
      fileName,
      fileUrl,
      couponCode
    } = body;
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

    // Action 2: Update Lead Lifecycle Pipeline Stage
    if (action === "update_status") {
      if (db._isMock) {
        const target = mockConversations.find(c => c.id === conversationId);
        if (target) target.status = status;
        return NextResponse.json({ success: true, status });
      }

      await db
        .update(schema.crmConversations)
        .set({ status })
        .where(eq(schema.crmConversations.id, conversationId));

      return NextResponse.json({ success: true, status });
    }

    // Action 3: Assign Lead to Agent
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

    // Action 4: Add Private Internal Team Note
    if (action === "add_internal_note") {
      if (!noteText || !conversationId) {
        return NextResponse.json({ error: "Missing note text or conversationId" }, { status: 400 });
      }

      const newNote = {
        id: Date.now(),
        author: agentName || "Admin Support",
        text: noteText,
        createdAt: new Date().toISOString()
      };

      if (db._isMock) {
        const target = mockConversations.find(c => c.id === conversationId);
        if (target) {
          if (!target.internalNotes) target.internalNotes = [];
          target.internalNotes.push(newNote);
        }
        return NextResponse.json({ success: true, note: newNote });
      }

      const [conv] = await db
        .select()
        .from(schema.crmConversations)
        .where(eq(schema.crmConversations.id, conversationId));

      if (conv) {
        const existingNotes = Array.isArray(conv.internalNotes) ? conv.internalNotes : [];
        const updatedNotes = [...existingNotes, newNote];

        await db
          .update(schema.crmConversations)
          .set({ internalNotes: updatedNotes })
          .where(eq(schema.crmConversations.id, conv.id));
      }

      return NextResponse.json({ success: true, note: newNote });
    }

    // Action 5: Save Passport / Travel Document to Vault
    if (action === "upload_travel_doc") {
      if (!conversationId || !fileUrl) {
        return NextResponse.json({ error: "Missing file details" }, { status: 400 });
      }

      const newDoc = {
        id: Date.now(),
        docType: docType || "Govt ID Proof",
        fileName: fileName || "Traveler_Document.pdf",
        fileUrl,
        uploadedAt: new Date().toISOString()
      };

      if (db._isMock) {
        const target = mockConversations.find(c => c.id === conversationId);
        if (target) {
          if (!target.documentVault) target.documentVault = [];
          target.documentVault.push(newDoc);
        }
        return NextResponse.json({ success: true, doc: newDoc });
      }

      const [conv] = await db
        .select()
        .from(schema.crmConversations)
        .where(eq(schema.crmConversations.id, conversationId));

      if (conv) {
        const existingDocs = Array.isArray(conv.documentVault) ? conv.documentVault : [];
        const updatedDocs = [...existingDocs, newDoc];

        await db
          .update(schema.crmConversations)
          .set({ documentVault: updatedDocs })
          .where(eq(schema.crmConversations.id, conv.id));
      }

      return NextResponse.json({ success: true, doc: newDoc });
    }

    // Action 6: Apply Promo Coupon Code
    if (action === "apply_promo_coupon") {
      const code = couponCode || "TRIPNAARI500";
      const offerText = `🎁 *SPECIAL EXCLUSIVE DISCOUNT APPLIED!*
Use promo code *${code}* at online checkout to get ₹500 instant discount on your reservation! ✨`;

      if (db._isMock) {
        const target = mockConversations.find(c => c.id === conversationId);
        if (target) {
          target.appliedCoupon = code;
          target.messages.push({
            id: Date.now(),
            senderType: "admin",
            content: offerText,
            createdAt: new Date().toISOString()
          });

          if (target.channel === "instagram") {
            await sendInstagramDm(target.externalUserId, offerText);
          } else {
            await sendWhatsAppMessage(target.externalUserId, offerText);
          }
        }
        return NextResponse.json({ success: true, coupon: code, message: offerText });
      }

      const [conv] = await db
        .select()
        .from(schema.crmConversations)
        .where(eq(schema.crmConversations.id, conversationId));

      if (conv) {
        await db
          .update(schema.crmConversations)
          .set({ appliedCoupon: code })
          .where(eq(schema.crmConversations.id, conv.id));

        await db.insert(schema.crmMessages).values({
          conversationId: conv.id,
          channel: conv.channel,
          senderType: "admin",
          content: offerText,
          intentDetected: "coupon_applied"
        });

        if (conv.channel === "instagram") {
          await sendInstagramDm(conv.externalUserId, offerText);
        } else {
          await sendWhatsAppMessage(conv.externalUserId, offerText);
        }
      }

      return NextResponse.json({ success: true, coupon: code, message: offerText });
    }

    // Action 7: Send Pre-Trip Packing Briefing
    if (action === "send_pretrip_briefing") {
      const target = mockConversations.find(c => c.id === conversationId);
      const customerName = target?.customerName || "Traveler";
      const destination = target?.lead?.destination || "Upcoming Trip";
      const departureDate = target?.lead?.travelMonth || "This Month";

      const briefingMessage = generatePreTripBriefing(customerName, destination, departureDate);

      if (db._isMock) {
        if (target) {
          target.messages.push({
            id: Date.now(),
            senderType: "admin",
            content: briefingMessage,
            createdAt: new Date().toISOString()
          });

          if (target.channel === "instagram") {
            await sendInstagramDm(target.externalUserId, briefingMessage);
          } else {
            await sendWhatsAppMessage(target.externalUserId, briefingMessage);
          }
        }
        return NextResponse.json({ success: true, briefingMessage });
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
          content: briefingMessage,
          intentDetected: "pretrip_briefing_sent"
        });

        if (conv.channel === "instagram") {
          await sendInstagramDm(conv.externalUserId, briefingMessage);
        } else {
          await sendWhatsAppMessage(conv.externalUserId, briefingMessage);
        }
      }

      return NextResponse.json({ success: true, briefingMessage });
    }

    // Action 8: Send Post-Trip Feedback Survey Link
    if (action === "send_feedback_survey") {
      const surveyText = `🌸 *HOW WAS YOUR TRIP WITH TRIPNAARI?*
Hi! We hope you had a magical journey! We'd love to hear your feedback and feature your review on our website:
👉 Submit Review: https://tripnaari.com/feedback`;

      if (db._isMock) {
        const target = mockConversations.find(c => c.id === conversationId);
        if (target) {
          target.messages.push({
            id: Date.now(),
            senderType: "admin",
            content: surveyText,
            createdAt: new Date().toISOString()
          });

          if (target.channel === "instagram") {
            await sendInstagramDm(target.externalUserId, surveyText);
          } else {
            await sendWhatsAppMessage(target.externalUserId, surveyText);
          }
        }
        return NextResponse.json({ success: true, message: surveyText });
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
          content: surveyText,
          intentDetected: "feedback_survey_sent"
        });

        if (conv.channel === "instagram") {
          await sendInstagramDm(conv.externalUserId, surveyText);
        } else {
          await sendWhatsAppMessage(conv.externalUserId, surveyText);
        }
      }

      return NextResponse.json({ success: true, message: surveyText });
    }

    // Action 9: Generate & Send Formal Quotation Link
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
          target.status = "payment_pending";

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
            status: "payment_pending",
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

    // Action 10: Trigger Automated Sales Drip Engine
    if (action === "trigger_drip") {
      const dripResult = await runSalesDripEngine();
      return NextResponse.json({ success: true, ...dripResult });
    }

    // Action 11: Launch WhatsApp Bulk Broadcast Campaign
    if (action === "launch_broadcast") {
      const { campaignTitle, textMessage, segment } = broadcastPayload || {};
      console.log(`[Broadcast Launched]: Title="${campaignTitle}", Segment="${segment}"`);

      const fullMessage = `📢 *${campaignTitle}*\n\n${textMessage}\n\n_Sent by TripNaari Sales Team_`;
      let sentCount = 0;
      let failedCount = 0;

      if (db._isMock) {
        // --- MOCK MODE: update in-memory conversations ---
        for (const c of mockConversations) {
          if (c.channel !== "whatsapp") continue;

          // Apply segment filter
          if (segment === "all_qualified" && !["qualified", "quote_sent"].includes(c.status)) continue;
          if (segment === "all_booked" && c.status !== "booked") continue;
          if (segment === "hot_leads_only" && !(c.lead?.intentScore && c.lead.intentScore >= 75)) continue;
          if (segment === "closed_leads" && c.status !== "closed") continue;
          // "all_leads" → no filter

          c.messages.push({
            id: Date.now() + sentCount,
            senderType: "admin",
            content: fullMessage,
            createdAt: new Date().toISOString()
          });
          c.lastMessageText = `📢 ${campaignTitle}`;
          c.lastMessageAt = new Date().toISOString();

          // Log mock send
          console.log(`[Broadcast Mock] Would send to: ${c.externalUsername}`);
          sentCount++;
        }

        return NextResponse.json({
          success: true,
          recipientCount: sentCount,
          sentCount,
          failedCount: 0,
          message: `Campaign "${campaignTitle}" dispatched to ${sentCount} WA recipients.`
        });
      }

      // --- LIVE DB MODE: query real conversations by segment ---
      try {
        let dbThreads = await db
          .select()
          .from(schema.crmConversations)
          .where(eq(schema.crmConversations.channel, "whatsapp"));

        // Apply segment filter on fetched rows
        if (segment === "all_qualified") {
          dbThreads = dbThreads.filter((c: any) => ["qualified", "quote_sent"].includes(c.status));
        } else if (segment === "all_booked") {
          dbThreads = dbThreads.filter((c: any) => c.status === "booked");
        } else if (segment === "hot_leads_only") {
          dbThreads = dbThreads.filter((c: any) => c.lead?.intentScore && c.lead.intentScore >= 75);
        } else if (segment === "closed_leads") {
          dbThreads = dbThreads.filter((c: any) => c.status === "closed");
        }
        // "all_leads" → no filter, send to all WA conversations

        for (const thread of dbThreads) {
          try {
            const sent = await sendWhatsAppMessage(thread.externalUserId, fullMessage);
            if (sent) {
              sentCount++;
              // Log broadcast message to conversation in DB
              await db.insert(schema.crmMessages).values({
                conversationId: thread.id,
                channel: "whatsapp",
                senderType: "admin",
                content: fullMessage,
                intentDetected: `broadcast_${segment || "all"}`
              });

              await db
                .update(schema.crmConversations)
                .set({ lastMessageText: `📢 ${campaignTitle}`, lastMessageAt: new Date() })
                .where(eq(schema.crmConversations.id, thread.id));
            } else {
              failedCount++;
            }
          } catch (sendErr) {
            console.error(`[Broadcast] Failed to send to ${thread.externalUserId}:`, sendErr);
            failedCount++;
          }
        }

        return NextResponse.json({
          success: true,
          recipientCount: sentCount,
          sentCount,
          failedCount,
          message: `Campaign "${campaignTitle}" dispatched to ${sentCount} WA recipients. ${failedCount > 0 ? `(${failedCount} failed)` : ""}`
        });
      } catch (broadcastErr) {
        console.error("[Broadcast DB Error]:", broadcastErr);
        return NextResponse.json({ error: "Broadcast failed due to DB error" }, { status: 500 });
      }
    }


    // Action 12: Send Manual Admin Reply
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

    // Action 13: Create Manual Lead
    if (action === "create_lead") {
      const { customerName, phone, channel, destination, initialMessage } = body;
      const newLeadId = Date.now();
      const newLead = {
        id: newLeadId,
        channel: channel || "whatsapp",
        externalUserId: phone || `manual_${newLeadId}`,
        externalUsername: phone || customerName,
        customerName: customerName || "New Traveler Lead",
        assignedAgent: "Unassigned",
        mode: "human",
        status: "active",
        dripStep: 0,
        internalNotes: [
          { id: Date.now(), author: "Admin CRM", text: "Manually registered lead in CRM", createdAt: new Date().toISOString() }
        ],
        documentVault: [],
        appliedCoupon: null,
        lastMessageText: initialMessage || "Manual inquiry logged",
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        messages: [
          { id: Date.now(), senderType: "user", content: initialMessage || "Inquiry initiated via phone/desk", createdAt: new Date().toISOString() }
        ],
        lead: {
          destination: destination || "General Inquiry",
          travelMonth: "Upcoming Batch",
          phone: phone || "",
          intentScore: 70
        }
      };

      mockConversations.unshift(newLead);
      return NextResponse.json({ success: true, conversation: newLead });
    }

    // Action 14: Delete Conversation Thread
    if (action === "delete_conversation") {
      mockConversations = mockConversations.filter(c => c.id !== conversationId);
      return NextResponse.json({ success: true, message: "Conversation deleted successfully" });
    }

    // Action 15: Delete Individual Message
    if (action === "delete_message") {
      const { messageId } = body;
      const target = mockConversations.find(c => c.id === conversationId);
      if (target && target.messages) {
        target.messages = target.messages.filter((m: any) => m.id !== messageId);
      }
      return NextResponse.json({ success: true, message: "Message deleted successfully" });
    }

    // Action 16: Send Interactive WhatsApp Buttons
    if (action === "send_whatsapp_buttons") {
      const { buttons, bodyText } = body;
      if (!conversationId || !buttons || !Array.isArray(buttons)) {
        return NextResponse.json({ error: "Missing buttons array or conversationId" }, { status: 400 });
      }

      const target = mockConversations.find(c => c.id === conversationId);
      const textSummary = `[Interactive Buttons Sent]: ${bodyText || "Select an option below:"}\n${buttons.map((b: any) => `🔘 ${b.title}`).join("\n")}`;

      if (target) {
        target.messages.push({
          id: Date.now(),
          senderType: "admin",
          content: textSummary,
          createdAt: new Date().toISOString()
        });
        target.lastMessageText = textSummary;
        target.lastMessageAt = new Date().toISOString();

        if (target.channel === "whatsapp") {
          await sendWhatsAppInteractiveButtons(target.externalUserId, bodyText || "Please choose an option:", buttons);
        }
      }

      broadcastCrmEvent({
        type: "new_message",
        conversationId,
        channel: target?.channel || "whatsapp",
        messageText: textSummary,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ success: true, message: "Interactive buttons dispatched successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[CRM API POST Error]:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
