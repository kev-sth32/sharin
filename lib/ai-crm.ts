/**
 * AI Omnichannel CRM & Lead Refinement Engine
 * Handles Instagram DM & WhatsApp Cloud API interaction, AI entity extraction,
 * lead scoring, and automated responses.
 */

export interface ExtractedLeadData {
  name?: string;
  email?: string;
  phone?: string;
  destination?: string;
  travelMonth?: string;
  travelers?: number;
  budget?: string;
  intentScore?: number; // 0 to 100
  shouldEscalate?: boolean;
  intentTag?: string;
}

export interface ChatMessageItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Parses user message using LLM or Smart Heuristic Engine to extract lead parameters
 * and generate a contextual response.
 */
/**
 * 5 Bot Flow State Machine
 * Returns a structured, scripted reply based on current flow step and intent.
 *
 * Flow 1: New Lead Welcome → Destination capture
 * Flow 2: Price/Cost Inquiry → Quote nudge
 * Flow 3: Human Escalation → Sales manager alert
 * Flow 4: Group Booking → Group discount unlock
 * Flow 5: Post-Trip Re-Engagement → Review + next trip seed
 */
export function getBotFlowReply(
  flowStep: number,
  intentTag: string,
  extracted: ExtractedLeadData,
  channel: 'instagram' | 'whatsapp',
  customerName?: string
): string | null {
  const name = customerName ? customerName.split(' ')[0] : null;
  const greeting = name ? `Hey ${name}!` : 'Hey!';

  // ─── FLOW 3: Human Escalation (highest priority — overrides all steps) ───
  if (
    intentTag === 'human_takeover_requested' ||
    intentTag === 'human_escalation'
  ) {
    if (!extracted.phone) {
      return `Of course! 👩‍💼 I'm connecting you with our senior travel specialist right now.\nCould you share your phone number and the best time to call you?`;
    }
    return `Perfect! Our travel specialist will call you at *${extracted.phone}* shortly.\nYou'll also receive a WhatsApp confirmation. 🌸`;
  }

  // ─── FLOW 4: Group Booking ───
  if (
    intentTag === 'group_inquiry' ||
    (extracted.travelers && extracted.travelers >= 3)
  ) {
    if (!extracted.destination) {
      return `Amazing!! Group trips with TripNaari are extra special 🎉\nFor ${extracted.travelers || 'your group'} travelers, you qualify for our *GROUP DISCOUNT* of ₹2,000 per person!\nWhich destination — Meghalaya, Coorg, Rajasthan, or something else?`;
    }
    return `${extracted.destination} for ${extracted.travelers || 'your group'} is going to be EPIC! 🌿\nGroup Price: *₹17,999/person* (₹2,000 group discount applied!)\n\nShall I send the full itinerary PDF?`;
  }

  // ─── FLOW 5: Post-Trip Re-Engagement ───
  if (intentTag === 'post_trip_winback') {
    return `${greeting} 🌸 We hope your trip was absolutely magical!\nWe'd love your review → https://tripnaari.com/feedback\n\nP.S. Our 2027 batch calendars are open now — where should we take you next? 🏔️`;
  }

  // ─── FLOW 2: Price/Cost Inquiry → Quote Nudge ───
  if (intentTag === 'pricing_inquiry') {
    if (!extracted.destination) {
      return `Our women-only packages start from *₹18,999* with 3★ stays, guided transfers & curated experiences! 🌸\nWhich destination is on your bucket list?`;
    }
    if (!extracted.travelers) {
      return `${extracted.destination} is one of our top picks! ✨\nTotal for solo: *₹${extracted.destination === 'Kashmir' ? '28,999' : '32,999'}*\nDeposit to lock your seat: *₹8,000*\n\nHow many travelers are you planning for?`;
    }
    return `Perfect! For *${extracted.travelers} traveler(s)* to ${extracted.destination}:\nTotal: ₹${(extracted.travelers * 28999).toLocaleString('en-IN')} | Deposit: ₹8,000\n\nShall I send the official quotation + booking link? Just say *YES*! 📋`;
  }

  // ─── FLOW 1: New Lead Welcome → Destination → Month → Phone (step-by-step) ───
  // Step 0 → 1: No destination yet
  if (!extracted.destination) {
    if (flowStep === 0) {
      return `${greeting} Welcome to *TripNaari* — India's #1 Women-Only Travel Brand! 🌸\n\nWhere are you dreaming of going? (Ladakh, Kashmir, Meghalaya, Kerala, Bali, Vietnam?)`;
    }
    return `${greeting} Which destination has your heart? ✨\nLadakh, Meghalaya, Kerala, Spiti, or something else?`;
  }

  // Step 1 → 2: Destination known, no travel month yet
  if (extracted.destination && !extracted.travelMonth) {
    return `*${extracted.destination}* is STUNNING! 🏔️ Our Women's Expedition is 7D/6N.\nWhich month works for you — July, August, or September?`;
  }

  // Step 2 → 3: Destination + month known, no phone yet
  if (extracted.destination && extracted.travelMonth && !extracted.phone) {
    return `Perfect! ${extracted.travelMonth} is one of our most popular batches 🔥\nTo send you the detailed itinerary & check availability, may I have your WhatsApp number?`;
  }

  // Step 3: Phone captured — warm handoff
  if (extracted.phone) {
    return `Thank you! I've noted your details 📋\nOur travel coordinator will send you the day-by-day itinerary for *${extracted.destination}* ${channel === 'whatsapp' ? 'here on WhatsApp' : 'via WhatsApp'} shortly! 🎒✈️`;
  }

  return null; // Let AI LLM handle anything unmatched
}

