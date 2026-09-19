import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // SECURITY: Server-side auth check using HMAC JWT token
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!(await verifyAdminToken(token))) {
    redirect("/admin24639/login");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
