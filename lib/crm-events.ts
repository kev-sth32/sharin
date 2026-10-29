import { EventEmitter } from "events";

// Global event bus for real-time CRM updates across server requests
class CRMEventEmitter extends EventEmitter {}

// Prevent multiple instances in development fast refresh
const globalForCRM = globalThis as unknown as { crmEventEmitter?: CRMEventEmitter };

export const crmEventEmitter = globalForCRM.crmEventEmitter || new CRMEventEmitter();

// Always persist singleton on globalThis to survive module re-imports in both dev and prod
globalForCRM.crmEventEmitter = crmEventEmitter;

export interface CRMMessageEvent {
  type: 
    | "new_message" 
    | "status_change" 
    | "human_escalation" 
    | "lead_created"
    | "payment_proof_submitted"
    | "payment_proof_verified"
    | "payment_proof_rejected"
    | "passenger_checked_in"
    | "balance_reminder_sent";
  conversationId: number;
  channel: "instagram" | "whatsapp" | "website_chat";
  customerName?: string;
  messageText?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export function broadcastCrmEvent(event: CRMMessageEvent) {
  try {
    crmEventEmitter.emit("crm_event", event);
  } catch (err) {
    console.error("[CRM Event Broadcast Error]:", err);
  }
}
