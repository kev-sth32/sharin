import Hero from "@/components/sections/Hero";
import SocialProof from "@/components/sections/SocialProof";
import FeaturedDepartures from "@/components/sections/FeaturedDepartures";
import WhyChoose from "@/components/sections/WhyChoose";
import SafetyPromise from "@/components/sections/SafetyPromise";
import DestinationGrid from "@/components/sections/DestinationGrid";
import TripLeaders from "@/components/sections/TripLeaders";
import Testimonials from "@/components/sections/Testimonials";
import FAQSection from "@/components/sections/FAQ";
import CustomTripBuilder from "@/components/forms/CustomTripBuilder";
import EnquiryForm from "@/components/forms/EnquiryForm";
import Newsletter from "@/components/forms/Newsletter";
import { tripPackagesSeed, destinationsSeed } from "@/lib/data";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SocialProof />
      <FeaturedDepartures />

      <section id="enquiry" className="bg-[#FFF8F0] py-16 md:py-24 border-y border-[#F1D9D0]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <div className="sticky top-28">
              <div className="text-[12px] font-bold tracking-widest uppercase text-[#FF4A7D]">Enquiry form • 2 hours response • No spam</div>
              <h2 className="mt-3 font-display font-bold text-[32px] md:text-[44px] leading-[0.9] text-[#13253D]">Tell us about your dream, we’ll check sisterhood slots.</h2>
              <div className="mt-6 space-y-4 text-[14px] leading-relaxed text-[#3D4A5E]">
                <div className="flex gap-3"><span className="w-6 h-6 rounded-full bg-white border border-[#F1D9D0] grid place-items-center text-xs">1</span><span><strong>Transparent:</strong> We share hotel samples, inclusions, exclusions, cancellation before you pay.</span></div>
                <div className="flex gap-3"><span className="w-6 h-6 rounded-full bg-white border border-[#F1D9D0] grid place-items-center text-xs">2</span><span><strong>Safety first:</strong> Trip leader intro, emergency card, live location promise.</span></div>
                <div className="flex gap-3"><span className="w-6 h-6 rounded-full bg-white border border-[#F1D9D0] grid place-items-center text-xs">3</span><span><strong>Flexible:</strong> Solo join or private custom. Jain/vegan/kid ground floor = noted actually.</span></div>
              </div>

              <div className="mt-8 rounded-2xl bg-[#13253D] text-white p-5">
                <div className="text-[13px] font-semibold">Instagram community validation</div>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <div className="rounded-xl overflow-hidden aspect-square"><img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=80" className="w-full h-full object-cover" alt="gallery" /></div>
                  <div className="rounded-xl overflow-hidden aspect-square"><img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&q=80" className="w-full h-full object-cover" alt="gallery" /></div>
                  <div className="rounded-xl overflow-hidden aspect-square"><img src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=300&q=80" className="w-full h-full object-cover" alt="gallery" /></div>
                </div>
                <div className="mt-3 text-[11px] text-white/60">2,109 posts • 33K followers • #TripNaari • Real trips, no stock pretense</div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <EnquiryForm source="homepage" />
          </div>
        </div>
      </section>

      <CustomTripBuilder />
      <WhyChoose />
      <SafetyPromise />
      <DestinationGrid />
      <TripLeaders />
      <Testimonials />
      <FAQSection />
      <Newsletter />

      <section className="max-w-[1280px] mx-auto px-4 md:px-8 pb-24">
        <div className="rounded-[32px] border border-dashed border-[#FF4A7D]/30 bg-[#FFF0F4] p-8 md:p-12 text-center">
          <h3 className="font-display font-bold text-[28px] md:text-[36px] leading-tight text-[#13253D]">Travel fearless, Naari. We’ve got your back and your backpack!</h3>
          <p className="mt-3 text-[#3D4A5E] max-w-xl mx-auto">Bangalore based, women-led, MSME & Startup India recognised. Whether solo first timer, housewife, mother, grandmother or gang — your safe sisterhood awaits.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/trips" className="rounded-full bg-[#FF4A7D] text-white px-6 py-3 text-sm font-semibold">Browse trips →</Link>
            <Link href="/safety" className="rounded-full bg-white border border-[#F1D9D0] px-6 py-3 text-sm font-semibold text-[#13253D]">Safety promise</Link>
          </div>
        </div>
      </section>
    </>
  );
}
