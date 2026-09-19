import { GET, POST } from "../app/api/admin/crm/route";
import { NextRequest } from "next/server";

async function testAdminCrmApi() {
  console.log("=== 3. Testing Admin CRM API Endpoints ===");

  // Test 1: GET Conversations
  const reqGet = new NextRequest("http://localhost:3000/api/admin/crm");
  const resGet = await GET(reqGet);
  const dataGet = await resGet.json();
  console.log("\n[Test 1 - GET CRM Conversations]:");
  console.log("Success:", dataGet.success);
  console.log("Count:", dataGet.conversations?.length);

  // Test 2: POST toggle_mode to human for Conversation 101
  const reqToggle = new NextRequest("http://localhost:3000/api/admin/crm", {
    method: "POST",
    body: JSON.stringify({ action: "toggle_mode", conversationId: 101, mode: "human" })
  });
  const resToggle = await POST(reqToggle);
  console.log("\n[Test 2 - Toggle Mode to Human]:", await resToggle.json());

  // Test 3: POST send_admin_reply from Human Admin back to Instagram user
  const reqSend = new NextRequest("http://localhost:3000/api/admin/crm", {
    method: "POST",
    body: JSON.stringify({
      action: "send_admin_reply",
      conversationId: 101,
      messageText: "Hello Priya, I'm Sneha from TripNaari team. I can offer you 5% off on your July Ladakh trip!"
    })
  });
  const resSend = await POST(reqSend);
  console.log("\n[Test 3 - Send Admin Reply to Customer]:", await resSend.json());

  // Test 4: POST generate_quote for Conversation 101
  const reqQuote = new NextRequest("http://localhost:3000/api/admin/crm", {
    method: "POST",
    body: JSON.stringify({
      action: "generate_quote",
      conversationId: 101,
      quoteInput: {
        customerName: "Priya Sharma",
        tripTitle: "Ladakh Women Special",
        tripSlug: "ladakh-women-special",
        pricePerPerson: 32999,
        travelers: 2,
        depositAmount: 8000
      }
    })
  });
  const resQuote = await POST(reqQuote);
  console.log("\n[Test 4 - Generate Quotation]:", await resQuote.json());

  // Test 5: POST launch_broadcast campaign
  const reqBroadcast = new NextRequest("http://localhost:3000/api/admin/crm", {
    method: "POST",
    body: JSON.stringify({
      action: "launch_broadcast",
      broadcastPayload: {
        campaignTitle: "Monsoon Festival Special 🌧️",
        textMessage: "Book Meghalaya monsoon trek and get free rafting voucher!",
        segment: "all_qualified"
      }
    })
  });
  const resBroadcast = await POST(reqBroadcast);
  console.log("\n[Test 5 - Launch Broadcast Campaign]:", await resBroadcast.json());

  console.log("\n=== Admin CRM API Tests Completed Successfully ===");
}

testAdminCrmApi().catch(console.error);
