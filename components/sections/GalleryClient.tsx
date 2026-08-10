"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface GalleryImage {
  src: string;
  alt: string;
  category?: string;
}

interface GalleryClientProps {
  images: GalleryImage[];
}

export default function GalleryClient({ images }: GalleryClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Categorize images dynamically if category doesn't exist
  const processedImages = images.map((img, idx) => {
    let category = img.category;
    if (!category) {
      const altL = (img.alt || "").toLowerCase();
      if (
        altL.includes("beach") ||
        altL.includes("lake") ||
        altL.includes("ocean") ||
        altL.includes("sea") ||
        altL.includes("gokarna") ||
        altL.includes("kerala") ||
        altL.includes("sunset")
      ) {
        category = "Destinations";
      } else if (
        altL.includes("trek") ||
        altL.includes("adventure") ||
        altL.includes("waterfall") ||
        altL.includes("mountain") ||
        altL.includes("spiti") ||
        altL.includes("map") ||
        altL.includes("camera")
      ) {
        category = "Adventure";
      } else {
        category = "Moments";
      }
    }
    return { ...img, category };
  });

  const filteredImages = processedImages;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <section className="bg-[#FFF8F0] py-12 md:py-16 lg:py-20 xl:py-24 border-t border-[#F1D9D0]/30">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-[12px] font-extrabold tracking-[0.2em] uppercase text-[#FF4A7D] mb-4">
            Our Gallery
          </div>
          <h2 className="font-display font-[800] text-[28px] sm:text-[36px] lg:text-[42px] xl:text-[48px] leading-[1.05] text-[#13253D]">
            Moments That Capture Our Journey
          </h2>
          <p className="mt-4 text-[15px] md:text-[16px] leading-relaxed text-[#3D4A5E] font-medium">
            Real stories, real connections, and fearless female travelers exploring the world together.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredImages.map((img: any, idx: number) => (
            <div
              key={idx}
              onClick={() => setLightboxIndex(idx)}
              className="group aspect-[4/3] overflow-hidden rounded-[32px] cursor-pointer relative shadow-sm hover:shadow-lg border border-[#F1D9D0]/30 bg-white transition-all duration-300"
            >
              <img
                src={img.src}
                alt={img.alt || "Gallery Image"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#13253D]/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="self-start text-[9px] uppercase font-bold tracking-widest bg-[#FF4A7D] text-white px-2.5 py-1 rounded-full mb-2">
                  {img.category}
                </span>
                <p className="text-white text-sm font-bold leading-tight line-clamp-2">
                  {img.alt || "TripNaari Experience"}
                </p>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 text-white/90 hover:text-white transition-all scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100 duration-300">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="rounded-[32px] bg-white border border-[#F1D9D0] p-12 text-center text-sm font-semibold text-[#3D4A5E]">
            No moments found in this category.
          </div>
        )}
      </div>

      {/* Immersive Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between py-6 animate-in fade-in duration-300"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 text-white w-full">
            <span className="text-xs font-bold tracking-wider opacity-60">
              {lightboxIndex + 1} of {filteredImages.length}
            </span>
            <button
              onClick={() => setLightboxIndex(null)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content (Image & Navigation) */}
          <div className="flex-1 flex items-center justify-between px-4 max-w-[1280px] mx-auto w-full relative">
            
            {/* Prev Arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-[#FF4A7D] text-white flex items-center justify-center transition-all hover:scale-105 border border-white/10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Img Container */}
            <div className="w-full h-[70vh] flex items-center justify-center p-4">
              <img
                src={filteredImages[lightboxIndex].src}
                alt={filteredImages[lightboxIndex].alt}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Next Arrow */}
            <button
              onClick={handleNext}
              className="absolute right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-[#FF4A7D] text-white flex items-center justify-center transition-all hover:scale-105 border border-white/10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Bar Caption */}
          <div className="text-center px-6 text-white max-w-2xl mx-auto w-full">
            <span className="inline-block text-[9px] uppercase font-bold tracking-widest bg-[#FF4A7D] text-white px-2.5 py-1 rounded-full mb-2.5">
              {filteredImages[lightboxIndex].category}
            </span>
            <p className="text-sm font-semibold leading-relaxed text-white/90">
              {filteredImages[lightboxIndex].alt || "TripNaari Experience"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
