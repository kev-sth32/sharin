import { Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactSection() {
  const contacts = [
    {
      icon: Phone,
      title: "Call Us",
      value: (
        <div className="flex flex-col gap-1 text-[15px] font-bold text-[#FF4A7D]">
          <a href="tel:+919282794457" className="hover:underline">+91 92827 94457</a>
          <a href="tel:+919282696757" className="hover:underline">+91 92826 96757</a>
        </div>
      ),
      desc: "Emergency line active 24x7 for ongoing trips.",
      btnText: "Call Now",
      href: "tel:+919282794457",
    },
    {
      icon: Mail,
      title: "Email Us",
      value: (
        <div className="flex flex-col gap-1 text-[15px] font-bold text-[#FF4A7D] break-all">
          <a href="mailto:info@tripnaari.com" className="hover:underline">info@tripnaari.com</a>
          <a href="mailto:viatripnaari@gmail.com" className="hover:underline">viatripnaari@gmail.com</a>
        </div>
      ),
      desc: "Response within 24 hours guaranteed.",
      btnText: "Email Us",
      href: "mailto:info@tripnaari.com",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Chat",
      value: (
        <a href="https://wa.me/919282794457" target="_blank" rel="noopener noreferrer" className="text-[15px] font-bold text-[#FF4A7D] hover:underline">
          +91 92827 94457
        </a>
      ),
      desc: "Instant responses from 10 AM to 8 PM.",
      btnText: "Chat Now",
      href: "https://wa.me/919282794457",
    },
  ];

  return (
    <section className="bg-[#FFF8F0] py-12 md:py-16 lg:py-20 xl:py-24">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D] mb-4">
            Contact Us
          </div>
          <h2 className="font-display font-[800] text-[28px] sm:text-[36px] lg:text-[42px] xl:text-[48px] leading-[1.05] text-[#13253D]">
            Connect With TripNaari
          </h2>
          <p className="mt-4 text-[16px] md:text-[17px] leading-relaxed text-[#3D4A5E]">
            Have questions or need help planning? Reach out to our dedicated support team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contacts.map((c, idx) => (
            <div key={idx} className="bg-white border border-[#F1D9D0] rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_10px_35px_-8px_rgba(19,37,61,0.05)]">
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-[#FFF0F4] border border-[#FF4A7D]/10 flex items-center justify-center text-[#FF4A7D] mb-6">
                <c.icon className="w-6 h-6" />
              </div>

              <h3 className="font-display font-[800] text-[20px] text-[#13253D] mb-2">
                {c.title}
              </h3>
              <div className="mb-3 min-h-[48px] flex items-center justify-center">
                {c.value}
              </div>
              <p className="text-[13px] text-[#3D4A5E] mb-6 leading-relaxed">
                {c.desc}
              </p>

              <a href={c.href} target={c.title === "WhatsApp Chat" ? "_blank" : undefined} rel={c.title === "WhatsApp Chat" ? "noopener noreferrer" : undefined} className="w-full mt-auto">
                <Button className="w-full bg-[#FF4A7D] hover:bg-[#E63E6E] text-white rounded-full font-semibold">
                  {c.btnText}
                </Button>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
