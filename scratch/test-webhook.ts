import { GET, POST } from "../app/api/webhooks/meta/route";
import { NextRequest } from "next/server";

async function testWebhooks() {
  console.log("=== 2. Testing Meta Webhook Endpoints ===");

  // Test 1: GET verification challenge
  const reqGet = new NextRequest("http://localhost:3000/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=tripnaari_crm_secret_token&hub.challenge=CHALLENGE_ACCEPTED_12345");
  const resGet = await GET(reqGet);
  const getBody = await resGet.text();
  console.log("\n[Test 1 - Verification GET Challenge Response]:");
  console.log("Status:", resGet.status);
  console.log("Body:", getBody);

  // Test 2: POST Incoming Instagram DM payload
  const igPayload = {
    object: "instagram",
    entry: [
      {
        id: "178414000000000",
        time: Date.now(),
        messaging: [
          {
            sender: { id: "ig_user_test_999" },
            recipient: { id: "178414000000000" },
            timestamp: Date.now(),
            message: { text: "Hi! I want to inquire about Spiti Valley package in September. Call me on 9988776655" }
          }
        ]
      }
    ]
  };

  const reqPostIg = new NextRequest("http://localhost:3000/api/webhooks/meta", {
    method: "POST",
    body: JSON.stringify(igPayload)
  });

  console.log("\n[Test 2 - POST Incoming Instagram DM]:");
  const resPostIg = await POST(reqPostIg);
  console.log("Instagram Webhook Response Status:", resPostIg.status);
  console.log("Body:", await resPostIg.json());

  // Test 3: POST Incoming WhatsApp Business payload
  const waPayload = {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "WHATSAPP_ACC_ID_123",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: { display_phone_number: "15550228833", phone_number_id: "100609346383210" },
              contacts: [{ profile: { name: "Simran Kaur" }, wa_id: "919876500112" }],
              messages: [
                {
                  from: "919876500112",
                  id: "wamid.HBgLOTE5ODc2NTAwMTEyFQIAERgSQTAzQjY5QzYwNDY1NkQ0OUExAA==",
                  timestamp: `${Math.floor(Date.now() / 1000)}`,
                  text: { body: "Can I speak to a human manager about booking Kerala trip?" },
                  type: "text"
                }
              ]
            },
            field: "messages"
          }
        ]
      }
    ]
  };

  const reqPostWa = new NextRequest("http://localhost:3000/api/webhooks/meta", {
    method: "POST",
    body: JSON.stringify(waPayload)
  });

  console.log("\n[Test 3 - POST Incoming WhatsApp Message]:");
  const resPostWa = await POST(reqPostWa);
  console.log("WhatsApp Webhook Response Status:", resPostWa.status);
  console.log("Body:", await resPostWa.json());

  console.log("\n=== Meta Webhook Tests Completed ===");
}

testWebhooks().catch(console.error);
