import Link from "next/link";
import { Mail, MapPin, Shield, Heart } from "lucide-react";
const Instagram = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#131111] text-[#FFF8F0] border-t border-white/5">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <div className="mb-6">
              <img 
                src="/logo.png" 
                alt="TripNaari Logo" 
                className="h-12 md:h-14 w-auto object-contain" 
              />
              <p className="text-white/50 text-[13px] mt-2">Travel Fearless, We've Got Your Backpack</p>
            </div>
            <p className="text-[14px] leading-relaxed text-white/60 max-w-sm">
              Women-oriented travel company & community for safe, handcrafted domestic & international trips. Over 6,000+ travelers, 33K+ Instagram community, Bangalore roots.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="https://instagram.com/tripnaari" target="_blank" className="w-9 h-9 rounded-full bg-white/5 grid place-items-center hover:bg-[#FF4A7D] transition"><Instagram className="w-4 h-4" /></Link>
              <a href="mailto:info@tripnaari.com" className="w-9 h-9 rounded-full bg-white/5 grid place-items-center hover:bg-[#FF4A7D] transition"><Mail className="w-4 h-4" /></a>
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-6">
            <h4 className="font-semibold text-white mb-4 text-[15px]">Explore</h4>
            <ul className="space-y-3 text-[14px] text-white/60">
              <li><Link href="/trips" className="hover:text-white transition-colors">Upcoming Trips</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/safety" className="hover:text-white transition-colors">Safety First</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-semibold text-white mb-4 text-[15px]">Support</h4>
            <ul className="space-y-3 text-[14px] text-white/60">
              <li><Link href="/policies/cancellation-refund" className="hover:text-white transition-colors">Cancellation / Refund</Link></li>
              <li><Link href="/policies/safety-promise" className="hover:text-white transition-colors">Safety Promise</Link></li>
              <li><Link href="/policies/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/policies/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-semibold text-white mb-4 text-[15px]">Office</h4>
            <div className="flex gap-2 text-[14px] text-white/60 leading-relaxed mb-4">
              <MapPin className="w-4 h-4 mt-1 shrink-0" />
              <span>Bangalore, India<br/>Responds in 2 hours (10AM-8PM)<br/>info@tripnaari.com</span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between text-[12px] text-white/40">
          <div className="flex items-center gap-1.5"><Heart className="w-3 h-3 text-[#FF4A7D] fill-[#FF4A7D]"/> © 2026 TripNaari • Recognised by MSME & Startup India • Women-led.</div>
          <div>We’ve got your back and your backpack!</div>
        </div>
      </div>
    </footer>
  );
}

