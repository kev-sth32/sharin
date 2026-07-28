import Link from "next/link";
import { Mail, MapPin, Shield, Heart } from "lucide-react";
const Instagram = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#13253D] text-[#FFF8F0] mt-24">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FF4A7D] grid place-items-center font-black text-white">TN</div>
              <div>
                <div className="font-display font-bold text-xl leading-none">TripNaari</div>
                <div className="text-[10px] tracking-[0.18em] uppercase text-[#FF8A2B] font-semibold">Empower • Encourage • Freedom • Safety</div>
              </div>
            </div>
            <p className="text-[15px] leading-relaxed text-white/70 max-w-sm text-balance">
              Women-oriented travel company & community for safe, handcrafted trips. We’ve got your back and your backpack. 3000+ women, 33K+ Instagram family, Bangalore roots, Himalayas to Bali.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="https://instagram.com/tripnaari" target="_blank" className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-[#FF4A7D] transition"><Instagram className="w-4 h-4" /></Link>
              <a href="mailto:hello@tripnaari.com" className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-[#FF4A7D] transition"><Mail className="w-4 h-4" /></a>
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex gap-2 items-start">
                <Shield className="w-5 h-5 text-[#FF8A2B] mt-0.5" />
                <div className="text-[13px] leading-relaxed text-white/70">
                  <strong className="text-white">Safety Promise:</strong> Verified stays, women trip leaders, background-checked drivers, emergency escalation 24x7. Read full policy.
                  <div className="mt-2"><Link href="/safety" className="text-[#FF8A2B] underline underline-offset-2">View safety accountability</Link></div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-semibold mb-4 text-white">Explore</h4>
            <ul className="space-y-3 text-[14px] text-white/70">
              <li><Link href="/trips" className="hover:text-white">All trips</Link></li>
              <li><Link href="/destinations" className="hover:text-white">Destinations</Link></li>
              <li><Link href="/trips?filter=women-only" className="hover:text-white">Women-only groups</Link></li>
              <li><Link href="/trips?filter=weekend" className="hover:text-white">Weekend getaways</Link></li>
              <li><Link href="/trips?filter=international" className="hover:text-white">International</Link></li>
              <li><Link href="/#custom-trip" className="hover:text-white">Custom private trip</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-semibold mb-4 text-white">Trust & Support</h4>
            <ul className="space-y-3 text-[14px] text-white/70">
              <li><Link href="/policies/cancellation-refund" className="hover:text-white">Cancellation / Refund</Link></li>
              <li><Link href="/policies/safety-promise" className="hover:text-white">Safety Promise</Link></li>
              <li><Link href="/safety" className="hover:text-white">Trip Leader Accountability</Link></li>
              <li><Link href="/policies/privacy-policy" className="hover:text-white">Privacy</Link></li>
              <li><Link href="/policies/terms-conditions" className="hover:text-white">Terms</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact / Escalation</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-semibold mb-4 text-white">Office</h4>
            <div className="flex gap-2 text-[14px] text-white/70 leading-relaxed">
              <MapPin className="w-4 h-4 mt-1 shrink-0" />
              <span>Bangalore, India • Responds in 2 hours on WhatsApp (10AM-8PM). Emergency line 24x7 for ongoing trips.</span>
            </div>
            <div className="mt-6 rounded-2xl bg-[#FFF8F0] text-[#13253D] p-4">
              <div className="text-[12px] font-bold uppercase tracking-widest opacity-60">Get itinerary first</div>
              <div className="mt-1 font-display font-semibold text-[18px] leading-tight">Join 12k+ Naaris on WhatsApp community</div>
              <Link href="/#newsletter" className="mt-3 inline-block text-sm font-semibold underline underline-offset-4 text-[#FF4A7D]">Join now →</Link>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between text-[12px] text-white/50">
          <div className="flex items-center gap-1.5"><Heart className="w-3 h-3 text-[#FF4A7D]"/> © 2026 TripNaari • Recognised by MSME • Startup India • Women-led, women-checked, women-loved.</div>
          <div>We’ve got your back and your backpack!</div>
        </div>
      </div>
    </footer>
  );
}
