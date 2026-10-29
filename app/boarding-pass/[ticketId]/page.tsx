import { notFound } from "next/navigation";
import BoardingPassCard from "@/components/pass/BoardingPassCard";
import { getTripPassByTicketId, createTripPass } from "@/lib/trip-passes";

export const metadata = {
  title: "Digital Boarding Pass & QR Ticket | TripNaari",
  description: "Official confirmed boarding pass and gate check-in pass for TripNaari travelers.",
};

interface BoardingPassPageProps {
  params: Promise<{ ticketId: string }>;
}

export default async function BoardingPassPage({ params }: BoardingPassPageProps) {
  const { ticketId } = await params;

  let pass = await getTripPassByTicketId(ticketId);

  // If pass doesn't exist yet (e.g. testing URL directly), generate an instant demo pass
  if (!pass) {
    if (ticketId.startsWith("TN-PASS-") || ticketId.startsWith("DEMO-")) {
      pass = await createTripPass({
        tripTitle: "Kashmir Blossom Sisterhood",
        tripSlug: "kashmir-blossom-sisterhood",
        passengerName: "Roshni Patel",
        passengerPhone: "+91 98201 44521",
        departureDate: "18 Nov 2026",
        travelersCount: 2,
        totalAmount: 32000,
        depositPaid: 16000,
      });
    } else {
      notFound();
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8">
      <BoardingPassCard pass={pass} />
    </div>
  );
}
