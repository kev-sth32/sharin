"use server";

import { enquirySchema, customTripSchema, newsletterSchema, contactSchema, refundSchema } from "./validations";
import fs from "fs";
import path from "path";

// Simple file-based persistence when no DB_URL - production would use Drizzle
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

// Simulated email sending - logs and would integrate with Resend/Nodemailer
async function sendNotificationEmail(type: string, data: any) {
  console.log(`[TripNaari Email] ${type}`, JSON.stringify(data).slice(0, 500));
  // In prod: await resend.emails.send({ from, to: process.env.NOTIFICATION_EMAIL, subject, html })
  return true;
}

export async function submitEnquiry(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    destination: formData.get("destination") as string,
    travelMonth: formData.get("travelMonth") as string,
    travelers: formData.get("travelers") as string,
    travelStyle: formData.get("travelStyle") as string,
    budget: formData.get("budget") as string,
    message: formData.get("message") as string,
    consent: formData.get("consent") === "on" || formData.get("consent") === "true",
  };

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten() };
  }

  const lead = appendJson("leads.json", { ...parsed.data, source: "trip_enquiry", status: "new" });
  await sendNotificationEmail("New Trip Enquiry", parsed.data);

  // TODO: Insert via Drizzle if DATABASE_URL
  // const db = dbInstance(); if (!db._isMock) await db.insert(schema.leads).values(...)

  return { success: true, id: lead.id };
}

export async function submitCustomTrip(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    interests: (formData.getAll("interests") as string[]) || [],
    dates: formData.get("dates") as string,
    groupType: formData.get("groupType") as string,
    comfortLevel: formData.get("comfortLevel") as string,
    activities: (formData.getAll("activities") as string[]) || [],
    safetyNeeds: formData.get("safetyNeeds") as string,
    kidFriendly: formData.get("kidFriendly") === "on",
    foodPreferences: formData.get("foodPreferences") as string,
    budget: formData.get("budget") as string,
    message: formData.get("message") as string,
  };

  const parsed = customTripSchema.safeParse(raw);
  if (!parsed.success) return { success: false, errors: parsed.error.flatten() };

  appendJson("custom_trips.json", parsed.data);
  await sendNotificationEmail("Custom Trip Request", parsed.data);
  return { success: true };
}

export async function submitNewsletter(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    name: formData.get("name") as string,
  };
  const parsed = newsletterSchema.safeParse(raw);
  if (!parsed.success) return { success: false, errors: parsed.error.flatten() };

  appendJson("newsletter.json", parsed.data);
  return { success: true };
}

export async function submitContact(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    category: formData.get("category") as string,
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
  };
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return { success: false, errors: parsed.error.flatten() };

  appendJson("contacts.json", parsed.data);
  await sendNotificationEmail("Contact Form", parsed.data);
  return { success: true };
}

export async function submitRefund(formData: FormData) {
  const raw = {
    bookingId: formData.get("bookingId") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    reason: formData.get("reason") as string,
    policyAcknowledged: formData.get("policyAcknowledged") === "on",
  };
  const parsed = refundSchema.safeParse(raw);
  if (!parsed.success) return { success: false, errors: parsed.error.flatten() };

  appendJson("refunds.json", parsed.data);
  await sendNotificationEmail("Refund Request", parsed.data);
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
