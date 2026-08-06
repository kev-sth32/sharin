import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import AIAssistant from "@/components/admin/AIAssistant";

const nav = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/leads", label: "Leads & CRM", icon: "💬" },
  { href: "/admin/trips", label: "Trip Packages", icon: "🎒" },
  { href: "/admin/departures", label: "Departures", icon: "📅" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "⭐" },
  { href: "/admin/leaders", label: "Trip Leaders", icon: "👩‍✈️" },
  { href: "/admin/blogs", label: "Blogs / Resources", icon: "📝" },
  { href: "/admin/faqs", label: "FAQs", icon: "❓" },
  { href: "/admin/policies", label: "Policies", icon: "📜" },
  { href: "/admin/gallery", label: "Gallery", icon: "🖼️" },
  { href: "/admin/contacts", label: "Contacts & Refunds", icon: "📥" },
  { href: "/admin/finance", label: "Finance Tracker", icon: "💵" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // SECURITY: Server-side auth check (defense in depth, middleware also checks)
  const cookieStore = await cookies();
  const auth = cookieStore.get("tripnaari_admin")?.value;
  if (auth !== "authenticated") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex">
      <aside className="w-[260px] shrink-0 bg-[#13253D] text-white hidden md:flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF4A7D] grid place-items-center font-black">TN</div>
            <div>
              <div className="font-bold leading-none">TripNaari</div>
              <div className="text-[10px] uppercase tracking-widest text-[#FF8A2B]">Admin CMS • Secure</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(n=>(
            <Link key={n.href} href={n.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/70 hover:bg-white/10 hover:text-white transition">
              <span>{n.icon}</span> {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="rounded-xl bg-white/10 p-3 text-[11px] leading-relaxed text-white/70">
            <strong className="text-white">Secure admin</strong><br/>
            HttpOnly cookie • 8h expiry • Rate limited login • File type validation • PG ready
          </div>
          <div className="flex gap-2">
            <Link href="/" className="flex-1 rounded-full bg-white/10 text-center py-2 text-xs">View Site</Link>
            <LogoutButton className="flex-1 rounded-full bg-[#FF4A7D] text-center py-2 text-xs font-bold">Logout</LogoutButton>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden bg-[#13253D] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <Link href="/admin" className="font-bold">TripNaari Admin • Secure</Link>
          <div className="flex gap-2">
            <Link href="/" className="text-xs bg-white/10 rounded-full px-3 py-1.5">Site</Link>
            <LogoutButton className="text-xs bg-[#FF4A7D] rounded-full px-3 py-1.5">Logout</LogoutButton>
          </div>
        </div>
        <div className="md:hidden border-b border-[#F1D9D0] bg-white px-2 py-2 flex gap-2 overflow-x-auto">
          {nav.map(n=>(
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-full border border-[#F1D9D0] bg-white px-3 py-1.5 text-xs">{n.icon} {n.label}</Link>
          ))}
        </div>
        <main className="p-4 md:p-8">{children}</main>
        <AIAssistant />
      </div>
    </div>
  );
}
