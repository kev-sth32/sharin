import { getPolicies } from "@/lib/admin-store";
import PoliciesManager from "@/components/admin/PoliciesManager";

export default async function PoliciesAdmin() {
  const policies = await getPolicies();

  return (
    <div className="space-y-6">
      <PoliciesManager initialPolicies={policies} />
    </div>
  );
}