export async function processAiLeadRefinement(
  userMessage: string,
  history: ChatMessageItem[] = [],
  channel: 'instagram' | 'whatsapp' = 'instagram',
  flowStep: number = 0
): Promise<{ extractedLead: ExtractedLeadData; replyText: string; intent: string }> {
  // 1. Check if Nvidia NIM, Gemini, or OpenAI LLM API key is present
  if (process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== "your_key_here") {
    try {
      return await processWithNvidia(userMessage, history, channel);
    } catch (err) {
      console.error("[AI CRM Engine] Nvidia NIM call failed, trying Gemini fallback:", err);
    }
  }

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_key_here") {
    try {
      return await processWithGemini(userMessage, history, channel);
    } catch (err) {
      console.error("[AI CRM Engine] Gemini call failed, trying OpenAI/Smart Engine fallback:", err);
    }
  }

  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_key_here") {
    try {
      return await processWithOpenAI(userMessage, history, channel);
    } catch (err) {
      console.error("[AI CRM Engine] OpenAI call failed, falling back to smart rule engine:", err);
    }
  }

  // 2. Rule-based / Smart Heuristic fallback engine (Works 100% without external key)
  const smartResult = processWithSmartEngine(userMessage, history, channel);

  // Enrich reply with bot flow state machine if it produces a better scripted response
  const flowReply = getBotFlowReply(
    flowStep,
    smartResult.intent,
    smartResult.extractedLead,
    channel
  );

  return {
    ...smartResult,
    replyText: flowReply || smartResult.replyText
  };
}

/**
 * Nvidia NIM API Call for entity extraction + response generation
 */
