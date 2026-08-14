import { getAdminData, getTransactions } from "@/lib/admin-store";
import FinanceManager from "@/components/admin/FinanceManager";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const adminData = await getAdminData();
  const allTransactions = await getTransactions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl text-[#13253D]">Finance CRM Tracker</h1>
        <p className="text-xs text-[#3D4A5E] mt-1">
          Monitor margins, manage payables/receivables, inspect visual category graphs, and edit or record ledger transactions in real-time.
        </p>
      </div>

      <FinanceManager 
        initialTransactions={allTransactions} 
        trips={adminData.trips} 
      />
    </div>
  );
}

