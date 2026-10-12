// app/api/thrivia-lead/route.ts
// Receives your enquiry form and forwards it to Thrivia. The key is read from
// THRIVIA_KEY on the server, so it never reaches the visitor's browser.
import { NextResponse } from "next/server";
import { sendLeadToThrivia } from "@/lib/thrivia";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // Not valid JSON.
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  // Honeypot: people never fill the hidden website_url field, bots do.
  if (data.website_url) {
    return NextResponse.json({ ok: true });
  }

  const pageUrl =
    typeof data.page_url === "string" && data.page_url
      ? data.page_url
      : request.headers.get("referer") ?? "https://www.tripnaari.com";

  const pageTitle = typeof data.page_title === "string" ? data.page_title : undefined;

  // Everything else the visitor typed.
  const fields = { ...data };
  delete fields.website_url;
  delete fields.page_url;
  delete fields.page_title;

  const result = await sendLeadToThrivia({
    page_url: pageUrl,
    page_title: pageTitle,
    fields,
  });

  if (result.success) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
}
