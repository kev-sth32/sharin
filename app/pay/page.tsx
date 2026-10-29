import PaymentPortal from "@/components/payment/PaymentPortal";

export const metadata = {
  title: "Pay & Verify Reservation | TripNaari Women Travel",
  description: "Official payment portal for TripNaari tours. Pay via zero-fee UPI QR, GPay, or Net Banking and submit payment verification.",
};

interface PayPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function PayPage({ searchParams }: PayPageProps) {
  const sp = await searchParams;

  const quoteId = sp.quoteId || "TN-RESERVE-2026";
  const tripTitle = sp.trip ? sp.trip.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Kashmir Blossom Sisterhood";
  const tripSlug = sp.trip || "kashmir-blossom-sisterhood";
  const travelers = sp.travelers ? parseInt(sp.travelers) : 1;
  const deposit = sp.deposit ? parseInt(sp.deposit) : 8000;
  const total = sp.total ? parseInt(sp.total) : 32999;
  const departureDate = sp.departure || "Upcoming 2026 Batch";
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
