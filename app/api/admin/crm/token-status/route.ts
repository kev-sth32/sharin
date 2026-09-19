import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req?: NextRequest) {
  // SECURITY: Only admins should see token status
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!(await verifyAdminToken(token))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const igToken = process.env.META_PAGE_ACCESS_TOKEN;
  const webhookSecret = process.env.META_WEBHOOK_VERIFY_TOKEN;
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const nvidiaKey = process.env.NVIDIA_API_KEY;

  const hasWaToken = !!(waToken && waToken !== "your_key_here");
  const hasWaPhone = !!(waPhoneId && waPhoneId !== "your_key_here");
  const hasIgToken = !!(igToken && igToken !== "your_key_here");
  const hasWebhookSecret = !!(webhookSecret);
  const hasGemini = !!(geminiKey && geminiKey !== "your_key_here");
  const hasNvidia = !!(nvidiaKey && nvidiaKey !== "your_key_here");

  let overallStatus: "healthy" | "warning" | "sandbox" = "sandbox";

  if (hasWaToken && hasIgToken) {
    overallStatus = "healthy";
  } else if (hasWaToken || hasIgToken || hasGemini || hasNvidia) {
    overallStatus = "warning";
  }

  return NextResponse.json({
    success: true,
    status: overallStatus,
    channels: {
      whatsapp: {
        configured: hasWaToken && hasWaPhone,
        status: hasWaToken ? "Active Token" : "Mock / Sandbox Mode",
        phoneId: hasWaPhone ? `${waPhoneId!.slice(0, 4)}...${waPhoneId!.slice(-4)}` : "Not Set"
      },
      instagram: {
        configured: hasIgToken,
        status: hasIgToken ? "Active Meta Token" : "Mock / Sandbox Mode"
      },
      webhook: {
        configured: hasWebhookSecret,
        // NOTE: The actual token is NOT returned here for security
        status: hasWebhookSecret ? "Configured" : "Not Set"
      },
      aiEngine: {
        primary: hasNvidia ? "Nvidia NIM (Llama 3.2)" : (hasGemini ? "Google Gemini 1.5 Flash" : "Smart Rule Engine"),
        nvidiaActive: hasNvidia,
        geminiActive: hasGemini,
        fallbackActive: true
      }
    },
    checkedAt: new Date().toISOString()
  });
}
