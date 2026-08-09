"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import AIAssistant from "@/components/admin/AIAssistant";
import { Menu, X } from "lucide-react";

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

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar drawer automatically when navigating to a new route
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex relative overflow-x-hidden">
      
      {/* 1. Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/55 z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. Sidebar Container (Slide-over drawer on mobile, static on desktop) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#13253D] text-white flex flex-col h-full overflow-y-auto scrollbar-none transition-transform duration-300 md:translate-x-0 md:static md:h-screen md:sticky md:top-0 ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:flex"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF4A7D] grid place-items-center font-black">TN</div>
            <div>
              <div className="font-bold leading-none">TripNaari</div>
              <div className="text-[10px] uppercase tracking-widest text-[#FF8A2B] mt-0.5">Admin CMS • Secure</div>
            </div>
          </Link>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation links */}
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => {
            const isActive = pathname === n.href;
            return (
              <Link 
                key={n.href} 
                href={n.href} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  isActive 
                    ? "bg-[#FF4A7D] text-white font-bold" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{n.icon}</span> 
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer area */}
        <div className="p-4 border-t border-white/10 space-y-3 shrink-0">
          <div className="rounded-xl bg-white/5 p-3 text-[11px] leading-relaxed text-white/60">
            <strong className="text-white font-semibold">Secure Admin</strong><br/>
            HttpOnly cookie • 8h expiry • Rate limited login • File type validation • PG ready
          </div>
          <div className="flex gap-2">
            <Link href="/" className="flex-1 rounded-full bg-white/10 text-center py-2 text-xs hover:bg-white/15 transition">View Site</Link>
            <LogoutButton className="flex-1 rounded-full bg-[#FF4A7D] text-center py-2 text-xs font-bold hover:bg-[#e63e6e] transition">Logout</LogoutButton>
          </div>
        </div>
      </aside>

      {/* 3. Main Dashboard Wrapper */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Mobile Header Bar */}
        <div className="md:hidden bg-[#13253D] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition"
              title="Open menu"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            <Link href="/admin" className="font-bold text-sm tracking-wide">TripNaari Admin</Link>
          </div>
          <div className="flex gap-2 items-center">
            <Link href="/" className="text-[11px] bg-white/10 rounded-full px-3 py-1.5 hover:bg-white/15 transition">Site</Link>
            <LogoutButton className="text-[11px] bg-[#FF4A7D] rounded-full px-3 py-1.5 hover:bg-[#e63e6e] transition">Logout</LogoutButton>
          </div>
        </div>

        {/* Desktop Header Navigation shortcuts */}
        <div className="md:hidden border-b border-[#F1D9D0] bg-white px-2 py-2 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
          {nav.map((n) => (
            <Link 
              key={n.href} 
              href={n.href} 
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                pathname === n.href
                  ? "border-[#FF4A7D] bg-[#FFF0F4] text-[#FF4A7D]"
                  : "border-[#F1D9D0] bg-white text-[#3D4A5E] hover:bg-[#FFF8F0]"
              }`}
            >
              {n.icon} {n.label}
            </Link>
          ))}
        </div>

        {/* Main Content Body */}
        <main className="p-4 md:p-8 flex-1 bg-[#FFF8F0]">
          {children}
        </main>
        
        <AIAssistant />
      </div>
    </div>
  );
}