async function processWithNvidia(
  userMessage: string,
  history: ChatMessageItem[],
  channel: 'instagram' | 'whatsapp'
): Promise<{ extractedLead: ExtractedLeadData; replyText: string; intent: string }> {
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const systemPrompt = `You are "Aanya", the AI Travel Advisor for TripNaari - India's premier women-first boutique travel agency.
Your goal is to be extremely warm, helpful, and naturally qualify prospective travelers by extracting details step-by-step:
1. Destination interest (e.g., Ladakh, Spiti, Meghalaya, Kerala, Bali, Vietnam)
2. Travel Month / Preferred Dates
3. Group Size (Number of travelers)
4. Budget per head
5. Phone / WhatsApp Number (so our travel experts can share exact PDF itineraries)

Keep your responses short (under 3 sentences), friendly, and conversational—ideal for ${channel === 'whatsapp' ? 'WhatsApp' : 'Instagram DMs'}.

Output MUST be valid JSON strictly matching:
{
  "extractedLead": {
    "name": string or null,
    "email": string or null,
    "phone": string or null,
    "destination": string or null,
    "travelMonth": string or null,
    "travelers": number or null,
    "budget": string or null,
    "intentScore": number (0-100),
    "shouldEscalate": boolean,
    "intentTag": string
  },
  "replyText": string
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6).map(h => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content
    })),
    { role: 'user', content: userMessage }
  ];

  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${nvidiaKey}`
    },
    body: JSON.stringify({
      model: "meta/llama-3.2-11b-vision-instruct",
      messages,
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!res.ok) {
    throw new Error(`Nvidia NIM responded with status ${res.status}`);
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content || "{}";

  // Clean JSON block if model outputs markdown fencing
  const jsonStr = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(jsonStr);

  return {
    extractedLead: parsed.extractedLead || {},
    replyText: parsed.replyText || "Hey there! Welcome to TripNaari! Where are you planning your next trip?",
    intent: parsed.extractedLead?.intentTag || "general_inquiry"
  };
}

/**
 * OpenAI API Call for dual-pass entity extraction + response generation
 */
async function processWithOpenAI(
  userMessage: string,
  history: ChatMessageItem[],
  channel: 'instagram' | 'whatsapp'
): Promise<{ extractedLead: ExtractedLeadData; replyText: string; intent: string }> {
  const systemPrompt = `You are "Aanya", the AI Travel Advisor for TripNaari - India's premier women-first boutique travel agency.
Your goal is to be extremely warm, helpful, and naturally qualify prospective travelers by extracting details step-by-step:
1. Destination interest (e.g., Ladakh, Spiti, Meghalaya, Kerala, Bali, Vietnam)
2. Travel Month / Preferred Dates
3. Group Size (Number of travelers)
4. Budget per head
5. Phone / WhatsApp Number (so our travel experts can share exact PDF itineraries)

Keep your responses short (under 3 sentences), friendly, and conversational—ideal for ${channel === 'whatsapp' ? 'WhatsApp' : 'Instagram DMs'}.

Output MUST be valid JSON with keys:
{
  "extractedLead": {
    "name": string or null,
    "email": string or null,
    "phone": string or null,
    "destination": string or null,
    "travelMonth": string or null,
    "travelers": number or null,
    "budget": string or null,
    "intentScore": number (0-100),
    "shouldEscalate": boolean,
    "intentTag": string
  },
  "replyText": string
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-8),
    { role: 'user', content: userMessage }
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7
    })
  });

  if (!res.ok) {
    throw new Error(`OpenAI responded with status ${res.status}`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return {
    extractedLead: parsed.extractedLead || {},
    replyText: parsed.replyText || "Hey there! We'd love to help you plan your next dream trip with TripNaari! Where are you looking to travel next?",
    intent: parsed.extractedLead?.intentTag || "general_inquiry"
  };
}

/**
 * Gemini API Call for dual-pass entity extraction + response generation
 */
async function processWithGemini(
  userMessage: string,
  history: ChatMessageItem[],
  channel: 'instagram' | 'whatsapp'
): Promise<{ extractedLead: ExtractedLeadData; replyText: string; intent: string }> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const systemPrompt = `You are "Aanya", the AI Travel Advisor for TripNaari - India's premier women-first boutique travel agency.
Your goal is to be extremely warm, helpful, and naturally qualify prospective travelers by extracting details step-by-step:
1. Destination interest (e.g., Ladakh, Spiti, Meghalaya, Kerala, Bali, Vietnam)
2. Travel Month / Preferred Dates
3. Group Size (Number of travelers)
4. Budget per head
5. Phone / WhatsApp Number (so our travel experts can share exact PDF itineraries)

Keep your responses short (under 3 sentences), friendly, and conversational—ideal for ${channel === 'whatsapp' ? 'WhatsApp' : 'Instagram DMs'}.

Output MUST be valid JSON with format:
{
  "extractedLead": {
    "name": string or null,
    "email": string or null,
    "phone": string or null,
    "destination": string or null,
    "travelMonth": string or null,
    "travelers": number or null,
    "budget": string or null,
    "intentScore": number (0-100),
    "shouldEscalate": boolean,
    "intentTag": string
  },
  "replyText": string
}`;

  const formattedContents = [
    ...history.slice(-6).map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    })),
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: formattedContents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    })
  });

  if (!res.ok) {
    throw new Error(`Gemini responded with status ${res.status}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const parsed = JSON.parse(rawText);

  return {
    extractedLead: parsed.extractedLead || {},
    replyText: parsed.replyText || "Hey there! Welcome to TripNaari! Where are you planning your next trip?",
    intent: parsed.extractedLead?.intentTag || "general_inquiry"
  };
}

/**
 * Smart Rule Engine fallback when no API key is provided
 */
function processWithSmartEngine(
  userMessage: string,
  history: ChatMessageItem[],
  channel: 'instagram' | 'whatsapp'
): { extractedLead: ExtractedLeadData; replyText: string; intent: string } {
  const text = userMessage.toLowerCase();
  const extracted: ExtractedLeadData = {
    intentScore: 40,
    shouldEscalate: false,
    intentTag: "general_inquiry"
  };

  // 1. Phone number extraction
  const phoneMatch = userMessage.match(/(?:\+?\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}|\b\d{10}\b/);
  if (phoneMatch) {
    extracted.phone = phoneMatch[0];
    extracted.intentScore = (extracted.intentScore || 40) + 30;
  }

  // 2. Email extraction
  const emailMatch = userMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    extracted.email = emailMatch[0];
    extracted.intentScore = (extracted.intentScore || 40) + 20;
  }

  // 3. Destination extraction
  const destinations = ["ladakh", "spiti", "meghalaya", "kerala", "bali", "vietnam", "kashmir", "rajasthan", "coorg", "manali", "himachal", "goa"];
  for (const dest of destinations) {
    if (text.includes(dest)) {
      extracted.destination = dest.charAt(0).toUpperCase() + dest.slice(1);
      extracted.intentScore = (extracted.intentScore || 40) + 15;
      break;
    }
  }

  // 4. Travel Month / Time
  const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec", "next month", "this weekend"];
  for (const m of months) {
    if (text.includes(m)) {
      extracted.travelMonth = m;
      break;
    }
  }

  // 5. Human escalation keywords → Flow 3
  const escalationKeywords = ["agent", "human", "call me", "talk to person", "complaint", "refund", "manager", "speak to"];
  if (escalationKeywords.some(kw => text.includes(kw))) {
    extracted.shouldEscalate = true;
    extracted.intentTag = "human_takeover_requested";
    return {
      extractedLead: extracted,
      replyText: "Of course! 👩‍💼 I'm connecting you with our senior travel specialist right now.\nCould you share your phone number and the best time to call you?",
      intent: "human_takeover_requested"
    };
  }

  // 6. Group booking keywords → Flow 4
  const groupKeywords = ["group", "friends", "family", "girls", "ladies", "we are", "4 people", "5 people", "6 people", "7 people", "8 people"];
  if (groupKeywords.some(kw => text.includes(kw))) {
    extracted.intentTag = "group_inquiry";
    const groupMatch = text.match(/(\d+)\s*(people|girls|friends|ladies|travelers|persons|women)/i);
    if (groupMatch) extracted.travelers = parseInt(groupMatch[1]);
  }

  // 7. Post-trip keywords → Flow 5
  const postTripKeywords = ["after my trip", "just returned", "trip was great", "review", "feedback", "completed", "how was"];
  if (postTripKeywords.some(kw => text.includes(kw))) {
    extracted.intentTag = "post_trip_winback";
  }

  // 8. Price/cost inquiry → Flow 2
  if (text.includes("price") || text.includes("cost") || text.includes("how much") || text.includes("rate") || text.includes("package")) {
    extracted.intentTag = "pricing_inquiry";
    extracted.intentScore = (extracted.intentScore || 40) + 15;
  }

  // Generate reply — let getBotFlowReply handle structured flows,
  // fall back to heuristic reply for anything unrecognized
  let replyText = "";
  if (extracted.phone) {
    replyText = `Thank you! I've noted your number (${extracted.phone}). Our coordinator will send the itinerary ${channel === 'whatsapp' ? 'here on WhatsApp' : 'via WhatsApp/Call'} shortly! 🎒✈️`;
  } else if (extracted.destination) {
    replyText = `Awesome! *${extracted.destination}* is one of our favourite destinations 🏔️✨ What month are you planning to travel?`;
  } else if (extracted.intentTag === "pricing_inquiry") {
    replyText = "Our women-only packages start from *₹18,999* with 3★ stays, guided transfers & curated experiences! Which destination is on your bucket list?";
  } else {
    replyText = `Hey there! Welcome to TripNaari! 🌸 Where are you planning your next trip — Ladakh, Meghalaya, Bali, or Kerala?`;
  }

  return {
    extractedLead: extracted,
    replyText,
    intent: extracted.intentTag || "lead_nurturing"
  };
}

