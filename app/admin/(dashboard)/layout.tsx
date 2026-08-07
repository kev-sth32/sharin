import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // SECURITY: Server-side auth check (defense in depth, middleware also checks)
  const cookieStore = await cookies();
  const auth = cookieStore.get("tripnaari_admin")?.value;
  if (auth !== "authenticated") {
    redirect("/admin/login");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
