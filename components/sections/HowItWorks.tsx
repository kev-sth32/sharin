import { Map, CreditCard, Users, Compass, MessageSquare } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Map,
      number: "1",
      title: "Pick Your Destination",
      desc: "Browse our curated list of safety-first domestic & international trips.",
    },
    {
      icon: CreditCard,
      number: "2",
      title: "Book Your Slot",
      desc: "Reserve your spot with a flexible deposit and transparent refund policy.",
    },
    {
      icon: Users,
      number: "3",
      title: "Meet Co-Travellers",
      desc: "Join our private group and connect before you start your journey.",
    },
    {
      icon: Compass,
      number: "4",
      title: "Enjoy Your Trip",
      desc: "Travel with absolute peace of mind alongside our 24x7 women trip leaders.",
    },
    {
      icon: MessageSquare,
      number: "5",
      title: "Share Your Stories",
      desc: "Stay connected in our community and plan your next sisterhood getaway.",
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-24 bg-[#FFF8F0] py-16 md:py-24 border-y border-[#F1D9D0]/50">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D] mb-4">
            How It Works
          </div>
          <h2 className="font-display font-[800] text-[36px] md:text-[48px] leading-[1.05] text-[#13253D]">
            Your Journey With TripNaari
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center p-6 bg-white border border-[#F1D9D0] rounded-3xl shadow-[0_8px_30px_-6px_rgba(19,37,61,0.04)]">
              {/* Step number badge */}
              <div className="absolute -top-4 w-8 h-8 rounded-full bg-[#FF4A7D] text-white flex items-center justify-center font-bold text-sm shadow-md">
                {step.number}
              </div>

              {/* Icon Container */}
              <div className="w-16 h-16 rounded-full bg-[#FFF0F4] border border-[#FF4A7D]/10 flex items-center justify-center text-[#FF4A7D] mb-4 mt-2">
                <step.icon className="w-6 h-6" />
              </div>

              <h3 className="font-display font-bold text-[16px] text-[#13253D] mb-2 leading-snug">
                {step.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-[#3D4A5E]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
