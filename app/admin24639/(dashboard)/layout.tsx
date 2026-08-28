import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // SECURITY: Server-side auth check using HMAC token with legacy fallback
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value || cookieStore.get("tripnaari_admin")?.value;
  
  const isValidToken = await verifyAdminToken(token);
  const isLegacyAuth = token === "authenticated";
  
  if (!isValidToken && !isLegacyAuth) {
    redirect("/admin24639/login");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
