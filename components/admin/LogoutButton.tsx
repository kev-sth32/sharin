"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";

export default function LogoutButton({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to log out of the admin panel?")) return;

    startTransition(() => {
      window.location.href = "/api/admin/logout";
    });
  };

  return (
    <a
      href="/api/admin/logout"
      onClick={handleLogout}
      className={`${className} ${isPending ? "opacity-50 pointer-events-none" : ""}`}
    >
      {isPending ? (
        <span className="flex items-center justify-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Logging out...</span>
        </span>
      ) : (
        children
      )}
    </a>
  );
}
