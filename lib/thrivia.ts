/**
 * Thrivia Ingest Integration
 * Endpoint: https://api.thrivia.io/api/webforms/ingest
 * Documentation: Header X-Thrivia-Key: <THRIVIA_KEY>
 */

const THRIVIA_URL = "https://api.thrivia.io/api/webforms/ingest";

export interface ThriviaLeadPayload {
  page_url?: string;
  page_title?: string;
  fields: Record<string, any>;
}

export async function sendLeadToThrivia(payload: ThriviaLeadPayload): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.THRIVIA_KEY;
  if (!apiKey) {
    console.warn("[Thrivia] THRIVIA_KEY not set in env. Lead saved locally; Thrivia forwarding skipped.");
    return { success: false, error: "THRIVIA_KEY not configured" };
  }

  try {
    const res = await fetch(THRIVIA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Thrivia-Key": apiKey,
      },
      body: JSON.stringify({
        page_url: payload.page_url || "https://www.tripnaari.com",
        page_title: payload.page_title || "TripNaari Website",
        fields: payload.fields,
      }),
    });

    // Thrivia answers 202 when it has the lead.
    if (res.status === 202 || res.ok) {
      console.log(`[Thrivia ✓] Lead filed successfully in Thrivia (status: ${res.status})`);
      return { success: true };
    } else {
      const errText = await res.text().catch(() => "");
      console.error(`[Thrivia ✗] Failed with status ${res.status}: ${errText}`);
      return { success: false, error: `HTTP ${res.status}: ${errText}` };
    }
  } catch (err: any) {
    console.error("[Thrivia ✗] Network error posting to Thrivia:", err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}
