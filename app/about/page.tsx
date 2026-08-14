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
            TripNaari — Where Women Choose Themselves
          </h1>
        </div>

        {/* Story Text */}
        <div className="space-y-6 text-[16px] md:text-[17px] leading-relaxed text-[#3D4A5E] border-b border-[#F1D9D0]/50 pb-12">
          <p>
            Six years ago, TripNaari began with a simple observation.
          </p>
          <p>
            So many women dreamed of travelling, yet their dreams remained packed away in the corners of their lives. They wanted to see the mountains, walk through new cities, watch the sunrise by the sea, visit temples, forests, and hidden villages — but something always stood in the way.
          </p>
          
          <ul className="space-y-2 pl-4 border-l-2 border-[#FF4A7D]/40 text-[#4A5568] italic my-4">
            <li>• A companion who was never free.</li>
            <li>• A family that was not yet convinced.</li>
            <li>• A fear of travelling alone.</li>
            <li>• Or the quiet belief that their own dreams could wait a little longer.</li>
          </ul>

          <p>
            Again and again, we heard the same words:
          </p>

          <blockquote className="border-l-4 border-[#FF4A7D] pl-4 my-6 text-[20px] font-display font-medium italic text-[#13253D]">
            “I want to travel… but I have no one to go with.”
          </blockquote>

          <p>
            And behind those words was an even deeper truth: many women were waiting for someone else before choosing themselves.
          </p>
          <p className="font-bold text-[#13253D]">
            TripNaari was born to change that.
          </p>
          <p>
            We did not start as a travel company with big offices or grand plans. We started with a small group of women, one carefully planned journey, and a belief that travel becomes extraordinary when women feel safe, supported, and free to choose themselves.
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
