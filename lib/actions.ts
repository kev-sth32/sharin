"use server";

import { enquirySchema, customTripSchema, newsletterSchema, contactSchema, refundSchema } from "./validations";
import fs from "fs";
import path from "path";
import { sendLeadToThrivia } from "./thrivia";

// ─── Email via Resend ────────────────────────────────────────────────────────
let _resend: any = null;
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) {
    // Lazy-load so build doesn't fail if resend isn't installed yet
    const { Resend } = require("resend");
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = "TripNaari <notifications@tripnaari.com>";
const BRAND_PINK = "#FF4A7D";
const BRAND_DARK = "#13253D";
const BRAND_BG   = "#FFF8F0";

/** Shared branded HTML wrapper */
function emailWrapper(title: string, badge: string, badgeColor: string, bodyHtml: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:${BRAND_BG};font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #F1D9D0">
  <!-- Header -->
  <tr><td style="background:${BRAND_DARK};padding:28px 32px">
    <div style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.3px">🏔️ TripNaari</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:4px">tripnaari.com</div>
  </td></tr>
  <!-- Badge -->
  <tr><td style="padding:24px 32px 8px">
    <span style="display:inline-block;padding:5px 14px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;background:${badgeColor}22;color:${badgeColor}">${badge}</span>
    <h1 style="margin:12px 0 0;font-size:22px;font-weight:800;color:${BRAND_DARK}">${title}</h1>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:16px 32px 32px">${bodyHtml}</td></tr>
  <!-- Footer -->
  <tr><td style="background:${BRAND_BG};padding:20px 32px;border-top:1px solid #F1D9D0;font-size:12px;color:#888">
    This is an automated notification from your TripNaari website. Do not reply to this email.
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

/** Render a labeled data row */
function row(label: string, value: string | undefined | null) {
  if (!value) return "";
  return `<tr>
    <td style="padding:6px 12px 6px 0;font-size:12px;font-weight:700;color:#888;white-space:nowrap;vertical-align:top">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:${BRAND_DARK};font-weight:500">${value}</td>
  </tr>`;
}

/** Build HTML table of data rows */
function dataTable(rows: string) {
  return `<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #F1D9D0;border-radius:12px;overflow:hidden;margin-top:16px">
    <tbody>${rows}</tbody>
  </table>`;
}

// ─── Email template builders ─────────────────────────────────────────────────

function buildContactEmail(data: any) {
  const badge = data.category?.toUpperCase().replace("_", " ") || "CONTACT";
  const rows = [
    row("Name", data.name),
    row("Email", data.email),
    row("Phone", data.phone || "—"),
    row("Category", data.category),
    row("Subject", data.subject),
    row("Message", data.message),
  ].join("");
  const body = `<p style="color:#555;font-size:14px;margin:0 0 4px">A visitor submitted the <strong>Contact &amp; Support</strong> form.</p>${dataTable(rows)}`;
  return emailWrapper("New Contact Submission", badge, BRAND_PINK, body);
}

function buildRefundEmail(data: any) {
  const rows = [
    row("Booking ID", data.bookingId || "Not provided"),
    row("Email", data.email),
    row("Phone", data.phone),
    row("Reason", data.reason),
    row("Policy Ack.", data.policyAcknowledged ? "Yes — confirmed" : "No"),
  ].join("");
  const body = `<p style="color:#555;font-size:14px;margin:0 0 4px">⚠️ A customer has requested a <strong>refund or cancellation</strong>. Please review within 24 hours.</p>${dataTable(rows)}`;
  return emailWrapper("Refund Request", "REFUND", "#800F2D", body);
}

function buildEnquiryEmail(data: any) {
  const rows = [
    row("Name", data.name),
    row("Email", data.email),
    row("Phone", data.phone),
    row("Destination", data.destination),
    row("Travel Month", data.travelMonth),
    row("Travelers", String(data.travelers)),
    row("Budget", data.budget),
    row("Message", data.message),
  ].join("");
  const body = `<p style="color:#555;font-size:14px;margin:0 0 4px">🌄 A new trip enquiry has been submitted from your website.</p>${dataTable(rows)}`;
  return emailWrapper("New Trip Enquiry", "LEAD", BRAND_PINK, body);
}

function buildCustomTripEmail(data: any) {
  const rows = [
    row("Name", data.name),
    row("Email", data.email),
    row("Phone", data.phone),
    row("Interests", Array.isArray(data.interests) ? data.interests.join(", ") : data.interests),
    row("Dates", data.dates),
    row("Group Type", data.groupType),
    row("Comfort Level", data.comfortLevel),
    row("Budget", data.budget),
    row("Message", data.message),
  ].join("");
  const body = `<p style="color:#555;font-size:14px;margin:0 0 4px">✨ Someone wants a <strong>custom trip</strong> built for them.</p>${dataTable(rows)}`;
  return emailWrapper("Custom Trip Request", "CUSTOM", "#7C3AED", body);
}

function buildUnlockEmail(data: any) {
  const rows = [
    row("Name", data.name),
    row("Email", data.email),
    row("Phone", data.phone),
    row("Trip Viewed", data.destination),
  ].join("");
  const body = `<p style="color:#555;font-size:14px;margin:0 0 4px">🔓 A user unlocked gated trip details.</p>${dataTable(rows)}`;
  return emailWrapper("Trip Details Unlock", "GATE", "#059669", body);
}

/**
 * Sends a branded notification email via Resend.
 * Falls back to console.log if RESEND_API_KEY is not set (safe for local dev).
 */
async function sendNotificationEmail(
  type: "contact" | "refund" | "enquiry" | "custom_trip" | "unlock",
  data: any
) {
  const resend = getResend();
  if (!resend) {
    console.log(`[TripNaari Email - NO RESEND KEY] ${type}`, JSON.stringify(data).slice(0, 500));
    return;
  }

  const to = process.env.NOTIFICATION_EMAIL || "hello@tripnaari.com";

  const subjects: Record<string, string> = {
    contact:     `[TripNaari] New Contact: ${data.subject || data.category || "Support"}`,
    refund:      `[TripNaari] ⚠️ Refund Request — ${data.email}`,
    enquiry:     `[TripNaari] New Lead: ${data.name} → ${data.destination || "General"}`,
    custom_trip: `[TripNaari] Custom Trip Request — ${data.name}`,
    unlock:      `[TripNaari] 🔓 Trip Unlock — ${data.name} (${data.destination})`,
  };

  const htmlBuilders: Record<string, (d: any) => string> = {
    contact:     buildContactEmail,
    refund:      buildRefundEmail,
    enquiry:     buildEnquiryEmail,
    custom_trip: buildCustomTripEmail,
    unlock:      buildUnlockEmail,
  };

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: subjects[type],
      html: htmlBuilders[type](data),
    });
    console.log(`[Resend ✓] ${subjects[type]}`);
  } catch (err: any) {
    console.error(`[Resend ✗] ${type}:`, err?.message || err);
  }
}

