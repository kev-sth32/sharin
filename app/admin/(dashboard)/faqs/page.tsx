import { getFAQs } from "@/lib/admin-store";
import FAQsManager from "@/components/admin/FAQsManager";

export default async function FAQsAdmin() {
  const faqs = await getFAQs();

  return (
    <div className="space-y-6">
      <FAQsManager initialFaqs={faqs} />
    </div>
  );
}
