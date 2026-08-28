// TripNaari Drizzle ORM Schema - PostgreSQL
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  json,
  numeric,
  varchar,
  serial,
} from "drizzle-orm/pg-core";

export const tripPackages = pgTable("trip_packages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 150 }).unique().notNull(),
  destinationSlug: varchar("destination_slug", { length: 100 }),
  title: varchar("title", { length: 255 }).notNull(),
  shortDescription: varchar("short_description", { length: 500 }),
  longDescription: text("long_description"),
  durationDays: integer("duration_days").notNull(),
  durationNights: integer("duration_nights").notNull(),
  priceFrom: integer("price_from").notNull(), // in INR
  priceOriginal: integer("price_original"),
  groupSizeMin: integer("group_size_min").default(8),
  groupSizeMax: integer("group_size_max").default(16),
  difficulty: varchar("difficulty", { length: 50 }), // easy, moderate, challenging
  comfortLevel: varchar("comfort_level", { length: 50 }), // backpacker, comfort, premium
  isWomenOnly: boolean("is_women_only").default(true),
  isFamilyFriendly: boolean("is_family_friendly").default(false),
  isFeatured: boolean("is_featured").default(false),
  heroImage: text("hero_image"),
  gallery: json("gallery").$type<string[]>().default([]),
  highlights: json("highlights").$type<string[]>().default([]),
  ratingAvg: numeric("rating_avg", { precision: 3, scale: 2 }).default("4.9"),
  ratingCount: integer("rating_count").default(127),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  itineraryChangePolicy: text("itinerary_change_policy"),
  itineraryPdf: text("itinerary_pdf"),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const departureDates = pgTable("departure_dates", {
  id: serial("id").primaryKey(),
  tripPackageId: integer("trip_package_id")
    .references(() => tripPackages.id)
    .notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  seatsTotal: integer("seats_total").default(16),
  seatsBooked: integer("seats_booked").default(0),
  price: integer("price"),
  status: varchar("status", { length: 30 }).default("open"), // open, filling_fast, sold_out, cancelled
  isGuaranteed: boolean("is_guaranteed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dayItineraries = pgTable("day_itineraries", {
  id: serial("id").primaryKey(),
  tripPackageId: integer("trip_package_id")
    .references(() => tripPackages.id)
    .notNull(),
  dayNumber: integer("day_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  location: varchar("location", { length: 150 }),
  mealsIncluded: json("meals_included").$type<string[]>().default([]),
  activities: json("activities").$type<string[]>().default([]),
  accommodation: varchar("accommodation", { length: 255 }),
  travelNotes: text("travel_notes"),
  image: text("image"),
});

export const inclusions = pgTable("inclusions", {
  id: serial("id").primaryKey(),
  tripPackageId: integer("trip_package_id")
    .references(() => tripPackages.id)
    .notNull(),
  text: varchar("text", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }), // stay, meal, transport, activity, guide
  icon: varchar("icon", { length: 50 }),
});

export const exclusions = pgTable("exclusions", {
  id: serial("id").primaryKey(),
  tripPackageId: integer("trip_package_id")
    .references(() => tripPackages.id)
    .notNull(),
  text: varchar("text", { length: 255 }).notNull(),
});

export const addOns = pgTable("add_ons", {
  id: serial("id").primaryKey(),
  tripPackageId: integer("trip_package_id")
    .references(() => tripPackages.id)
    .notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  isOptional: boolean("is_optional").default(true),
});

export const hotelPreviews = pgTable("hotel_previews", {
  id: serial("id").primaryKey(),
  tripPackageId: integer("trip_package_id")
    .references(() => tripPackages.id)
    .notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  category: varchar("category", { length: 50 }), // 3star, 4star, homestay, houseboat
  location: varchar("location", { length: 150 }),
  image: text("image"),
  amenities: json("amenities").$type<string[]>().default([]),
  confirmationTimeline: varchar("confirmation_timeline", { length: 255 }).default(
    "Hotel name shared 7 days before departure"
  ),
  isTbc: boolean("is_tbc").default(false),
});

export const tripLeaders = pgTable("trip_leaders", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  bio: text("bio"),
  specialties: json("specialties").$type<string[]>().default([]),
  languages: json("languages").$type<string[]>().default([]),
  experienceYears: integer("experience_years").default(3),
  tripsLed: integer("trips_led").default(50),
  image: text("image"),
  instagram: varchar("instagram", { length: 100 }),
  isVerified: boolean("is_verified").default(true),
  safetyTraining: boolean("safety_training").default(true),
  isPublished: boolean("is_published").default(true),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  location: varchar("location", { length: 100 }),
  tripSlug: varchar("trip_slug", { length: 150 }),
  rating: integer("rating").default(5),
  content: text("content").notNull(),
  image: text("image"),
  isFeatured: boolean("is_featured").default(false),
  isApproved: boolean("is_approved").default(true),
  travelDate: timestamp("travel_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: varchar("question", { length: 500 }).notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }), // booking, safety, cancellation, general
  tripPackageId: integer("trip_package_id").references(() => tripPackages.id),
  order: integer("order").default(0),
  isPublished: boolean("is_published").default(true),
});

export const policyPages = pgTable("policy_pages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  version: integer("version").default(1),
  lastUpdated: timestamp("last_updated").defaultNow(),
  isPublished: boolean("is_published").default(true),
});

export const galleryAssets = pgTable("gallery_assets", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 255 }),
  caption: varchar("caption", { length: 255 }),
  tripPackageId: integer("trip_package_id").references(() => tripPackages.id),
  tags: json("tags").$type<string[]>().default([]),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 150 }).unique().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: varchar("excerpt", { length: 500 }),
  content: text("content").notNull(),
  heroImage: text("hero_image"),
  author: varchar("author", { length: 100 }).default("TripNaari Team"),
  category: varchar("category", { length: 100 }),
  tags: json("tags").$type<string[]>().default([]),
  isPublished: boolean("is_published").default(true),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  destination: varchar("destination", { length: 150 }),
  travelMonth: varchar("travel_month", { length: 50 }),
  travelers: integer("travelers").default(1),
  travelStyle: varchar("travel_style", { length: 100 }),
  budget: varchar("budget", { length: 50 }),
  message: text("message"),
  consent: boolean("consent").default(true),
  source: varchar("source", { length: 100 }).default("website"),
  status: varchar("status", { length: 50 }).default("new"), // new, contacted, itinerary_shared, payment_pending, booked, lost, support_needed
  notes: text("notes"),
  followUpAt: timestamp("follow_up_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookingRequests = pgTable("booking_requests", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  tripPackageId: integer("trip_package_id").references(() => tripPackages.id),
  departureId: integer("departure_id").references(() => departureDates.id),
  travelers: integer("travelers").notNull(),
  totalAmount: integer("total_amount"),
  status: varchar("status", { length: 50 }).default("pending"),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 150 }),
  source: varchar("source", { length: 50 }).default("footer"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  category: varchar("category", { length: 50 }).notNull(), // general, booking, safety, refund, feedback
  priority: varchar("priority", { length: 20 }).default("normal"),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 50 }).default("new"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const refundRequests = pgTable("refund_requests", {
  id: serial("id").primaryKey(),
  bookingRequestId: integer("booking_request_id").references(() => bookingRequests.id),
  leadId: integer("lead_id").references(() => leads.id),
  reason: text("reason").notNull(),
  amountRequested: integer("amount_requested"),
  policyAcknowledged: boolean("policy_acknowledged").default(false),
  status: varchar("status", { length: 50 }).default("pending"), // pending, approved, rejected, processed
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: json("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull(),
  p256dh: varchar("p256dh", { length: 255 }).notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Omnichannel CRM Conversations (Instagram DM + WhatsApp)
export const crmConversations = pgTable("crm_conversations", {
  id: serial("id").primaryKey(),
  channel: varchar("channel", { length: 20 }).notNull(), // 'instagram' | 'whatsapp' | 'website_chat'
  externalUserId: varchar("external_user_id", { length: 100 }).unique().notNull(), // IG User ID or WhatsApp Phone Number (+91...)
  externalUsername: varchar("external_username", { length: 150 }), // IG handle or WhatsApp display name
  customerName: varchar("customer_name", { length: 150 }),
  leadId: integer("lead_id").references(() => leads.id), // linked lead record
  assignedAgent: varchar("assigned_agent", { length: 100 }).default("Unassigned"),
  mode: varchar("mode", { length: 20 }).default("ai"), // 'ai' | 'human'
  status: varchar("status", { length: 50 }).default("active"), // 'active', 'qualified', 'quote_sent', 'escalated', 'booked', 'closed'
  dripStep: integer("drip_step").default(0), // 0: new, 1: 24h follow up, 2: 72h urgency, 3: 7d discount
  quoteData: json("quote_data"), // generated quote details (price, deposit, link)
  internalNotes: json("internal_notes").$type<Array<{ id: number; author: string; text: string; createdAt: string }>>().default([]),
  lastMessageText: text("last_message_text"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  unreadCount: integer("unread_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Omnichannel CRM Messages Log
export const crmMessages = pgTable("crm_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .references(() => crmConversations.id)
    .notNull(),
  channel: varchar("channel", { length: 20 }).notNull(), // 'instagram' | 'whatsapp'
  senderType: varchar("sender_type", { length: 20 }).notNull(), // 'user', 'ai', 'admin'
  senderId: varchar("sender_id", { length: 100 }),
  contentType: varchar("content_type", { length: 30 }).default("text"), // 'text', 'image', 'document', 'interactive'
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  rawPayload: json("raw_payload"),
  intentDetected: varchar("intent_detected", { length: 100 }), // e.g. 'pricing_inquiry', 'date_inquiry', 'phone_provided'
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Agent Configuration & Persona Rules
export const aiAgentConfigs = pgTable("ai_agent_configs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).default("TripNaari AI Assistant"),
  systemPrompt: text("system_prompt").notNull(),
  model: varchar("model", { length: 50 }).default("gpt-4o-mini"),
  temperature: numeric("temperature", { precision: 2, scale: 1 }).default("0.7"),
  autoReplyEnabled: boolean("auto_reply_enabled").default(true),
  whatsappAutoSendPdf: boolean("whatsapp_auto_send_pdf").default(true),
  humanTakeoverKeywords: json("human_takeover_keywords").$type<string[]>().default([
    "speak to agent", "call me", "human", "complaint", "speak to manager", "operator"
  ]),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Types export
export type TripPackage = typeof tripPackages.$inferSelect;
export type DepartureDate = typeof departureDates.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type PushSubscriptionType = typeof pushSubscriptions.$inferSelect;
export type CRMConversation = typeof crmConversations.$inferSelect;
export type CRMMessage = typeof crmMessages.$inferSelect;
export type AIAgentConfig = typeof aiAgentConfigs.$inferSelect;

