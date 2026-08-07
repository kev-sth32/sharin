import Hero from "@/components/sections/Hero";
import WhyChoose from "@/components/sections/WhyChoose";
import FeaturedDepartures from "@/components/sections/FeaturedDepartures";
import SafetyPromise from "@/components/sections/SafetyPromise";
import HowItWorks from "@/components/sections/HowItWorks";
import Gallery from "@/components/sections/Gallery";
import FAQSection from "@/components/sections/FAQ";
import ContactSection from "@/components/sections/ContactSection";
import Newsletter from "@/components/forms/Newsletter";
import CommunityBanner from "@/components/sections/CommunityBanner";
import EnquiryModal from "@/components/sections/EnquiryModal";
import TripLeaders from "@/components/sections/TripLeaders";
import Testimonials from "@/components/sections/Testimonials";
import { getSettings, getMergedFAQs } from "@/lib/public-store";

export default function HomePage() {
  const settings = getSettings();
  const faqs = getMergedFAQs();
  const rawText = settings.marqueeText || "";
  const cleanText = rawText.trim().replace(/^[\s•·\-/*]+|[\s•·\-/*]+$/g, "");

  return (
    <>
      <Hero />
      
      {/* Moving Marquee Strip */}
      <div className="overflow-hidden border-y border-[#F1D9D0] bg-[#FFF0F4] mt-10 md:mt-12">
        <div className="flex animate-marquee whitespace-nowrap py-3.5 gap-8 text-[11px] md:text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D]/95">
          <span>{cleanText} &nbsp;&nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span>{cleanText} &nbsp;&nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;&nbsp;</span>
        </div>
      </div>

      <WhyChoose />
      <FeaturedDepartures />
      <SafetyPromise />
      <HowItWorks />
      <TripLeaders />
      <Testimonials />
      <Gallery />
      <FAQSection faqs={faqs} />
      <ContactSection />
      <Newsletter />
      <CommunityBanner />
      <EnquiryModal />
    </>
  );
}

