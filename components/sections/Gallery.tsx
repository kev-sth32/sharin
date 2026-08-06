import { getHomepageGallery } from "@/lib/public-store";
import GalleryClient from "./GalleryClient";

export default function Gallery() {
  const images = getHomepageGallery();
  return <GalleryClient images={images} />;
}
