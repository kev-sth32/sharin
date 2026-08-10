# TripNaari — Women-First Travel Website (Production-Ready)

**Brand:** TripNaari / @tripnaari  
**Tagline:** Travel fearless, we've got your back and your backpack!  
**Bio:** Empower | Encourage | Freedom | Safety • MSME | Startup India Recognised • Bangalore, India  
**Instagram:** ~33K followers, 355 following, 2,109 posts — community-led, real trips

---

## ✨ What this ships

A modern, conversion-focused, mobile-first fullstack website for TripNaari built to turn Instagram traffic into qualified enquiries while reinforcing safety, transparency, and women-led empowerment.

### Public Pages
- `/` — Editorial hero, social proof strip, featured departures, enquiry (2-min), custom trip builder, why women choose, safety promise, destination grid, trip leaders, testimonials, FAQs, Instagram gallery, newsletter, sticky CTA
- `/trips` + `/trips/[slug]` — Trip cards with inclusions/exclusions, hotel preview timeline, itinerary change policy, cancellation slabs, emergency escalation, departure dates, rating, EMI
- `/destinations` + `/destinations/[slug]` — 10 seeded regions: Kashmir, Kerala, Meghalaya, Rajasthan, Himachal, Goa, Northeast India, Varanasi-Ayodhya-Prayagraj, Nepal, International
- `/safety` — Written SOP: pre-trip group, on-trip audit, hotel refund timeline, trip leader empowerment, low group size promise
- `/about` — Story from founder's mother waiting 20 years to community of 3000+ women
- `/blog` + `/blog/[slug]` — Safety checklists, Kashmir safety 2026, food preferences
- `/policies` + `/policies/[slug]` — Cancellation/refund, Safety promise, Privacy, Terms — with version history note
- `/contact` — Support form + refund/cancellation request form linked to policy
- `/api/health`, `/api/leads`, `/sitemap.xml`, `/robots.txt`

### Design System
- Colors: warm pink #FF4A7D, saffron #FF8A2B, plum #5B2063, cream #FFF8F0, navy #13253D
- Typography: Fraunces display (bold editorial) + Plus Jakarta Sans (clean, readable)
- Mobile-first, sticky enquiry CTA, fast Unsplash images, accessible contrast, keyboard nav, clear labels

### Trust Layer (addressing public review insights)
Every trip page shows:
- Inclusions / Exclusions crystal clear
- Hotel category + sample properties + exact confirmation timeline (7 days before, 3 days for weekend)
- Cancellation/refund slabs + 7-10 day processing promise
- Emergency contact card + trip leader accountability + escalation matrix
- Itinerary change policy for weather/traffic/safety/low group size
- Review response & feedback escalation Levels

---

## 🗄️ CMS & Data Models

**Drizzle ORM + MySQL** schema in `lib/db/schema.ts`:

- `destinations`, `tripPackages`, `departureDates`, `dayItineraries`, `inclusions`, `exclusions`, `addOns`, `hotelPreviews`, `tripLeaders`, `testimonials`, `faqs`, `policyPages`, `galleryAssets`, `blogPosts`, `leads`, `bookingRequests`, `newsletterSubscribers`, `contactMessages`, `refundRequests`, `siteSettings`

Seed data in `lib/data.ts` with 10 destinations, 8 trips, 3 leaders, 4 testimonials, 6 FAQs, 3 blogs.

**File fallback:** If `DATABASE_URL` not set (demo), submissions persist to `.data/*.json` with same API — swap to real MySQL via `drizzle-kit push` in prod.

### Admin CMS

- `/admin` — Dashboard: stats, model list, feature checklist
- `/admin/leads` — Lead table with status: New, Contacted, Itinerary Shared, Payment Pending, Booked, Lost, Support Needed. Notes, follow-up.
- Schema fields cover: publish/draft (`isPublished`), featured toggles (`isFeatured`), SEO fields (`seoTitle`, `seoDescription`), structured data ready for TravelAgency, TouristTrip, FAQ, BreadcrumbList, Review.
- Policy version history (`version`, `lastUpdated`)
- Testimonial moderation (`isApproved`)
- Gallery metadata (`alt`, `caption`, `tags`)

Add CRUD via Drizzle: `db.insert(schema.tripPackages).values(...)` — server actions in `lib/actions.ts`.

---

## 📝 Forms & Workflows

All forms validate via `zod` + server actions, store in PG/file, send notification email hook:

1. **Trip enquiry** (`#enquiry`): name, email, phone/WhatsApp, destination, month, travelers, travel style, budget, message, consent. Status workflow.
2. **Custom trip planner**: interests, dates, group type, comfort, activities, safety needs, kid-friendly, food preferences
3. **Download itinerary** — Same as enquiry with source tag `trip_[slug]` + automated confirmation UI
4. **Newsletter/WhatsApp community**: email → WhatsApp invite
5. **Contact/support**: category, priority, subject
6. **Refund/cancellation**: bookingId, reason, policyAcknowledged, escalation

Each returns success UI: next steps, hotel timeline, emergency line. Conversion event `gtag('event','generate_lead')` stub.

---

## 🔧 Tech Stack

- Next.js 16 App Router, TypeScript, Tailwind CSS 3.4, reusable components (`components/ui/*`)
- MySQL + Drizzle ORM + drizzle-kit (`drizzle.config.ts`)
- Server actions, API routes, file-based mock persistence
- Lucide icons, clsx/tailwind-merge, date-fns, zod
- SEO: metadata, Open Graph, sitemap, robots, structured data (TravelAgency + FAQ)
- Security: server validation, consent checkbox, env secrets, no client secrets

---

## 🚀 Run locally

```bash
npm install
# set env
cp .env.example .env
# optional: set real PG
# DATABASE_URL=mysql://...

npm run dev      # http://localhost:3000
npm run build    # production build — uses webpack (turbopack css bug workaround)
npm run start
```

### Drizzle

```bash
npm run db:generate
npm run db:push
npm run db:studio
```

---

## 📦 Analytics & Conversion

- Hook in `EnquiryForm.tsx`: `gtag('event','generate_lead', { destination })`
- Add env `NEXT_PUBLIC_GA_ID` and inject script in layout if needed
- Newsletter → WhatsApp community tracking via `source` field

---

## 💡 Brand Voice

Bold, feminine, premium, adventurous, safe, community-led. No clichés. Editorial, not bubblegum. Every claim has timeline.

**Example:** Not "best hotels" but "Hotel category at booking, 2 samples. Name confirmed 7 days before via email+WhatsApp. If changed, upgrade at our cost."

---

## 🛡️ Trust Content Checklist Met

- [x] Inclusions/exclusions every trip
- [x] Hotel preview or TBC with communication timeline
- [x] Cancellation/refund with timelines
- [x] Emergency contact + leader accountability
- [x] Itinerary change policy (weather, traffic, safety, low group)
- [x] Review response + escalation
- [x] Policy version history
- [x] Admin lead stages

---

## 📍 Next steps for production

- Connect real MySQL + run migration
- Wire Resend/SES in `lib/actions.ts` `sendNotificationEmail`
- Add admin auth (NextAuth) + role-based permissions
- Add upload to S3 for gallery
- Integrate WhatsApp Cloud API for follow-ups
- Add Razorpay for EMI/payments → updates `payment_pending` → `booked`

Built with love for Naaris traveling fearless. 💖