// ─── File-based persistence ──────────────────────────────────────────────────
const dataDir = path.join(process.cwd(), ".data");
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function appendJson(file: string, entry: any) {
  ensureDataDir();
  const fp = path.join(dataDir, file);
  let arr: any[] = [];
  if (fs.existsSync(fp)) {
    try { arr = JSON.parse(fs.readFileSync(fp, "utf-8")); } catch {}
  }
  arr.push({ id: Date.now(), createdAt: new Date().toISOString(), ...entry });
  fs.writeFileSync(fp, JSON.stringify(arr, null, 2));
  return entry;
}

export async function submitEnquiry(formData: FormData) {
  // Honeypot: bot submission prevention
  if (formData.get("website_url")) {
    return { success: true, id: Date.now() };
  }

  const date = formData.get("date") as string;
  let message = formData.get("message") as string || "";
  if (date) {
    message = `[Requested departure: ${date}] ${message}`.trim();
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    destination: (formData.get("destination") as string) || "General",
    travelMonth: (formData.get("travelMonth") as string) || "Flexible",
    travelers: formData.get("travelers") ? Number(formData.get("travelers")) : 1,
    travelStyle: (formData.get("travelStyle") as string) || undefined,
    budget: (formData.get("budget") as string) || undefined,
    message,
    consent: formData.get("consent") === "on" || formData.get("consent") === "true",
  };

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten() };
  }

  const lead = appendJson("leads.json", { ...parsed.data, source: "trip_enquiry", status: "new" });
  await sendNotificationEmail("enquiry", parsed.data);

  const pageUrl = (formData.get("page_url") as string) || "https://www.tripnaari.com/destinations";
  const pageTitle = (formData.get("page_title") as string) || `Enquiry - ${parsed.data.destination || "General"}`;

  await sendLeadToThrivia({
    page_url: pageUrl,
    page_title: pageTitle,
    fields: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      trip: parsed.data.destination,
      destination: parsed.data.destination,
      travelMonth: parsed.data.travelMonth,
      travelers: parsed.data.travelers,
      budget: parsed.data.budget,
      travelStyle: parsed.data.travelStyle,
      message: parsed.data.message,
    },
  });

  // TODO: Insert via Drizzle if DATABASE_URL
  // const db = dbInstance(); if (!db._isMock) await db.insert(schema.leads).values(...)

  return { success: true, id: lead.id };
}

