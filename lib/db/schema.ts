// TripNaari Drizzle ORM Schema - MySQL
import { mysqlTable, text, timestamp, int, boolean, json, decimal, varchar } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const tripPackages = mysqlTable("trip_packages", {
  id: int("id").primaryKey().autoincrement(),
  slug: varchar("slug", { length: 150 }).unique().notNull(),
  destinationSlug: varchar("destination_slug", { length: 100 }),
  title: varchar("title", { length: 255 }).notNull(),
  shortDescription: varchar("short_description", { length: 500 }),
  longDescription: text("long_description"),
  durationDays: int("duration_days").notNull(),
  durationNights: int("duration_nights").notNull(),
  priceFrom: int("price_from").notNull(), // in INR
  priceOriginal: int("price_original"),
  groupSizeMin: int("group_size_min").default(8),
  groupSizeMax: int("group_size_max").default(16),
  difficulty: varchar("difficulty", { length: 50 }), // easy, moderate, challenging
  comfortLevel: varchar("comfort_level", { length: 50 }), // backpacker, comfort, premium
  isWomenOnly: boolean("is_women_only").default(true),
  isFamilyFriendly: boolean("is_family_friendly").default(false),
  isFeatured: boolean("is_featured").default(false),
  heroImage: text("hero_image"),
  gallery: json("gallery").$type<string[]>().default(sql`(JSON_ARRAY())`),
  highlights: json("highlights").$type<string[]>().default(sql`(JSON_ARRAY())`),
  ratingAvg: decimal("rating_avg", { precision: 3, scale: 2 }).default("4.9"),
  ratingCount: int("rating_count").default(127),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  itineraryChangePolicy: text("itinerary_change_policy"),
  itineraryPdf: text("itinerary_pdf"),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const departureDates = mysqlTable("departure_dates", {
  id: int("id").primaryKey().autoincrement(),
  tripPackageId: int("trip_package_id").references(() => tripPackages.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  seatsTotal: int("seats_total").default(16),
  seatsBooked: int("seats_booked").default(0),
  price: int("price"),
  status: varchar("status", { length: 30 }).default("open"), // open, filling_fast, sold_out, cancelled
  isGuaranteed: boolean("is_guaranteed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dayItineraries = mysqlTable("day_itineraries", {
  id: int("id").primaryKey().autoincrement(),
  tripPackageId: int("trip_package_id").references(() => tripPackages.id).notNull(),
  dayNumber: int("day_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  location: varchar("location", { length: 150 }),
  mealsIncluded: json("meals_included").$type<string[]>().default(sql`(JSON_ARRAY())`),
  activities: json("activities").$type<string[]>().default(sql`(JSON_ARRAY())`),
  accommodation: varchar("accommodation", { length: 255 }),
  travelNotes: text("travel_notes"),
  image: text("image"),
});

export const inclusions = mysqlTable("inclusions", {
  id: int("id").primaryKey().autoincrement(),
  tripPackageId: int("trip_package_id").references(() => tripPackages.id).notNull(),
  text: varchar("text", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }), // stay, meal, transport, activity, guide
  icon: varchar("icon", { length: 50 }),
});

export const exclusions = mysqlTable("exclusions", {
  id: int("id").primaryKey().autoincrement(),
  tripPackageId: int("trip_package_id").references(() => tripPackages.id).notNull(),
  text: varchar("text", { length: 255 }).notNull(),
});

export const addOns = mysqlTable("add_ons", {
  id: int("id").primaryKey().autoincrement(),
  tripPackageId: int("trip_package_id").references(() => tripPackages.id).notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  price: int("price").notNull(),
  isOptional: boolean("is_optional").default(true),
});

export const hotelPreviews = mysqlTable("hotel_previews", {
  id: int("id").primaryKey().autoincrement(),
  tripPackageId: int("trip_package_id").references(() => tripPackages.id).notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  category: varchar("category", { length: 50 }), // 3star, 4star, homestay, houseboat
  location: varchar("location", { length: 150 }),
  image: text("image"),
  amenities: json("amenities").$type<string[]>().default(sql`(JSON_ARRAY())`),
  confirmationTimeline: varchar("confirmation_timeline", { length: 255 }).default("Hotel name shared 7 days before departure"),
  isTbc: boolean("is_tbc").default(false),
});

export const tripLeaders = mysqlTable("trip_leaders", {
  id: int("id").primaryKey().autoincrement(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  bio: text("bio"),
  specialties: json("specialties").$type<string[]>().default(sql`(JSON_ARRAY())`),
  languages: json("languages").$type<string[]>().default(sql`(JSON_ARRAY())`),
  experienceYears: int("experience_years").default(3),
  tripsLed: int("trips_led").default(50),
  image: text("image"),
  instagram: varchar("instagram", { length: 100 }),
  isVerified: boolean("is_verified").default(true),
  safetyTraining: boolean("safety_training").default(true),
  isPublished: boolean("is_published").default(true),
});

export const testimonials = mysqlTable("testimonials", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 150 }).notNull(),
  location: varchar("location", { length: 100 }),
  tripSlug: varchar("trip_slug", { length: 150 }),
  rating: int("rating").default(5),
  content: text("content").notNull(),
  image: text("image"),
  isFeatured: boolean("is_featured").default(false),
  isApproved: boolean("is_approved").default(true),
  travelDate: timestamp("travel_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const faqs = mysqlTable("faqs", {
  id: int("id").primaryKey().autoincrement(),
  question: varchar("question", { length: 500 }).notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }), // booking, safety, cancellation, general
  tripPackageId: int("trip_package_id").references(() => tripPackages.id),
  order: int("order").default(0),
  isPublished: boolean("is_published").default(true),
});

export const policyPages = mysqlTable("policy_pages", {
  id: int("id").primaryKey().autoincrement(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  version: int("version").default(1),
  lastUpdated: timestamp("last_updated").defaultNow(),
  isPublished: boolean("is_published").default(true),
});

export const galleryAssets = mysqlTable("gallery_assets", {
  id: int("id").primaryKey().autoincrement(),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 255 }),
  caption: varchar("caption", { length: 255 }),
  tripPackageId: int("trip_package_id").references(() => tripPackages.id),
  tags: json("tags").$type<string[]>().default(sql`(JSON_ARRAY())`),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").primaryKey().autoincrement(),
  slug: varchar("slug", { length: 150 }).unique().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: varchar("excerpt", { length: 500 }),
  content: text("content").notNull(),
  heroImage: text("hero_image"),
  author: varchar("author", { length: 100 }).default("TripNaari Team"),
  category: varchar("category", { length: 100 }),
  tags: json("tags").$type<string[]>().default(sql`(JSON_ARRAY())`),
  isPublished: boolean("is_published").default(true),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = mysqlTable("leads", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  destination: varchar("destination", { length: 150 }),
  travelMonth: varchar("travel_month", { length: 50 }),
  travelers: int("travelers").default(1),
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

export const bookingRequests = mysqlTable("booking_requests", {
  id: int("id").primaryKey().autoincrement(),
  leadId: int("lead_id").references(() => leads.id),
  tripPackageId: int("trip_package_id").references(() => tripPackages.id),
  departureId: int("departure_id").references(() => departureDates.id),
  travelers: int("travelers").notNull(),
  totalAmount: int("total_amount"),
  status: varchar("status", { length: 50 }).default("pending"),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 150 }),
  source: varchar("source", { length: 50 }).default("footer"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").primaryKey().autoincrement(),
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

export const refundRequests = mysqlTable("refund_requests", {
  id: int("id").primaryKey().autoincrement(),
  bookingRequestId: int("booking_request_id").references(() => bookingRequests.id),
  leadId: int("lead_id").references(() => leads.id),
  reason: text("reason").notNull(),
  amountRequested: int("amount_requested"),
  policyAcknowledged: boolean("policy_acknowledged").default(false),
  status: varchar("status", { length: 50 }).default("pending"), // pending, approved, rejected, processed
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const siteSettings = mysqlTable("site_settings", {
  id: int("id").primaryKey().autoincrement(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: json("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").primaryKey().autoincrement(),
  endpoint: text("endpoint").notNull(),
  p256dh: varchar("p256dh", { length: 255 }).notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Types export
export type TripPackage = typeof tripPackages.$inferSelect;
export type DepartureDate = typeof departureDates.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type PushSubscriptionType = typeof pushSubscriptions.$inferSelect;
