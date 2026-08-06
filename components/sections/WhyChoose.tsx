export default function WhyChoose() {
  return (
    <section className="bg-[#FFF8F0] py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D]">
              Why TripNaari
            </div>
            <h2 className="font-display font-[800] text-[36px] md:text-[48px] leading-[1.05] text-[#13253D]">
              A Travel Community Built Around Women, Safety & Connection
            </h2>
            <p className="text-[16px] md:text-[17px] leading-relaxed text-[#3D4A5E] text-balance">
              TripNaari isn't just about visiting new places; it's about the people you meet. Our trips are designed to foster deep connections between like-minded female travellers, while keeping safety at the forefront of everything we do.
            </p>
          </div>

          {/* Right Image with custom asymmetric curves */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[480px] aspect-[4/3] md:aspect-[1.1] overflow-hidden rounded-tl-[80px] rounded-br-[80px] shadow-2xl border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80" 
                alt="Women travel community" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