export async function submitCustomTrip(formData: FormData) {
  // Honeypot: bot submission prevention
  if (formData.get("website_url")) {
    return { success: true };
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    interests: (formData.getAll("interests") as string[]) || [],
    dates: formData.get("dates") as string,
    groupType: formData.get("groupType") as string,
    comfortLevel: formData.get("comfortLevel") as string,
    activities: (formData.getAll("activities") as string[]) || [],
    safetyNeeds: (formData.get("safetyNeeds") as string) || undefined,
    kidFriendly: formData.get("kidFriendly") === "on",
    foodPreferences: (formData.get("foodPreferences") as string) || undefined,
    budget: (formData.get("budget") as string) || undefined,
    message: (formData.get("message") as string) || undefined,
  };

  const parsed = customTripSchema.safeParse(raw);
  if (!parsed.success) return { success: false, errors: parsed.error.flatten() };

  appendJson("custom_trips.json", parsed.data);
  await sendNotificationEmail("custom_trip", parsed.data);

  const pageUrl = (formData.get("page_url") as string) || "https://www.tripnaari.com/custom-trip";
  const pageTitle = (formData.get("page_title") as string) || "Custom Trip Request";

  await sendLeadToThrivia({
    page_url: pageUrl,
    page_title: pageTitle,
    fields: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      trip: "Custom Trip",
      dates: parsed.data.dates,
      groupType: parsed.data.groupType,
      comfortLevel: parsed.data.comfortLevel,
      budget: parsed.data.budget,
      message: parsed.data.message,
      interests: Array.isArray(parsed.data.interests) ? parsed.data.interests.join(", ") : parsed.data.interests,
      activities: Array.isArray(parsed.data.activities) ? parsed.data.activities.join(", ") : parsed.data.activities,
    },
  });
  return { success: true };
}

export async function submitNewsletter(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    name: (formData.get("name") as string) || undefined,
  };
  const parsed = newsletterSchema.safeParse(raw);
  if (!parsed.success) return { success: false, errors: parsed.error.flatten() };

  appendJson("newsletter.json", parsed.data);
  return { success: true };
}

export async function submitContact(formData: FormData) {
  // Honeypot: bot submission prevention
  if (formData.get("website_url")) {
    return { success: true };
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    category: formData.get("category") as string,
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
  };
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return { success: false, errors: parsed.error.flatten() };

  appendJson("contacts.json", parsed.data);
  await sendNotificationEmail("contact", parsed.data);

  const pageUrl = (formData.get("page_url") as string) || "https://www.tripnaari.com/contact";
  const pageTitle = (formData.get("page_title") as string) || `Contact - ${parsed.data.subject || parsed.data.category}`;

  await sendLeadToThrivia({
    page_url: pageUrl,
    page_title: pageTitle,
    fields: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      category: parsed.data.category,
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
  });
  return { success: true };
}

export async function submitRefund(formData: FormData) {
  const raw = {
    bookingId: (formData.get("bookingId") as string) || undefined,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    reason: formData.get("reason") as string,
    policyAcknowledged: formData.get("policyAcknowledged") === "on",
  };
  const parsed = refundSchema.safeParse(raw);
  if (!parsed.success) return { success: false, errors: parsed.error.flatten() };

  appendJson("refunds.json", parsed.data);
  await sendNotificationEmail("refund", parsed.data);
  return { success: true };
}

