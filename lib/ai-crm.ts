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
export async function processAiLeadRefinement(
  userMessage: string,
  history: ChatMessageItem[] = [],
  channel: 'instagram' | 'whatsapp' = 'instagram'
): Promise<{ extractedLead: ExtractedLeadData; replyText: string; intent: string }> {
  // 1. Check if LLM API key is present
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  if (apiKey && process.env.OPENAI_API_KEY) {
    try {
      return await processWithOpenAI(userMessage, history, channel);
    } catch (err) {
      console.error("[AI CRM Engine] OpenAI call failed, falling back to smart rule engine:", err);
    }
  }

  // 2. Rule-based / Smart Heuristic fallback engine (Works 100% out of the box without external key)
  return processWithSmartEngine(userMessage, history, channel);
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

  // 5. Human escalation keywords
  const escalationKeywords = ["agent", "human", "call me", "talk to person", "complaint", "refund", "manager"];
  if (escalationKeywords.some(kw => text.includes(kw))) {
    extracted.shouldEscalate = true;
    extracted.intentTag = "human_takeover_requested";
    return {
      extractedLead: extracted,
      replyText: "I've alerted our senior travel specialists! One of our human team members will respond to you here shortly. 👩‍💼✨",
      intent: "human_takeover_requested"
    };
  }

  // Generate friendly reply based on extracted state
  let replyText = "";
  if (extracted.phone) {
    replyText = `Thank you! I've noted your phone number (${extracted.phone}). Our travel coordinator will share the detailed itinerary and trip breakdown with you directly ${channel === 'whatsapp' ? 'here on WhatsApp' : 'via WhatsApp/Call'}! 🎒✈️`;
  } else if (extracted.destination) {
    replyText = `Awesome! ${extracted.destination} is one of our absolute favorite trips at TripNaari! 🏔️✨ What month are you planning to visit, and could you share your phone number so I can send the day-by-day itinerary?`;
  } else if (text.includes("price") || text.includes("cost") || text.includes("package")) {
    replyText = "Our women-only packages start from ₹18,999 with 3★ stays, guided transfers, and curated experiences! Which destination is on your bucket list?";
    extracted.intentTag = "pricing_inquiry";
  } else {
    replyText = `Hey there! Welcome to TripNaari! 🌸 Where are you planning your next trip (e.g. Ladakh, Meghalaya, Bali, Kerala)?`;
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
