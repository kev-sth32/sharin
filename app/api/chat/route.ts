import { NextResponse } from "next/server";
import { getMergedTrips, getMergedDepartures, getMergedFAQs, getAISettings, getMergedPolicies } from "@/lib/public-store";
import { logConversation } from "@/lib/admin-store";
import { getAdminDataShared } from "@/lib/admin-store-shared";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

function isAdminAuthenticated(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  return cookie.includes("tripnaari_admin=authenticated");
}

function makeTextStream(text: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, role, context, tempSettings, conversationId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    // 1. Security Check for Admin role
    if (role === "admin" && !isAdminAuthenticated(req)) {
      return NextResponse.json({ error: "Unauthorized — Admin session required" }, { status: 401 });
    }

    const savedSettings = getAISettings();
    // Allow admin to override settings for testing/previewing
    const aiSettings = (role === "admin" && tempSettings) ? { ...savedSettings, ...tempSettings } : savedSettings;
    const apiKey = aiSettings.nvidiaApiKey || process.env.NVIDIA_API_KEY;

    const convId = conversationId || `conv_${Date.now()}`;
    const isCustomer = role === "customer";

    // 2. Fallback to Gemini or return error if API Key is missing/default
    const geminiKey = process.env.GEMINI_API_KEY;
    const hasNvidiaKey = apiKey && apiKey !== "your_key_here" && apiKey !== "re_xxxxxxxxxxxxxxxx";
    const hasGeminiKey = geminiKey && geminiKey !== "your_key_here" && geminiKey !== "re_xxxxxxxxxxxxxxxx";

    if (!hasNvidiaKey) {
      if (hasGeminiKey) {
        return handleGeminiResponse(messages, role, context, geminiKey, aiSettings, convId);
      }
      return makeTextStream("⚠️ **NaariAI Assistant:** API keys are not configured. Please set a valid Nvidia NIM API Key in the AI Settings dashboard, or add your `GEMINI_API_KEY` to the environment variables.");
    }

    // 3. Construct System Prompt based on user role (Admin vs Customer)
    // Note: The sandbox preview chat passes context.source = "sandbox_testing" to preview the customer chatbot persona
    let systemPrompt = "";
    if (role === "admin" && context?.source !== "sandbox_testing") {
      const adminData = await getAdminDataShared();
      systemPrompt = getAdminSystemPrompt(context, adminData);
    } else {
      systemPrompt = getCustomerSystemPrompt(aiSettings);
    }

    // 4. Map client message history to OpenAI/Nvidia compatible format
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => {
        let roleName = "user";
        if (m.role === "assistant" || m.role === "model" || m.role === "system") {
          roleName = "assistant";
        }
        return {
          role: roleName,
          content: m.content || ""
        };
      })
    ];

    // 5. Call Nvidia NIM API with streaming enabled (with 3.5s connection timeout)
    const apiUrl = `https://integrate.api.nvidia.com/v1/chat/completions`;
    
    let apiResponse;
    const abortCtrl = new AbortController();
    const timeoutId = setTimeout(() => abortCtrl.abort(), 6000);

    try {
      apiResponse = await fetch(apiUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: aiSettings.modelName || "meta/llama-3.1-70b-instruct",
          messages: formattedMessages,
          temperature: aiSettings.temperature !== undefined ? Number(aiSettings.temperature) : (role === "admin" ? 0.5 : 0.2),
          max_tokens: 1000,
          stream: true
        }),
        signal: abortCtrl.signal
      });
      clearTimeout(timeoutId);
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.error("Nvidia API connection failed or timed out:", e);
      
      const geminiKey = process.env.GEMINI_API_KEY;
      if (geminiKey && geminiKey !== "your_key_here" && geminiKey !== "re_xxxxxxxxxxxxxxxx") {
        console.warn("Attempting Gemini fallback...");
        try {
          return await handleGeminiResponse(messages, role, context, geminiKey, aiSettings, convId);
        } catch (geminiErr) {
          console.error("Gemini Fallback failed:", geminiErr);
        }
      }

      console.warn("Nvidia connection failed/timed-out and no Gemini fallback available.");
      return makeTextStream("⚠️ **NaariAI Assistant Connection Error:** Failed to connect to Nvidia NIM API (connection timed out or reset).");
    }

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      console.error("Nvidia API Error:", errorData);
      
      // Try fallback to Gemini if config exists
      const geminiKey = process.env.GEMINI_API_KEY;
      if (geminiKey && geminiKey !== "your_key_here" && geminiKey !== "re_xxxxxxxxxxxxxxxx") {
        console.warn("Attempting Gemini fallback...");
        try {
          return await handleGeminiResponse(messages, role, context, geminiKey, aiSettings, convId);
        } catch (geminiErr) {
          console.error("Gemini Fallback failed:", geminiErr);
        }
      }

      const errMsg = errorData.detail || errorData.message || "Unknown error";
      return makeTextStream(`⚠️ **NaariAI Assistant API Error:** Nvidia API returned an error: "${errMsg}".`);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Stream the responses back to the client token-by-token
    const stream = new ReadableStream({
      async start(controller) {
        if (!apiResponse.body) {
          controller.close();
          return;
        }

        const reader = apiResponse.body.getReader();
        let buffer = "";
        let fullResponseText = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const cleaned = line.trim();
              if (!cleaned) continue;
              if (cleaned === "data: [DONE]") continue;
              if (cleaned.startsWith("data: ")) {
                try {
                  const jsonStr = cleaned.slice(6);
                  const parsed = JSON.parse(jsonStr);
                  const content = parsed.choices?.[0]?.delta?.content || "";
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                    fullResponseText += content;
                  }
                } catch (e) {
                  // ignore malformed JSON lines
                }
              }
            }
          }

          // Flush remaining buffer
          if (buffer && buffer.startsWith("data: ")) {
            try {
              const jsonStr = buffer.slice(6).trim();
              if (jsonStr !== "[DONE]") {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  controller.enqueue(encoder.encode(content));
                  fullResponseText += content;
                }
              }
            } catch (e) {}
          }

          if (isCustomer) {
            await logConversation(convId, messages, fullResponseText, role, context);
          }
        } catch (error) {
          console.error("Error reading stream:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error: any) {
    console.error("API Route Chat Error:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}

// Fallback Google Gemini Handler (streams token-by-token using SSE)
async function handleGeminiResponse(messages: any[], role: string, context: any, geminiKey: string, aiSettings: any, conversationId: string) {
  let systemPrompt = "";
  if (role === "admin" && context?.source !== "sandbox_testing") {
    const adminData = await getAdminDataShared();
    systemPrompt = getAdminSystemPrompt(context, adminData);
  } else {
    systemPrompt = getCustomerSystemPrompt(aiSettings);
  }

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

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:streamGenerateContent?alt=sse&key=${geminiKey}`;
  
  let apiResponse;
  const abortCtrl = new AbortController();
  const timeoutId = setTimeout(() => abortCtrl.abort(), 10000); // 10s timeout!

  try {
    apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: formattedContents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: aiSettings.temperature !== undefined ? Number(aiSettings.temperature) : (role === "admin" ? 0.5 : 0.2),
          maxOutputTokens: 8192,
        }
      }),
      signal: abortCtrl.signal
    });
    clearTimeout(timeoutId);
  } catch (geminiErr: any) {
    clearTimeout(timeoutId);
    console.error("Gemini Fallback connection failed or timed out:", geminiErr);
    return makeTextStream("⚠️ **NaariAI Assistant Error:** Google Gemini fallback failed (connection timed out or error).");
  }

  if (!apiResponse.ok) {
    const errorData = await apiResponse.json().catch(() => ({}));
    console.error("Gemini Fallback API Error:", errorData);
    const errMsg = errorData.error?.message || "Unknown error";
    return makeTextStream(`⚠️ **NaariAI Assistant Error:** Google Gemini API returned an error: "${errMsg}".`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const isCustomer = role === "customer";

  const stream = new ReadableStream({
    async start(controller) {
      if (!apiResponse.body) {
        controller.close();
        return;
      }

      const reader = apiResponse.body.getReader();
      let buffer = "";
      let fullResponseText = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const cleaned = line.trim();
            if (!cleaned) continue;
            if (cleaned.startsWith("data: ")) {
              try {
                const jsonStr = cleaned.slice(6);
                const parsed = JSON.parse(jsonStr);
                const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (content) {
                  controller.enqueue(encoder.encode(content));
                  fullResponseText += content;
                }
              } catch (e) {
                // ignore malformed JSON lines
              }
            }
          }
        }

        // Flush remaining buffer
        if (buffer && buffer.startsWith("data: ")) {
          try {
            const jsonStr = buffer.slice(6).trim();
            const parsed = JSON.parse(jsonStr);
            const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
              fullResponseText += content;
            }
          } catch (e) {}
        }

        if (isCustomer) {
          await logConversation(conversationId, messages, fullResponseText, role, context);
        }
      } catch (error) {
        console.error("Error reading Gemini stream:", error);
        controller.error(error);
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}

// System Prompt for Public Customers
function getCustomerSystemPrompt(aiSettings: any) {
  const { systemInstruction, customKnowledge, personaTone, includeTrips, includeDepartures, includeFaqs, includePolicies, qaPairs } = aiSettings || {};

  let tripsContext = "";
  if (includeTrips !== false) {
    const activeTrips = getMergedTrips();
    tripsContext = "\n\n--- ACTIVE TRIP PACKAGES ---\n" + activeTrips.map((t: any) => (
      `- Trip: ${t.title}\n  Slug: ${t.slug}\n  Duration: ${t.durationDays} Days / ${t.durationNights} Nights\n  Price Starts: ₹${t.priceFrom}\n  Highlights: ${t.highlights?.join(", ") || ""}\n  Brief: ${t.shortDescription}\n  Safety Policy: ${t.itineraryChangePolicy || ""}`
    )).join("\n\n");
  }

  let departuresContext = "";
  if (includeDepartures !== false) {
    const departures = getMergedDepartures();
    departuresContext = "\n\n--- SCHEDULED DEPARTURES ---\n" + departures.map((d: any) => (
      `- Trip: ${d.tripSlug} (Start: ${d.startDate}, End: ${d.endDate}, Status: ${d.status}, Price: ₹${d.price || "N/A"})`
    )).join("\n");
  }

  let faqsContext = "";
  if (includeFaqs !== false) {
    const activeFaqs = getMergedFAQs();
    faqsContext = "\n\n--- FREQUENTLY ASKED QUESTIONS & SAFETY INFO ---\n" + activeFaqs.map((f: any) => (
      `Q: ${f.question}\nA: ${f.answer}`
    )).join("\n\n");
  }

  let policiesContext = "";
  if (includePolicies !== false) {
    const policies = getMergedPolicies();
    policiesContext = "\n\n--- SITE SAFETY & OPERATIONAL POLICIES ---\n" + policies.map((p: any) => (
      `Title: ${p.title} (v${p.version || "1.0"}, Updated: ${p.updated || "N/A"})\n${p.body}`
    )).join("\n\n");
  }

  // Persona templates
  let personaPrompt = `You are "NaariAI", the official women's safety & group travel assistant for TripNaari.
TripNaari is India's leading travel brand focusing on safe solo and group travel experiences for women, sisters, mothers, and daughters.`;

  if (personaTone === "professional") {
    personaPrompt += `\n\nTONE OF VOICE:\n- Maintain a highly professional, concise, direct, and factual tone.\n- Focus on clear information delivery without extra conversational filler.`;
  } else if (personaTone === "adventurous") {
    personaPrompt += `\n\nTONE OF VOICE:\n- Maintain an extremely energetic, adventurous, and enthusiastic tone.\n- Inspire excitement for exploring the outdoors, high-altitude treks, and making lifelong road trip memories.`;
  } else {
    // warm (default)
    personaPrompt += `\n\nTONE OF VOICE:\n- Be extremely warm, friendly, encouraging, and supportive.\n- Emphasize safety, sisterhood, and verified room lock audits.`;
  }

  const basePrompt = systemInstruction || `${personaPrompt}

YOUR INSTRUCTIONS:
1. ONLY answer questions using the provided TripNaari information listed below.
2. If a customer is asking to book a trip or wants a customized itinerary, encourage them to fill out our quick Enquiry/Booking Form. You can output "[SHOW_ENQUIRY_FORM]" at the end of your response to trigger the form interface inside the chat drawer.
3. If a user asks about topics completely unrelated to TripNaari (e.g. coding, cooking recipes, other travel operators, general news), politely state that you are only programmed to help with TripNaari trips and safety queries.
4. Do NOT hallucinate prices, dates, or destinations that are not in the context below.`;

  // Custom QA Pairs injection
  let qaContext = "";
  if (qaPairs && Array.isArray(qaPairs) && qaPairs.length > 0) {
    qaContext = "\n\n--- STRUCTURED TRAINING DATA (Q&A) ---\n" + qaPairs.map((p: any) => (
      `Q: ${p.question}\nA: ${p.answer}`
    )).join("\n\n");
  }

  const customKnowledgePrompt = customKnowledge ? `\n\n--- ADDITIONAL CUSTOM KNOWLEDGE & RULES ---\n${customKnowledge}` : "";

  const budgetAndMathInstructions = `\n\n--- BUDGET & MATH ACCURACY RULES (CRITICAL) ---
1. BUDGET DEFINITION: If a user specifies a budget of X for N people, the total cost for ALL travelers combined must be less than or equal to X. (e.g. ₹20,000 budget for 2 people means the maximum total cost is ₹20,000).
2. STEP-BY-STEP FILTERING:
   - For each active trip in our catalog, calculate the total cost: (Price per Person * N).
   - Compare the total cost with the user's budget X.
   - If (Price per Person * N) <= X, then the package is a MATCHING package.
   - If (Price per Person * N) > X, then the package is NOT a matching package.
3. OUTPUT RULES:
   - If there are any MATCHING packages, list them clearly as fitting options. Show the math calculation explicitly (e.g. "Tirthan & Jibhi Whispering Pines: ₹9,999 per person * 2 travelers = ₹19,998 total, which fits your budget").
   - If a package fits, do NOT state that "We do not have packages under ₹X". Recommend the matching packages directly.
   - If and only if absolutely ZERO packages fit, state: "We do not have any packages under ₹X for N people. The cheapest option available is..."`;

  const groundingInstructions = `\n\n--- GROUNDING & DESTINATION LIMITS (CRITICAL) ---
1. STRICT DATA LIMIT: You are ONLY allowed to recommend destinations and trip packages that are explicitly listed in the "ACTIVE TRIP PACKAGES" section below.
2. NO HALLUCINATIONS: Do NOT recommend any external cities, hill stations, beaches, or countries (such as Shimla, Manali, Mussoorie, Goa, Delhi, Nepal, Bhutan, Thailand, etc.) that are not in the active database.
3. BUDGET BOUNDARY: If a user specifies a budget and we have no packages within that budget, state: "We do not have packages fitting your budget of ₹X." Do NOT suggest external travel packages as alternatives.`;

  return `${basePrompt}
${budgetAndMathInstructions}
${groundingInstructions}
${tripsContext}
${departuresContext}
${faqsContext}
${policiesContext}
${qaContext}
${customKnowledgePrompt}`;
}

// System Prompt for CMS Admins
function getAdminSystemPrompt(context: any, adminData: any) {
  const pageInfo = context ? `Current CMS Page Path: ${context.pathname || "Dashboard"}\nActive Context: ${JSON.stringify(context)}` : "Dashboard";

  const stats = adminData?.stats || {};
  const leads = adminData?.leads || [];
  const departures = adminData?.departures || [];
  const transactions = adminData?.transactions || [];

  return `You are the TripNaari CMS AI Copilot. You assist the website administration team directly inside their secure control panel.
You have context-aware access to the active CMS database statistics, leads, scheduled departures, and financial transactions.

--- SYSTEM NAVIGATION COMMANDS (CRITICAL) ---
If the admin wants to open a page, view details, go somewhere, or search (e.g. "go to departures", "open finance", "show me leads", "navigate to blog creator", "show Kashmir departures"), append a navigation trigger tag at the very end of your message:
[NAVIGATE:/admin/relative-path]
Examples:
- Open departures page: [NAVIGATE:/admin/departures]
- Search departures for Kashmir: [NAVIGATE:/admin/departures?search=kashmir]
- Open finance tracker: [NAVIGATE:/admin/finance]
- Open CRM/leads board: [NAVIGATE:/admin/leads]
- Open blog manager: [NAVIGATE:/admin/blogs]
- Open AI settings: [NAVIGATE:/admin/ai-settings]

--- DATABASE WRITE COMMANDS (CRITICAL) ---
If the admin asks you to update a lead's status (e.g. "change Sharin's status to contacted" or "mark Priya as booked"), you MUST trigger the database write by appending an update tag in your response:
[UPDATE_LEAD_STATUS:id:new_status]
Get the correct numeric ID from the CRM leads list below.
Valid statuses must be exactly one of these lowercase strings: new, contacted, itinerary_shared, payment_pending, booked, lost, support_needed.
Do not format this tag with asterisks, bolding, or markdown. Output it exactly in brackets.
Example: [UPDATE_LEAD_STATUS:3:booked]

--- ON-SCREEN ACTION TRIGGERS (CRITICAL) ---
If the user asks you to send or draft a WhatsApp follow-up or Email to a lead, you must NOT pretend that you have sent it yourself (since you are a chat assistant and cannot execute browser redirections directly). Instead:
1. Draft the message body.
2. Inform the admin that they can send it by clicking the action button that will appear below your message card.
3. Append the correct target information tag:
   - For WhatsApp triggers: [WHATSAPP_TARGET:phone_number]
   - For Email triggers: [EMAIL_TARGET:email_address]
Example:
"I have drafted the follow-up message for Sharin. Click the WhatsApp button below to send it:
[WHATSAPP_TARGET:9861806115]"
Do not format these tags with asterisks or markdown. Output them exactly in brackets.

--- ACTIVE STATISTICS ---
- Total Leads: ${stats.leads || 0}
- Total Revenue: ₹${stats.totalRevenue || 0}
- Total Expenses: ₹${stats.totalExpenses || 0}
- Net Profit: ₹${stats.netProfit || 0}
- Testimonials: ${stats.testimonials || 0}
- Active Trips: ${stats.trips || 0}

--- ACTIVE CRM LEADS ---
${leads.map((l: any) => `- ID: ${l.id}, Name: ${l.name}, Email: ${l.email}, Phone: ${l.phone || "N/A"}, Destination: ${l.destination || "N/A"}, Budget: ${l.budget || "N/A"}, Status: ${l.status}, Created: ${l.createdAt}`).join("\n")}

--- ACTIVE DEPARTURES SCHEDULE ---
${departures.map((d: any) => `- Trip: ${d.tripSlug}, Dates: ${d.startDate} to ${d.endDate}, Seats Booked: ${d.seatsBooked}/${d.seatsTotal}, Price: ₹${d.price}, Status: ${d.status}`).join("\n")}

--- RECENT FINANCIAL TRANSACTIONS ---
${transactions.map((t: any) => `- Date: ${t.date}, Type: ${t.type}, Amount: ₹${t.amount}, Category: ${t.category}, Description: ${t.description || ""}`).join("\n")}

YOUR INSTRUCTIONS:
1. Help the admin team create content, draft replies, summarize logs, and analyze statistics.
2. Keep your answers concise, professional, and formatted in clean markdown.
3. If the user asks to write/draft a blog post or trip itinerary, format the fields in a structured JSON code block at the end (with keys like 'title', 'slug', 'category', 'excerpt', and 'content' for blogs) so the admin can click "Apply to Form" to populate inputs automatically.
4. Emphasize warm, professional, clear, and safety-oriented communication when drafting templates.
5. DRAFTING REPLIES/MESSAGES: When asked to draft a follow-up, reply, WhatsApp text, or email for a lead, output ONLY the drafted message content itself along with the required brackets target tag (e.g. [WHATSAPP_TARGET:phone] or [EMAIL_TARGET:email]). Do NOT output conversational introductions, descriptions, explanations, meta-text, or instructions on what button the admin should click. Keep the response limited strictly to the text that needs to be sent to the lead.
6. HANDLING SEND CONFIRMATIONS: If the admin tells you to "send message", "send it", "confirm", or similar, do NOT claim that you have sent it. Remind the admin to click the interactive action button (e.g. "WhatsApp Lead" or "Mail Lead") located directly under the drafted message bubble in the chat log, explaining that you do not have direct automated messaging capabilities.

--- CURRENT PAGE & CONTEXT ---
${pageInfo}`;
}