export async function getLeads() {
  // In real app fetch from DB; here read file
  try {
    const fp = path.join(process.cwd(), ".data", "leads.json");
    if (!fs.existsSync(fp)) return [];
    return JSON.parse(fs.readFileSync(fp, "utf-8")).reverse();
  } catch { return []; }
}

export async function updateLeadStatus(id: number, status: string, notes?: string) {
  ensureDataDir();
  const fp = path.join(dataDir, "leads.json");
  if (!fs.existsSync(fp)) return { success: false };
  let arr = JSON.parse(fs.readFileSync(fp, "utf-8"));
  arr = arr.map((l: any) => l.id === id ? { ...l, status, notes, updatedAt: new Date().toISOString() } : l);
  fs.writeFileSync(fp, JSON.stringify(arr, null, 2));
  return { success: true };
}

export async function unlockTripDetails(formData: FormData) {
  // Honeypot: bot submission prevention
  if (formData.get("website_url")) {
    return { success: true };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const destination = formData.get("destination") as string || "General Trip View";

  if (!name || !email || !phone) {
    return { success: false, error: "All fields are required." };
  }

  const leadEntry = {
    name,
    email,
    phone,
    destination,
    travelMonth: "immediate",
    travelers: "1",
    travelStyle: "group",
    budget: "standard",
    message: "[Gated unlock: Checked trip details & hotels]",
    consent: true,
    source: "trip_details_gate",
    status: "new"
  };

  appendJson("leads.json", leadEntry);
  await sendNotificationEmail("unlock", leadEntry);

  const pageUrl = (formData.get("page_url") as string) || "https://www.tripnaari.com/destinations";
  const pageTitle = (formData.get("page_title") as string) || `Unlocked Trip: ${destination}`;

  await sendLeadToThrivia({
    page_url: pageUrl,
    page_title: pageTitle,
    fields: {
      name,
      email,
      phone,
      trip: destination,
      destination,
      source: "trip_details_gate",
    },
  });

  return { success: true };
}

export async function updateSupportStatus(id: number, status: "unread" | "resolved", notes?: string) {
  ensureDataDir();
  const fp = path.join(dataDir, "contacts.json");
  if (!fs.existsSync(fp)) return { success: false, error: "File not found" };
  try {
    let arr = JSON.parse(fs.readFileSync(fp, "utf-8"));
    arr = arr.map((c: any) => c.id === id ? { ...c, status, notes, updatedAt: new Date().toISOString() } : c);
    fs.writeFileSync(fp, JSON.stringify(arr, null, 2));
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteSupportMessage(id: number) {
  ensureDataDir();
  const fp = path.join(dataDir, "contacts.json");
  if (!fs.existsSync(fp)) return { success: false, error: "File not found" };
  try {
    let arr = JSON.parse(fs.readFileSync(fp, "utf-8"));
    arr = arr.filter((c: any) => c.id !== id);
    fs.writeFileSync(fp, JSON.stringify(arr, null, 2));
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateRefundStatus(id: number, status: "pending" | "approved" | "rejected", notes?: string) {
  ensureDataDir();
  const fp = path.join(dataDir, "refunds.json");
  if (!fs.existsSync(fp)) return { success: false, error: "File not found" };
  try {
    let arr = JSON.parse(fs.readFileSync(fp, "utf-8"));
    arr = arr.map((r: any) => r.id === id ? { ...r, status, notes, updatedAt: new Date().toISOString() } : r);
    fs.writeFileSync(fp, JSON.stringify(arr, null, 2));
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteRefundRequest(id: number) {
  ensureDataDir();
  const fp = path.join(dataDir, "refunds.json");
  if (!fs.existsSync(fp)) return { success: false, error: "File not found" };
  try {
    let arr = JSON.parse(fs.readFileSync(fp, "utf-8"));
    arr = arr.filter((r: any) => r.id !== id);
    fs.writeFileSync(fp, JSON.stringify(arr, null, 2));
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteNewsletterSubscriber(id: number) {
  ensureDataDir();
  const fp = path.join(dataDir, "newsletter.json");
  if (!fs.existsSync(fp)) return { success: false, error: "File not found" };
  try {
    let arr = JSON.parse(fs.readFileSync(fp, "utf-8"));
    arr = arr.filter((n: any) => n.id !== id);
    fs.writeFileSync(fp, JSON.stringify(arr, null, 2));
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

