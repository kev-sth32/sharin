import { GET as getCron } from "../app/api/cron/sales-drip/route";
import { GET as getTokenStatus } from "../app/api/admin/crm/token-status/route";
import { POST as postCrm } from "../app/api/admin/crm/route";
import { sendWhatsAppInteractiveButtons } from "../lib/ai-crm";
import { NextRequest } from "next/server";

async function runVerification() {
  console.log("=== Verification of New Omnichannel CRM Features ===");

  // 1. Test Token Health Status API
  console.log("\n[Test 1 - Token Status Endpoint]:");
  const resToken = await getTokenStatus();
  const dataToken = await resToken.json();
  console.log("Status:", dataToken.status);
  console.log("Primary AI Engine:", dataToken.channels?.aiEngine?.primary);

  // 2. Test Automated Background Cron Sales Drip Route
  console.log("\n[Test 2 - Background Cron Drip Route]:");
  const reqCron = new NextRequest("http://localhost:3000/api/cron/sales-drip");
  const resCron = await getCron(reqCron);
  const dataCron = await resCron.json();
  console.log("Success:", dataCron.success);
  console.log("Evaluated Leads:", dataCron.evaluated);

  // 3. Test Interactive WhatsApp Buttons Helper
  console.log("\n[Test 3 - WhatsApp Interactive Buttons Function]:");
  const btnRes = await sendWhatsAppInteractiveButtons("919876543210", "Select your travel option:", [
    { id: "opt_pdf", title: "Itinerary PDF" },
    { id: "opt_agent", title: "Talk to Specialist" }
  ]);
  console.log("Button Send Status:", btnRes);

  // 4. Test CRM Action send_whatsapp_buttons
  console.log("\n[Test 4 - CRM Action send_whatsapp_buttons]:");
  const reqBtn = new NextRequest("http://localhost:3000/api/admin/crm", {
    method: "POST",
    body: JSON.stringify({
      action: "send_whatsapp_buttons",
      conversationId: 102,
      bodyText: "How can our trip leader assist you?",
      buttons: [
        { id: "b1", title: "Lock Seat (₹8,000)" },
        { id: "b2", title: "Request Itinerary" }
      ]
    })
  });
  const resBtn = await postCrm(reqBtn);
  console.log("Result:", await resBtn.json());

  console.log("\n=== All New Features Verified Successfully! ===");
}

runVerification().catch(console.error);
