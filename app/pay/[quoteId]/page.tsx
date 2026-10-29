import PaymentPortal from "@/components/payment/PaymentPortal";
import { getQuoteById } from "@/lib/sales-engine";

export const metadata = {
  title: "Official Quotation & Payment | TripNaari Women Travel",
  description: "Secure payment & reservation portal for your TripNaari trip quotation.",
};

interface QuotePayPageProps {
  params: Promise<{ quoteId: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function QuotePayPage({ params, searchParams }: QuotePayPageProps) {
  const { quoteId } = await params;
  const sp = await searchParams;

  const savedQuote = getQuoteById(quoteId);

  const tripTitle = savedQuote?.tripTitle || (sp.trip ? sp.trip.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) : "Kashmir Blossom Sisterhood");
  const tripSlug = savedQuote?.tripSlug || sp.trip || "kashmir-blossom-sisterhood";
  const travelers = savedQuote?.travelersCount || (sp.travelers ? parseInt(sp.travelers) : 1);
  const deposit = savedQuote?.depositAmount || (sp.deposit ? parseInt(sp.deposit) : 8000);
  const total = savedQuote?.totalPrice || (sp.total ? parseInt(sp.total) : 32999);
  const departureDate = savedQuote?.departureDate || sp.departure || "Upcoming 2026 Batch";
  const paymentType = (sp.type as "deposit" | "balance" | "full") || "deposit";

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8">
      <PaymentPortal
        initialQuoteId={quoteId}
        initialTripTitle={tripTitle}
        initialTripSlug={tripSlug}
        initialTravelers={travelers}
        initialTotal={total}
        initialDeposit={deposit}
        initialDepartureDate={departureDate}
        initialPaymentType={paymentType}
      />
    </div>
  );
}
