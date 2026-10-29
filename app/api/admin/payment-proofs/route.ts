import { NextRequest, NextResponse } from "next/server";
import { getPaymentProofs, verifyPaymentProof, rejectPaymentProof } from "@/lib/payment-proofs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";

    const proofs = await getPaymentProofs(status);
    return NextResponse.json({ success: true, proofs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to fetch proofs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, proofId, adminName, adminNotes, reason } = body;

    if (!proofId) {
      return NextResponse.json({ error: "Missing proofId" }, { status: 400 });
    }

    if (action === "verify") {
      const result = await verifyPaymentProof(
        Number(proofId),
        adminName || "TripNaari Finance Desk",
        adminNotes
      );
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully! Boarding pass issued and WhatsApp confirmation sent.",
        proof: result.proof,
        pass: result.pass,
      });
    }

    if (action === "reject") {
      if (!reason) {
        return NextResponse.json({ error: "Please provide a rejection reason" }, { status: 400 });
      }
      const result = await rejectPaymentProof(
        Number(proofId),
        reason,
        adminName || "TripNaari Finance Desk"
      );
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: "Proof marked rejected. WhatsApp notification sent to customer.",
        proof: result.proof,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("[Admin Payment Proofs Error]:", err);
    return NextResponse.json({ success: false, error: err?.message || "Internal server error" }, { status: 500 });
  }
}
