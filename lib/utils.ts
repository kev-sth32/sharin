import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function generateSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function truncate(str: string, len: number) {
  if (str.length <= len) return str;
  return str.slice(0, len) + "...";
}

export function openEnquiryModal(destination?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-enquiry-modal", { detail: { destination } }));
  }
}

export const locationMap: Record<string, string> = {
  kashmir: "Kashmir, India",
  kerala: "Kerala, India",
  meghalaya: "Meghalaya, India",
  rajasthan: "Rajasthan, India",
  himachal: "Himachal, India",
  goa: "Goa & Gokarna, India",
  "northeast-india": "Northeast, India",
  "varanasi-ayodhya-prayagraj": "Varanasi, India",
  nepal: "Nepal",
  international: "Bali, Indonesia"
};