/**
 * Sends Instagram DM via Meta Graph API
 */
export async function sendInstagramDm(igUserId: string, messageText: string): Promise<boolean> {
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageAccessToken) {
    console.log(`[Meta API Mock] Would send IG DM to ${igUserId}: "${messageText}"`);
    return true;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: igUserId },
        message: { text: messageText }
      })
    });
    return res.ok;
  } catch (err) {
    console.error("[Meta API Error] Failed to send Instagram DM:", err);
    return false;
  }
}

/**
 * Sends WhatsApp Cloud API message
 */
export async function sendWhatsAppMessage(
  phone: string,
  messageText: string,
  pdfUrl?: string
): Promise<boolean> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.log(`[WhatsApp API Mock] Would send WA to ${phone}: "${messageText}" ${pdfUrl ? `(Document: ${pdfUrl})` : ''}`);
    return true;
  }

  try {
    // If PDF is supplied, send document message
    if (pdfUrl) {
      await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "document",
          document: {
            link: pdfUrl,
            caption: messageText,
            filename: "TripNaari_Itinerary.pdf"
          }
        })
      });
      return true;
    }

    // Standard text message
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: { body: messageText }
      })
    });
    return res.ok;
  } catch (err) {
    console.error("[WhatsApp API Error] Failed to send WhatsApp message:", err);
    return false;
  }
}

export interface WhatsAppButtonOption {
  id: string;
  title: string;
}

/**
 * Sends Interactive Quick-Reply Buttons via WhatsApp Business API
 */
export async function sendWhatsAppInteractiveButtons(
  phone: string,
  bodyText: string,
  buttons: WhatsAppButtonOption[]
): Promise<boolean> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.log(`[WhatsApp API Mock - Buttons] Would send interactive buttons to ${phone}: "${bodyText}" [Buttons: ${buttons.map(b=>b.title).join(", ")}]`);
    return true;
  }

  try {
    const formattedButtons = buttons.slice(0, 3).map(b => ({
      type: "reply",
      reply: {
        id: b.id,
        title: b.title.slice(0, 20)
      }
    }));

    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: bodyText },
          action: { buttons: formattedButtons }
        }
      })
    });

    return res.ok;
  } catch (err) {
    console.error("[WhatsApp Interactive Error] Failed to send buttons:", err);
    return false;
  }
}

