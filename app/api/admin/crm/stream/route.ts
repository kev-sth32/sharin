import { NextRequest } from "next/server";
import { crmEventEmitter, CRMMessageEvent } from "@/lib/crm-events";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection ACK
      const initAck = `event: connected\ndata: ${JSON.stringify({ message: "CRM SSE Stream Active", time: new Date().toISOString() })}\n\n`;
      controller.enqueue(encoder.encode(initAck));

      // Listener for live CRM events
      const onCrmEvent = (eventData: CRMMessageEvent) => {
        try {
          const sseFormatted = `event: crm_event\ndata: ${JSON.stringify(eventData)}\n\n`;
          controller.enqueue(encoder.encode(sseFormatted));
        } catch (err) {
          console.error("[SSE Stream Push Error]:", err);
        }
      };

      crmEventEmitter.on("crm_event", onCrmEvent);

      // Heartbeat ping every 15s to keep HTTP connection alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch (e) {
          clearInterval(pingInterval);
        }
      }, 15000);

      // Cleanup when client disconnects
      req.signal.addEventListener("abort", () => {
        crmEventEmitter.off("crm_event", onCrmEvent);
        clearInterval(pingInterval);
        try {
          controller.close();
        } catch (e) {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive"
    }
  });
}
