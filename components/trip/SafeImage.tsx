"use client";

import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  containerClassName: string;
  imageClassName?: string;
}

export default function SafeImage({ src, alt, containerClassName, imageClassName }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    // Retain only positioning and sizing classes (aspect, rounded, h, w, lg:h)
    // Remove shadow, border, and white backgrounds to make it blend completely with page background
    const cleanClassName = containerClassName
      .split(" ")
      .filter((cls) => {
        const c = cls.toLowerCase();
        return (
          !c.startsWith("border") &&
          !c.startsWith("shadow") &&
          !c.includes("bg-white")
        );
      })
      .join(" ") + " border-none bg-transparent shadow-none";

    return <div className={cleanClassName} />;
  }

  return (
    <div className={containerClassName}>
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className={imageClassName}
      />
    </div>
  );
}
