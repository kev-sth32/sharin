import { NextResponse } from "next/server";
import { getMergedTrips, getMergedDepartures } from "@/lib/public-store";
import { faqsSeed } from "@/lib/data";

function isAdminAuthenticated(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  return cookie.includes("tripnaari_admin=authenticated");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, role, context } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    // 1. Security Check for Admin role
    if (role === "admin" && !isAdminAuthenticated(req)) {
      return NextResponse.json({ error: "Unauthorized — Admin session required" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. Demo Mode Fallback if API Key is missing or default
    if (!apiKey || apiKey === "your_key_here" || apiKey === "re_xxxxxxxxxxxxxxxx") {
      return handleDemoResponse(messages, role, context);
    }

    // 3. Construct System Prompt based on user role (Admin vs Customer)
    let systemPrompt = "";
    if (role === "admin") {
      systemPrompt = getAdminSystemPrompt(context);
    } else {
      systemPrompt = getCustomerSystemPrompt();
    }

    // 4. Map client message history to Gemini API format
    // Gemini roles: "user" | "model"
    const formattedContents = messages.map((m: any) => {
      let roleName = "user";
      if (m.role === "assistant" || m.role === "model" || m.role === "system") {
        roleName = "model";
      }
      return {
        role: roleName,
        parts: [{ text: m.content || "" }]
      };
    });

    // 5. Call Google Gemini API using native fetch (No SDK bloat)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: formattedContents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: role === "admin" ? 0.5 : 0.2, // Admin is more creative, customer is highly deterministic
          maxOutputTokens: 1000,
        }
      })
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      console.error("Gemini API Error:", errorData);
      return NextResponse.json({ 
        error: "Failed to communicate with AI API", 
        details: errorData 
      }, { status: apiResponse.status });
    }

    const responseData = await apiResponse.json();
    const replyText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I could not generate a response. Please try again.";

    return NextResponse.json({ reply: replyText });

  } catch (error: any) {
    console.error("API Route Chat Error:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}

// System Prompt for Public Customers
function getCustomerSystemPrompt() {
  const activeTrips = getMergedTrips();
  const departures = getMergedDepartures();

  const tripsContext = activeTrips.map((t: any) => (
    `- Trip: ${t.title}\n  Slug: ${t.slug}\n  Duration: ${t.durationDays} Days / ${t.durationNights} Nights\n  Price Starts: ₹${t.priceFrom}\n  Highlights: ${t.highlights?.join(", ") || ""}\n  Brief: ${t.shortDescription}\n  Safety Policy: ${t.itineraryChangePolicy || ""}`
  )).join("\n\n");

  const departuresContext = departures.map((d: any) => (
    `- Trip: ${d.tripSlug} (Start: ${d.startDate}, End: ${d.endDate}, Status: ${d.status}, Price: ₹${d.price || "N/A"})`
  )).join("\n");

  const faqsContext = faqsSeed.map((f: any) => (
    `Q: ${f.question}\nA: ${f.answer}`
  )).join("\n\n");

  return `You are "NaariAI", the official women's safety & group travel assistant for TripNaari.
TripNaari is India's leading travel brand focusing on safe solo and group travel experiences for women, sisters, mothers, and daughters.

YOUR INSTRUCTIONS:
1. ONLY answer questions using the provided TripNaari information (Trips, Departures, FAQs, Policies) listed below.
2. Be extremely warm, friendly, encouraging, and supportive. Emphasize women's safety, sisterhood, local women leaders, and verified safety audits.
3. If a customer is asking to book a trip or wants a customized itinerary, encourage them to fill out our quick Enquiry/Booking Form. You can output "[SHOW_ENQUIRY_FORM]" at the end of your response to trigger the form interface inside the chat drawer.
4. If a user asks about topics completely unrelated to TripNaari (e.g. coding, cooking recipes, other travel operators, general news), politely state that you are only programmed to help with TripNaari trips and safety queries.
5. Do NOT hallucinate prices, dates, or destinations that are not in the context below.

--- ACTIVE TRIP PACKAGES ---
${tripsContext}

--- SCHEDULED DEPARTURES ---
${departuresContext}

--- FREQUENTLY ASKED QUESTIONS & SAFETY INFO ---
${faqsContext}

--- CANCELLATION & REFUND POLICY ---
30+ days before: 90% refund, 15-29 days: 50% refund + 50% credit, 7-14 days: 30% refund + 50% credit, <7 days: No refund but 70% credit valid 1 year. Refunds processed in 7-10 working days. Credits are transferable.`;
}

// System Prompt for CMS Admins
function getAdminSystemPrompt(context: any) {
  const pageInfo = context ? `Current CMS Page Path: ${context.pathname || "Dashboard"}\nActive Context: ${JSON.stringify(context)}` : "Dashboard";

  return `You are the TripNaari CMS AI Copilot. You assist the website administration team directly inside their secure control panel.

YOUR INSTRUCTIONS:
1. Help the admin team create content, draft replies, summarize logs, and analyze statistics.
2. Keep your answers concise, professional, and formatted in clean markdown.
3. When the admin asks to write or draft content:
   - For blogs: draft SEO-friendly outlines, title ideas, and paragraph drafts.
   - For leads: draft helpful, friendly follow-up emails or WhatsApp messages. Use any provided lead context (name, phone, destination, budget, query) to make the text custom.
   - For finance: explain simple trends or suggest cost optimizations based on the context.
4. Emphasize warm, professional, clear, and safety-oriented communication when drafting templates.

--- CURRENT CONTEXT ---
${pageInfo}`;
}

// Demo Mode response when GEMINI_API_KEY is not defined
function handleDemoResponse(messages: any[], role: string, context: any) {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
  let response = "";

  if (role === "admin") {
    if (lastMessage.includes("whatsapp") || lastMessage.includes("lead") || lastMessage.includes("draft")) {
      response = `🤖 **TripNaari Admin Copilot [DEMO MODE]**\n\nHere is a template response for the lead:\n\n*"Hi ${context?.selectedLead?.name || "there"}, this is Anjali from TripNaari! 🌸 I saw you were looking into a trip to ${context?.selectedLead?.destination || "our destinations"} in ${context?.selectedLead?.travelMonth || "the coming months"}. I would love to share our women-only group itineraries and explain our safety standards. Let me know if we can chat for 5 mins!"*\n\n*(Note: Add GEMINI_API_KEY to your \`.env\` to connect this to real-time AI capabilities.)*`;
    } else if (lastMessage.includes("blog")) {
      response = `🤖 **TripNaari Admin Copilot [DEMO MODE]**\n\nHere are blog outline ideas for women-only travel:\n1. **Safety First:** Why we audit every hotel room lock.\n2. **The Sisterhood Effect:** Meeting lifelong friends on group trips.\n\n*(Note: Add GEMINI_API_KEY to your \`.env\` to connect this to real-time AI capabilities.)*`;
    } else {
      response = `🤖 **TripNaari Admin Copilot [DEMO MODE]**\n\nHello Admin! I am ready to help you draft blogs, answer questions, or formulate responses. Please add your \`GEMINI_API_KEY\` to your \`.env\` file to activate my fully functional version!`;
    }
  } else {
    // Customer responses
    if (lastMessage.includes("safety") || lastMessage.includes("safe")) {
      response = `🌸 **Hello from TripNaari!** Safety is our #1 priority. Every group departure has a verified woman trip leader, safety-audited hotels, background-verified drivers, and a 24/7 emergency support system. You are never alone!\n\n*(Note: Connect Gemini API via \`.env\` to enable smart custom responses.)*`;
    } else if (lastMessage.includes("kashmir") || lastMessage.includes("spiti") || lastMessage.includes("meghalaya") || lastMessage.includes("kerala")) {
      response = `🎒 We have wonderful women-only departures to Kashmir, Kerala, Meghalaya, and Rajasthan! Would you like me to show you the inquiry form to request a custom quote?\n\n[SHOW_ENQUIRY_FORM]`;
    } else if (lastMessage.includes("cancel") || lastMessage.includes("refund")) {
      response = `📜 Our cancellation policy is simple: Cancellations made 30+ days before departure receive a 90% refund. 15-29 days before receive a 50% refund and 50% travel credit. For support, please let us know!\n\n*(Note: Add GEMINI_API_KEY to your \`.env\` to activate live AI answers.)*`;
    } else {
      response = `👋 Hello! I am NaariAI, your TripNaari helper. I can tell you about our women-only group packages, safety standards, and departures. What destination are you interested in?\n\n*(Note: Add GEMINI_API_KEY to your \`.env\` to activate live AI answers.)*`;
    }
  }

  return NextResponse.json({ reply: response });
}
