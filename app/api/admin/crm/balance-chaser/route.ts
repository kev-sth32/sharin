import { NextRequest, NextResponse } from "next/server";
import { getBalanceDueBookings, sendBalanceReminder, runAutomatedBalanceChaser } from "@/lib/balance-chaser";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getBalanceDueBookings();
    return NextResponse.json({ success: true, bookings: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to fetch balance records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ticketId, customAmount, dueDate } = body;

    if (action === "send_single") {
      if (!ticketId) {
        return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
      }

      const res = await sendBalanceReminder(ticketId, {
        customAmount: customAmount ? Number(customAmount) : undefined,
        dueDate,
      });

      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Balance payment reminder dispatched via WhatsApp!",
        previewText: res.messageText,
      });
    }

    if (action === "run_all") {
      const result = await runAutomatedBalanceChaser();
      return NextResponse.json({
        success: true,
        message: `Processed ${result.processedCount} balance payment reminders.`,
        reminders: result.reminders,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Internal server error" }, { status: 500 });
  }
}
