import { getAdminData } from "@/lib/admin-store";
import TestimonialsManager from "@/components/admin/TestimonialsManager";

export default async function TestimonialsAdmin() {
  const { testimonials } = await getAdminData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl text-[#13253D]">Testimonials — Moderate & Feature</h1>
        <p className="text-xs text-[#3D4A5E] mt-1">Approve/hide testimonials, edit locations/quotes, add custom feedback, delete duplicates.</p>
      </div>
      <TestimonialsManager initialTestimonials={testimonials} />
    </div>
  );
}
