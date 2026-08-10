export const metadata = { title: "Our Story - Women-First | TripNaari" };

export default function AboutPage() {
  return (
    <div className="bg-[#FFF8F0] py-16 md:py-24">
      <div className="max-w-[800px] mx-auto px-4 md:px-8">
        {/* Header Block */}
        <div className="text-center mb-12">
          <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D] mb-4">
            Our Story
          </div>
          <h1 className="font-display font-[800] text-[36px] md:text-[52px] leading-[1.05] text-[#13253D]">
            We started because women deserve trips, not lectures.
          </h1>
        </div>

        {/* Story Text */}
        <div className="space-y-6 text-[16px] md:text-[17px] leading-relaxed text-[#3D4A5E] border-b border-[#F1D9D0]/50 pb-12">
          <p>
            TripNaari was born when our founder saw her own mother postpone a Kashmir dream for 20 years because “who will go with you?”. What started as a simple Instagram page `@tripnaari` to share real journeys has grown into a vibrant family of over 33K+ women.
          </p>
          <p>
            We've now guided over 6,000+ women on safe, empowering, and life-changing departures—from solo first-timers and busy professionals to housewives, mothers, daughters, and adventurous grandmothers.
          </p>
          <p>
            We believe in complete transparency. Our itineraries share exact hotel category previews, inclusions, exclusions, written refund commitments, and a real, active escalation matrix so that you're always fully informed.
          </p>
          <p>
            Every single trip is handcrafted: women-led stays, local female artisans, background-checked transport drivers, and an experienced female trip leader who stays with the group from pickup to drop.
          </p>
          <p className="font-display font-bold text-[18px] text-[#800F2D] pt-2">
            Travel fearless, Naari. We’ve got your back and your backpack.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-white border border-[#F1D9D0] p-6 shadow-[0_10px_30px_-10px_rgba(19,37,61,0.06)]">
            <div className="font-display font-[800] text-[24px] text-[#FF4A7D]">6000+</div>
            <div className="text-[14px] font-bold text-[#13253D] mt-1">Women Travelled</div>
            <p className="text-[12px] text-[#3D4A5E] mt-2">Explored the Himalayas, South India, Deserts, and International escapes.</p>
          </div>
          <div className="rounded-3xl bg-white border border-[#F1D9D0] p-6 shadow-[0_10px_30px_-10px_rgba(19,37,61,0.06)]">
            <div className="font-display font-[800] text-[24px] text-[#5B2063]">33K Instagram</div>
            <div className="text-[14px] font-bold text-[#13253D] mt-1">Vibrant Community</div>
            <p className="text-[12px] text-[#3D4A5E] mt-2">Real posts, comments, and community validation. No stock pretense.</p>
          </div>
          <div className="rounded-3xl bg-white border border-[#F1D9D0] p-6 shadow-[0_10px_30px_-10px_rgba(19,37,61,0.06)]">
            <div className="font-display font-[800] text-[24px] text-[#800F2D]">100% Women-Led</div>
            <div className="text-[14px] font-bold text-[#13253D] mt-1">Trip Leaders</div>
            <p className="text-[12px] text-[#3D4A5E] mt-2">Verified, safety-audited, first-aid trained, and active 24x7.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

