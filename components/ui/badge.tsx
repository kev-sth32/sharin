import { cn } from "@/lib/utils";

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "pink" | "plum" | "saffron" | "outline" }) {
  const variants = {
    default: "bg-[#13253D] text-white",
    pink: "bg-[#FFF0F4] text-[#FF4A7D] border border-[#FF4A7D]/20",
    plum: "bg-[#5B2063]/10 text-[#5B2063] border border-[#5B2063]/20",
    saffron: "bg-[#FFF6EF] text-[#FF8A2B] border border-[#FF8A2B]/20",
    outline: "bg-white border border-black/10 text-[#13253D]",
  };
  return <div className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase", variants[variant], className)} {...props} />;
}
