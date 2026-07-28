import { notFound } from "next/navigation";

const contentMap: Record<string, { title: string; body: string }> = {
  "cancellation-refund": {
    title: "Cancellation & Refund Policy - Transparent & Time-bound",
    body: `
## Our philosophy
We keep policies human. Life happens. We'd rather give you credit you can use with a sister than hold money.

## Slabs
- 30+ days before departure: 90% refund to source + 10% retained as processing
- 15-29 days: 50% refund + 50% credit valid 12 months, transferable to another Naari
- 7-14 days: 30% refund + 50% credit
- Less than 7 days: No refund but 70% credit, transferable
- Less than 48 hours / No-show: No refund, credit case-by-case for emergency with proof

## Timeline
Refund processed in 7-10 working days to original payment method. Credit issued instantly via code emailed+WhatsApp.

## If TripNaari cancels
If we cancel due to safety, political unrest, weather, low group size below 6 — you get choice: move to next date with free upgrade, or 100% refund + 10% credit as apology.

## Hotel change
If hotel name shared 7 days before changes after, upgrade at our cost OR 50% of one night refund if same category but different property.

## How to request
Use Refund form on contact page, or email refunds@tripnaari.com with booking ID. We acknowledge in 24 hours, resolve in 5 days.

## Version history
v2.1 updated Jan 2026 — credits transferable added after feedback from housewives community.
`,
  },
  "safety-promise": {
    title: "Safety Promise & Accountability",
    body: `
## Trip leader accountability
Every departure has one verified woman trip leader. She stays in same property, travels in same vehicle, carries first-aid, oxygen (for Himalaya), emergency fund.

## Verified ecosystem
- Driver: police verified, 5+ years hill experience, no night driving without consent
- Hotel: safety audit (door lock, location, solo women reviews), women-only floor where possible
- Homestay: run by women / family, local reference

## Emergency card
Printed + WhatsApp: trip leader phone, operations 24x7, local police, hospital, TripNaari founder escalation.

## Communication
WhatsApp group created 48h before. Live location shared on travel days. Trip leader active 6am-10pm, emergency line 24x7.

## Feedback escalation
Level1: Trip leader immediate, Level2: Operations 24x7 +91 9XXXX 9XXXX (2min pick), Level3: founder@tripnaari.com (24h response). Monthly safety report in Instagram highlights.

## What we don't tolerate
Harassment, non-consensual behavior, hidden costs, bait-and-switch hotels — zero tolerance. Immediate corrective action, refund where appropriate, public learning.
`,
  },
  "privacy-policy": {
    title: "Privacy Policy - Your Data, Your Sisterhood",
    body: `
We collect name, email, phone, travel preferences to craft trip. We store in PostgreSQL encrypted at rest. We use your phone only for trip-related WhatsApp (no marketing without opt-in). We never sell data to third party.

You can request deletion via privacy@tripnaari.com. Newsletter unsubscribe anytime.

Cookies: we use analytics (anonymized) and conversion tracking. No creepy cross-site tracking.

DMCA: TripNaari community photos used with consent. If you want yours removed, email.

Contact DPO: dpo@tripnaari.com, Bangalore.
`,
  },
  "terms-conditions": {
    title: "Terms & Conditions",
    body: `
Booking confirms you are 18+ or guardian consent for daughter 12+. You agree to safety code: respect local culture, no drugs, no harassment.

TripNaari is not liable for weather, political curfew, natural disasters beyond control — but we will provide alternatives or refund per cancellation policy.

Itinerary may change due to safety, we communicate 12h prior.

Payment: 30% advance to confirm seat, 100% 15 days before. EMI via partner.

Jurisdiction: Bangalore courts.

Recognised by MSME & Startup India. We love you, Naari.
`,
  },
};

export async function generateStaticParams() { return Object.keys(contentMap).map(s=>({ slug: s })); }

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = contentMap[slug];
  if (!policy) return notFound();
  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-8 py-12">
      <h1 className="font-display font-bold text-[32px] leading-tight">{policy.title}</h1>
      <div className="mt-2 text-[12px] uppercase tracking-widest font-bold text-[#FF4A7D]">Last updated: 15 Jan 2026 • Version history maintained</div>
      <div className="mt-8 prose-trip rounded-2xl bg-white border border-[#F1D9D0] p-8">
        <pre className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-[#3D4A5E]">{policy.body}</pre>
      </div>
    </div>
  );
}
