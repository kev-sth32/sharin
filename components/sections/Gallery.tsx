import { getHomepageGallery } from "@/lib/public-store";

export default function Gallery() {
  const images = getHomepageGallery();

  const layoutClasses = [
    "row-span-2 col-span-1",
    "col-span-1 aspect-square",
    "row-span-2 col-span-1",
    "col-span-1 aspect-video md:aspect-[3/4]",
    "col-span-1 aspect-video",
    "col-span-1 aspect-video",
  ];


  return (
    <section className="bg-[#FFF8F0] py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D] mb-4">
            Our Gallery
          </div>
          <h2 className="font-display font-[800] text-[36px] md:text-[48px] leading-[1.05] text-[#13253D]">
            Moments That Capture Our Journey
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {images.map((img: any, idx: number) => (
            <div 
              key={idx} 
              className={`relative overflow-hidden rounded-[32px] shadow-md group ${layoutClasses[idx % layoutClasses.length]}`}
            >
              <img 
                src={img.src} 
                alt={img.alt || "Gallery Image"} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
