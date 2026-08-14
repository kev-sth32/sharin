import { getAdminData } from "@/lib/admin-store";
import LeadersClient from "./LeadersClient";

export default async function LeadersAdmin() {
  const { tripLeaders } = await getAdminData();
  return <LeadersClient initialLeaders={tripLeaders} />;
}
