import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone/WhatsApp required").max(15),
  destination: z.string().min(1, "Select destination"),
  travelMonth: z.string().min(1, "Select month"),
  travelers: z.coerce.number().min(1).max(20).default(1),
  travelStyle: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().max(1000).optional(),
  consent: z.boolean().refine((v) => v === true, "Consent required"),
});

export const customTripSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  dates: z.string().min(1),
  groupType: z.string().min(1),
  comfortLevel: z.string().min(1),
  activities: z.array(z.string()).default([]),
  safetyNeeds: z.string().optional(),
  kidFriendly: z.boolean().default(false),
  foodPreferences: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  category: z.string().min(1),
  subject: z.string().min(3),
  message: z.string().min(10),
});

export const refundSchema = z.object({
  bookingId: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(10),
  reason: z.string().min(10),
  policyAcknowledged: z.boolean().refine((v) => v, "Must acknowledge policy"),
});

export const leadStatus = ["new", "contacted", "itinerary_shared", "payment_pending", "booked", "lost", "support_needed"] as const;
