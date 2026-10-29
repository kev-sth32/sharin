import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { submitPaymentProof, getPaymentProofs } from "@/lib/payment-proofs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const quoteId = searchParams.get("quoteId");
  const utr = searchParams.get("utr");

  const all = await getPaymentProofs();
  if (quoteId) {
    const match = all.filter(p => p.quoteId === quoteId);
    return NextResponse.json({ success: true, proofs: match });
  }
  if (utr) {
    const match = all.find(p => p.utrNumber === utr);
    return NextResponse.json({ success: true, proof: match || null });
  }

  return NextResponse.json({ success: true, proofs: all.slice(0, 50) });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const quoteId = (formData.get("quoteId") as string) || undefined;
    const conversationIdStr = formData.get("conversationId") as string;
    const conversationId = conversationIdStr ? parseInt(conversationIdStr) : undefined;
    const customerName = formData.get("customerName") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const customerEmail = (formData.get("customerEmail") as string) || undefined;
    const tripTitle = (formData.get("tripTitle") as string) || "TripNaari Women-Only Tour";
    const tripSlug = (formData.get("tripSlug") as string) || undefined;
    const departureDate = (formData.get("departureDate") as string) || undefined;
    const travelersCountStr = formData.get("travelersCount") as string;
    const travelersCount = travelersCountStr ? parseInt(travelersCountStr) : 1;
    const amountPaidStr = formData.get("amountPaid") as string;
    const amountPaid = amountPaidStr ? parseInt(amountPaidStr) : 8000;
    const paymentType = (formData.get("paymentType") as "deposit" | "balance" | "full") || "deposit";
    const paymentMethod = (formData.get("paymentMethod") as "upi_qr" | "gpay" | "phonepe" | "bank_transfer") || "upi_qr";
    const utrNumber = formData.get("utrNumber") as string;
    const payerNotes = (formData.get("payerNotes") as string) || undefined;

    if (!customerName || !customerPhone || !utrNumber) {
      return NextResponse.json(
        { success: false, error: "Please provide your Name, Phone Number, and UPI UTR / Transaction Reference." },
        { status: 400 }
      );
    }

    // Process uploaded receipt file
    let proofImageUrl = "/uploads/proof-sample.jpg";
    const file = formData.get("receiptFile") as File | null;

    if (file && typeof file === "object" && file.size > 0) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "proofs");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileExt = path.extname(file.name) || ".jpg";
      const cleanFileName = `proof-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${fileExt}`;
      const savePath = path.join(uploadsDir, cleanFileName);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(savePath, buffer);
      proofImageUrl = `/uploads/proofs/${cleanFileName}`;
    }

    const newProof = await submitPaymentProof({
      quoteId,
      conversationId,
      customerName,
      customerPhone,
      customerEmail,
      tripTitle,
      tripSlug,
      departureDate,
      travelersCount,
      amountPaid,
      paymentType,
      paymentMethod,
      utrNumber: utrNumber.trim(),
      proofImageUrl,
      payerNotes,
    });

    return NextResponse.json({
      success: true,
      proof: newProof,
      message: "Payment proof submitted successfully! Verification usually takes 15–30 minutes."
    });
  } catch (err: any) {
    console.error("[Payment Proof Submit Exception]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to submit payment proof" },
      { status: 500 }
    );
  }
}
