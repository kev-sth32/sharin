export const metadata = { title: "Our Story - Women-First | TripNaari" };

export default function AboutPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12">
      <div className="text-[12px] font-bold tracking-widest uppercase text-[#FF4A7D]">Our Story • Bangalore • Women-led • MSME & Startup India Recognised</div>
      <h1 className="mt-3 font-display font-bold text-[36px] md:text-[52px] leading-[0.9]">We started because women deserve trips, not lectures.</h1>
      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-[#3D4A5E]">
        <p>TripNaari was born when our founder saw her own mother postpone a Kashmir dream for 20 years because “who will go with you?”. Instagram page @tripnaari began with 3 friends, now 33K+. 3000+ women have traveled—solo first timers, housewives, professionals, mothers with daughters, adventurous grandmothers.</p>
        <p>We’re not perfect. Public reviews praised safety but called out ops hiccups. So we built this website with transparent policies, hotel preview timelines, refund promises, and a real escalation matrix—not marketing.</p>
        <p>Every trip is handcrafted: women-led stays, women artisans, background-checked drivers, and a trip leader who stays with you from pickup to drop. We share what’s included, what’s not, and when you’ll know hotel name. No bait.</p>
        <p className="font-semibold text-[#13253D]">Travel fearless, Naari. We’ve got your back and your backpack.</p>
      </div>
      <div className="mt-10 grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6"><div className="font-bold text-[#FF4A7D]">3000+ women</div><div className="text-sm text-[#3D4A5E] mt-1">Traveled with us across Himalaya, South India, Desert, International</div></div>
        <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6"><div className="font-bold text-[#5B2063]">33K Instagram</div><div className="text-sm text-[#3D4A5E] mt-1">Community that validates, 2,109 real posts, not stock</div></div>
        <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6"><div className="font-bold text-[#13253D]">100% Women leaders</div><div className="text-sm text-[#3D4A5E] mt-1">Verified, first-aid trained, empowered to act instantly</div></div>
      </div>
    </div>
  );
}
