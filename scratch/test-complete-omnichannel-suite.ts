import { GET as getMetaWebhook, POST as postMetaWebhook } from "../app/api/webhooks/meta/route";
import { GET as getTokenStatus } from "../app/api/admin/crm/token-status/route";
import { GET as getCronDrip, POST as postCronDrip } from "../app/api/cron/sales-drip/route";
import { GET as getCrmApi, POST as postCrmApi } from "../app/api/admin/crm/route";
import { POST as postWebsiteChat } from "../app/api/chat/route";
import { processAiLeadRefinement, sendWhatsAppInteractiveButtons } from "../lib/ai-crm";
import { crmEventEmitter } from "../lib/crm-events";
import { NextRequest } from "next/server";

async function runCompleteTestSuite() {
  console.log("==========================================================");
  console.log("🚀 COMPREHENSIVE END-TO-END OMNICHANNEL TEST SUITE");
  console.log("==========================================================");

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, detail: string = "") {
    if (condition) {
      console.log(`✅ [PASS] ${testName} ${detail ? `(${detail})` : ""}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `(${detail})` : ""}`);
      failedCount++;
    }
  }

  // ---------------------------------------------------------
  // TEST 1: Meta Webhook GET Verification Challenge
  // ---------------------------------------------------------
  try {
    const req1 = new NextRequest("http://localhost:3000/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=tripnaari_crm_secret_token&hub.challenge=TEST_VERIFY_999");
    const res1 = await getMetaWebhook(req1);
    const body1 = await res1.text();
    assert(res1.status === 200 && body1 === "TEST_VERIFY_999", "Meta Webhook GET Verification Challenge", `Status ${res1.status}`);
  } catch (e: any) {
    assert(false, "Meta Webhook GET Verification Challenge", e.message);
  }

  // ---------------------------------------------------------
  // TEST 2: Incoming Instagram DM Webhook (POST) & SSE Broadcast
  // ---------------------------------------------------------
  let sseEventReceived = false;
  const sseListener = (data: any) => {
    sseEventReceived = true;
  };
  crmEventEmitter.on("crm_event", sseListener);

  try {
    const igPayload = {
      object: "instagram",
      entry: [
        {
          id: "178414000000000",
          messaging: [
            {
              sender: { id: "ig_test_suite_user" },
              recipient: { id: "178414000000000" },
              message: { text: "Hi! Interested in Spiti Valley trip in September for 2 girls. Contact: 9811223344" }
            }
          ]
        }
      ]
    };
    const req2 = new NextRequest("http://localhost:3000/api/webhooks/meta", { method: "POST", body: JSON.stringify(igPayload) });
    const res2 = await postMetaWebhook(req2);
    const data2 = await res2.json();
    assert(res2.status === 200 && data2.status === "EVENT_RECEIVED", "Incoming Instagram DM Webhook", `ACK Status ${res2.status}`);
    assert(sseEventReceived, "Live SSE Stream Event Emission on IG DM", "Broadcast Event Received");
  } catch (e: any) {
    assert(false, "Incoming Instagram DM Webhook", e.message);
  }

  crmEventEmitter.off("crm_event", sseListener);

  // ---------------------------------------------------------
  // TEST 3: Incoming WhatsApp Message Webhook & AI Lead Refinement
  // ---------------------------------------------------------
  try {
    const waPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "WHATSAPP_ACC_ID_123",
          changes: [
            {
              value: {
                contacts: [{ profile: { name: "Ritu Verma" }, wa_id: "919988776655" }],
                messages: [
                  {
                    from: "919988776655",
                    id: "wamid.123",
                    text: { body: "Can I speak to a real human agent please?" },
                    type: "text"
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    const req3 = new NextRequest("http://localhost:3000/api/webhooks/meta", { method: "POST", body: JSON.stringify(waPayload) });
    const res3 = await postMetaWebhook(req3);
    const data3 = await res3.json();
    assert(res3.status === 200 && data3.status === "EVENT_RECEIVED", "Incoming WhatsApp Webhook", "WhatsApp ACK 200 OK");
  } catch (e: any) {
    assert(false, "Incoming WhatsApp Webhook", e.message);
  }

  // ---------------------------------------------------------
  // TEST 4: Token Health Status API Route
  // ---------------------------------------------------------
  try {
    const res4 = await getTokenStatus();
    const data4 = await res4.json();
    assert(res4.status === 200 && data4.success === true, "Token Health Status API", `Status: ${data4.status}, Primary AI: ${data4.channels?.aiEngine?.primary}`);
  } catch (e: any) {
    assert(false, "Token Health Status API", e.message);
  }

  // ---------------------------------------------------------
  // TEST 5: Background Cron Sales Drip Engine
  // ---------------------------------------------------------
  try {
    const req5 = new NextRequest("http://localhost:3000/api/cron/sales-drip");
    const res5 = await getCronDrip(req5);
    const data5 = await res5.json();
    assert(res5.status === 200 && data5.success === true, "Automated Background Cron Drip Engine", `Evaluated: ${data5.evaluated || 0} leads`);
  } catch (e: any) {
    assert(false, "Automated Background Cron Drip Engine", e.message);
  }

  // ---------------------------------------------------------
  // TEST 6: Admin CRM Actions (Toggle Mode, Send Reply, Interactive Buttons, Quote, Broadcast)
  // ---------------------------------------------------------
  try {
    // 6a: GET Conversations
    const req6a = new NextRequest("http://localhost:3000/api/admin/crm");
    const res6a = await getCrmApi(req6a);
    const data6a = await res6a.json();
    assert(res6a.status === 200 && Array.isArray(data6a.conversations), "CRM API GET Conversations", `Found ${data6a.conversations?.length || 0} conversations`);

    // 6b: Toggle Mode to Human
    const req6b = new NextRequest("http://localhost:3000/api/admin/crm", {
      method: "POST",
      body: JSON.stringify({ action: "toggle_mode", conversationId: 101, mode: "human" })
    });
    const res6b = await postCrmApi(req6b);
    const data6b = await res6b.json();
    assert(data6b.success === true && data6b.mode === "human", "CRM Action: Toggle Mode", "Toggled to Human");

    // 6c: Send Manual Admin Reply
    const req6c = new NextRequest("http://localhost:3000/api/admin/crm", {
      method: "POST",
      body: JSON.stringify({ action: "send_admin_reply", conversationId: 101, messageText: "Hi Priya, our team is ready to book your Ladakh trip!" })
    });
    const res6c = await postCrmApi(req6c);
    const data6c = await res6c.json();
    assert(data6c.success === true, "CRM Action: Send Admin Manual Reply", "Reply Dispatched");

    // 6d: Send WhatsApp Interactive Buttons
    const req6d = new NextRequest("http://localhost:3000/api/admin/crm", {
      method: "POST",
      body: JSON.stringify({
        action: "send_whatsapp_buttons",
        conversationId: 102,
        bodyText: "Please choose an action below:",
        buttons: [
          { id: "b1", title: "View Itinerary" },
          { id: "b2", title: "Lock Seat ₹8,000" }
        ]
      })
    });
    const res6d = await postCrmApi(req6d);
    const data6d = await res6d.json();
    assert(data6d.success === true, "CRM Action: Send WhatsApp Interactive Buttons", "Buttons Formatted & Sent");

    // 6e: Generate Trip Quotation & Deposit URL
    const req6e = new NextRequest("http://localhost:3000/api/admin/crm", {
      method: "POST",
      body: JSON.stringify({
        action: "generate_quote",
        conversationId: 101,
        quoteInput: {
          conversationId: 101,
          tripSlug: "meghalaya-backpacking",
          tripTitle: "Meghalaya Backpacking",
          pricePerHead: 24999,
          travelersCount: 2,
          depositAmount: 6000
        }
      })
    });
    const res6e = await postCrmApi(req6e);
    const data6e = await res6e.json();
    assert(data6e.success === true && data6e.quote?.depositAmount === 6000, "CRM Action: Generate Quotation & Deposit Link", `Quote ID: ${data6e.quote?.quoteId}`);

    // 6f: Apply Promo Voucher
    const req6f = new NextRequest("http://localhost:3000/api/admin/crm", {
      method: "POST",
      body: JSON.stringify({ action: "apply_promo_coupon", conversationId: 101, couponCode: "GIRLTrip1000" })
    });
    const res6f = await postCrmApi(req6f);
    const data6f = await res6f.json();
    assert(data6f.success === true && data6f.coupon === "GIRLTrip1000", "CRM Action: Apply Promo Voucher", "Voucher Applied");

    // 6g: Launch WhatsApp Broadcast Campaign
    const req6g = new NextRequest("http://localhost:3000/api/admin/crm", {
      method: "POST",
      body: JSON.stringify({
        action: "launch_broadcast",
        broadcastPayload: {
          campaignTitle: "Autum Spiti Expedition",
          segment: "all_qualified",
          textMessage: "Early bird discount of ₹2,000 ends this weekend!"
        }
      })
    });
    const res6g = await postCrmApi(req6g);
    const data6g = await res6g.json();
    assert(data6g.success === true, "CRM Action: Launch WhatsApp Broadcast Campaign", `Recipients: ${data6g.recipientCount}`);

  } catch (e: any) {
    assert(false, "Admin CRM Actions Suite", e.message);
  }

  // ---------------------------------------------------------
  // TEST 7: Website AI Chat Stream API Route
  // ---------------------------------------------------------
  try {
    const req7 = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hi! What Kashmir trip packages do you offer?" }],
        role: "customer"
      })
    });
    const res7 = await postWebsiteChat(req7);
    assert(res7.status === 200, "Website AI Chat Assistant Route", `HTTP Stream Response ${res7.status}`);
  } catch (e: any) {
    assert(false, "Website AI Chat Assistant Route", e.message);
  }

  console.log("\n==========================================================");
  console.log(`📊 TEST SUITE SUMMARY: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log("==========================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runCompleteTestSuite().catch(console.error);
