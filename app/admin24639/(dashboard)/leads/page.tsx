import { getAdminData } from "@/lib/admin-store";
import LeadsCRM from "@/components/admin/LeadsCRM";

export default async function LeadsAdmin() {
  const { leads } = await getAdminData();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-[#13253D]">Leads CRM — Control Pipeline</h1>
        <p className="text-xs text-[#3D4A5E] mt-1">
          Search, sort, filter, and track leads in real-time. Changes write to database (or .data/leads.json fallback).
        </p>
      </div>

      <LeadsCRM initialLeads={leads} />
    </div>
  );
}

