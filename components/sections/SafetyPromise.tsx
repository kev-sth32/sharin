import { Check } from "lucide-react";

export default function SafetyPromise() {
  const points = [
    { title: "100% Female Tour Leaders", desc: "Every trip is led by an experienced, certified female leader who ensures safety and coordinates everything." },
    { title: "Handpicked Safe Accommodation", desc: "Stays are audited for security, locks, location, and verified by solo-traveler reviews beforehand." },
    { title: "Solo-Traveler Friendly Environment", desc: "No single supplements or awkwardness; we pair you with co-travelers or offer private options seamlessly." },
    { title: "Curated Immersive Experiences", desc: "Skip generic sight-seeing and dive deep into local food, craft workshops, and authentic sisterhood connections." },
  ];

  return (
    <section className="bg-[#FFF8F0] py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Road Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[400px] aspect-[3/4] overflow-hidden rounded-[32px] shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80" 
                alt="Road to mountains" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D]">
              Our Mission
            </div>
            <h2 className="font-display font-[800] text-[36px] md:text-[48px] leading-[1.05] text-[#13253D]">
              The Ultimate Sisterhood of Exploration
            </h2>
            <p className="text-[16px] md:text-[17px] leading-relaxed text-[#3D4A5E]">
              We believe travel should be empowering, safe, and deeply connection-driven. That's why every detail of our itineraries is hand-curated.
            </p>

            <div className="space-y-4 pt-4">
              {points.map((p, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-[#FFF0F4] border border-[#FF4A7D]/10">
                  <div className="w-8 h-8 rounded-lg bg-[#FF4A7D] text-white flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[16px] text-[#13253D]">
                      {p.title}
                    </h3>
                    <p className="text-[13px] text-[#3D4A5E] mt-1">
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

