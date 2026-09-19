import { processAiLeadRefinement } from "../lib/ai-crm";

async function testOmnichannelLogic() {
  console.log("=== 1. Testing AI Lead Refinement Engine ===");
  
  // Test Case 1: Initial greeting
  const test1 = await processAiLeadRefinement("Hi, I want to know about your trips", [], "instagram");
  console.log("\n[Test 1 - Initial IG Query]:");
  console.log("Reply:", test1.replyText);
  console.log("Extracted:", JSON.stringify(test1.extractedLead, null, 2));

  // Test Case 2: Specific Destination + Phone number
  const test2 = await processAiLeadRefinement("I am planning for Ladakh trip in July with 2 friends. My WhatsApp is 9876543210", [], "whatsapp");
  console.log("\n[Test 2 - WhatsApp Lead with Phone & Destination]:");
  console.log("Reply:", test2.replyText);
  console.log("Extracted:", JSON.stringify(test2.extractedLead, null, 2));

  // Test Case 3: Escalation to Human Agent
  const test3 = await processAiLeadRefinement("Can I speak to a real human agent please?", [], "instagram");
  console.log("\n[Test 3 - Human Escalation Request]:");
  console.log("Reply:", test3.replyText);
  console.log("Extracted:", JSON.stringify(test3.extractedLead, null, 2));

  console.log("\n=== Test Completed Successfully ===");
}

testOmnichannelLogic().catch(console.error);
