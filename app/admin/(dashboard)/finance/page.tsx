import { getAdminData, getTransactions, saveTransaction, deleteTransaction } from "@/lib/admin-store";
import { formatINR } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import ConfirmButton from "@/components/admin/ConfirmButton";
import ConfirmForm from "@/components/admin/ConfirmForm";

export const dynamic = "force-dynamic";

const categories = {
  revenue: ["Trip Bookings", "Custom Private Trips", "Sponsorships", "Other Revenue"],
  expense: ["Hotel Bookings", "Transport Cost", "Trip Leader Payout", "Marketing / Ads", "Office / Admin", "Refunds Paid", "Other Expense"]
};

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ type?: string; category?: string; trip?: string; q?: string }> }) {
  const params = await searchParams;
  const adminData = await getAdminData();
  const allTransactions = await getTransactions();
  
  // Filter logic
  let filteredTransactions = [...allTransactions];
  if (params.type) {
    filteredTransactions = filteredTransactions.filter(tx => tx.type === params.type);
  }
  if (params.category) {
    filteredTransactions = filteredTransactions.filter(tx => tx.category === params.category);
  }
  if (params.trip) {
    filteredTransactions = filteredTransactions.filter(tx => tx.tripSlug === params.trip);
  }
  if (params.q) {
    const query = params.q.toLowerCase();
    filteredTransactions = filteredTransactions.filter(tx => 
      tx.description?.toLowerCase().includes(query) || 
      tx.category?.toLowerCase().includes(query)
    );
  }

  // Active filters query construction
  const getFilterUrl = (type?: string, category?: string, trip?: string, q?: string) => {
    const urlParams = new URLSearchParams();
    if (type || params.type) urlParams.set("type", type || params.type || "");
    if (category || params.category) urlParams.set("category", category || params.category || "");
    if (trip || params.trip) urlParams.set("trip", trip || params.trip || "");
    if (q || params.q) urlParams.set("q", q || params.q || "");
    
    // Clear elements if specified as empty
    if (type === "") urlParams.delete("type");
    if (category === "") urlParams.delete("category");
    if (trip === "") urlParams.delete("trip");
    if (q === "") urlParams.delete("q");
    
    return `/admin/finance?${urlParams.toString()}`;
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-[#13253D]">Finance Tracker</h1>
        <p className="text-xs text-[#3D4A5E] mt-1">Track company margins, payouts, trip bookings, and overheads dynamically. In-memory fallback persistence is active.</p>
      </div>

      {/* Finance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#3D4A5E]/60">Total Revenue</div>
          <div className="text-3xl font-black text-green-600 mt-2">{formatINR(adminData.stats.totalRevenue || 0)}</div>
          <div className="text-[11px] text-green-700/80 mt-1">↑ Invoiced bookings & payments</div>
        </div>

        <div className="rounded-2xl bg-[#FFF0F4] border border-[#FF4A7D]/15 p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#FF4A7D]">Total Expenses</div>
          <div className="text-3xl font-black text-red-600 mt-2">{formatINR(adminData.stats.totalExpenses || 0)}</div>
          <div className="text-[11px] text-red-700/80 mt-1">↓ Vendors, Hotels, Leaders, and Refunds</div>
        </div>

        <div className="rounded-2xl bg-[#FFF8F0] border border-[#FF8A2B]/20 p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#FF8A2B]">Net Margin (Profit/Loss)</div>
          <div className={`text-3xl font-black mt-2 ${(adminData.stats.netProfit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatINR(adminData.stats.netProfit || 0)}
          </div>
          <div className="text-[11px] text-[#3D4A5E] mt-1">
            Margin percentage: {adminData.stats.totalRevenue ? Math.round(((adminData.stats.netProfit || 0) / adminData.stats.totalRevenue) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* left: logs and list */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters card */}
          <div className="rounded-2xl bg-white border border-[#F1D9D0] p-5 shadow-sm">
            <h3 className="font-semibold text-[#13253D] text-sm">Filter Transactions</h3>
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <Link href={getFilterUrl("", "", "")} className={`rounded-full px-3 py-1.5 text-xs border ${!params.type && !params.category && !params.trip ? "bg-[#13253D] text-white" : "bg-[#FFF8F0] text-[#13253D] border-[#F1D9D0]"}`}>
                All ({allTransactions.length})
              </Link>
              
              <Link href={getFilterUrl("revenue", "", "")} className={`rounded-full px-3 py-1.5 text-xs border ${params.type === "revenue" && !params.category ? "bg-green-600 text-white" : "bg-[#FFF8F0] text-[#13253D] border-[#F1D9D0]"}`}>
                Revenue
              </Link>
              <Link href={getFilterUrl("expense", "", "")} className={`rounded-full px-3 py-1.5 text-xs border ${params.type === "expense" && !params.category ? "bg-red-600 text-white" : "bg-[#FFF8F0] text-[#13253D] border-[#F1D9D0]"}`}>
                Expenses
              </Link>

              {/* Trip filter select & Search */}
              <div className="ml-auto flex gap-2 items-center">
                {/* Search Form */}
                <form method="GET" action="/admin/finance" className="flex items-center gap-1.5 border-r border-[#F1D9D0] pr-3 mr-1">
                  {params.type && <input type="hidden" name="type" value={params.type} />}
                  {params.category && <input type="hidden" name="category" value={params.category} />}
                  {params.trip && <input type="hidden" name="trip" value={params.trip} />}
                  <input 
                    type="text" 
                    name="q" 
                    placeholder="Search name/desc..." 
                    defaultValue={params.q || ""} 
                    className="rounded-full border border-[#F1D9D0] bg-[#FFF8F0] px-3.5 py-1.5 text-xs outline-none w-40 focus:border-[#FF4A7D]/40 transition"
                  />
                  <button type="submit" className="rounded-full bg-[#13253D] hover:bg-[#203753] text-white px-3 py-1.5 text-[10px] font-bold transition">Search</button>
                </form>

                {/* Trip Form */}
                <form method="GET" action="/admin/finance" className="flex items-center gap-1.5">
                  {params.type && <input type="hidden" name="type" value={params.type} />}
                  {params.category && <input type="hidden" name="category" value={params.category} />}
                  {params.q && <input type="hidden" name="q" value={params.q} />}
                  <select 
                    name="trip" 
                    defaultValue={params.trip || ""} 
                    className="rounded-full border border-[#F1D9D0] bg-[#FFF8F0] px-3 py-1.5 text-xs outline-none bg-transparent"
                  >
                    <option value="">All Trips</option>
                    {adminData.trips.map(t => (
                      <option key={t.slug} value={t.slug}>{t.title}</option>
                    ))}
                  </select>
                  <button type="submit" className="rounded-full bg-[#13253D] hover:bg-[#203753] text-white px-3 py-1.5 text-[10px] font-bold transition">Filter</button>
                </form>
                {(params.type || params.category || params.trip || params.q) && (
                  <Link href="/admin/finance" className="text-xs text-[#FF4A7D] hover:underline flex items-center font-bold px-2">Clear ×</Link>
                )}
              </div>
            </div>
          </div>

          {/* List transactions */}
          <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6 shadow-sm overflow-hidden">
            <h3 className="font-semibold text-[#13253D] mb-4">Transaction Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#FFF8F0] text-[10px] uppercase text-[#3D4A5E]/60 tracking-wider">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Trip Association</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1D9D0]/50">
                  {filteredTransactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-[#FFF8F0]/20 transition align-middle">
                      <td className="p-3 text-xs whitespace-nowrap text-[#3D4A5E]">{tx.date}</td>
                      <td className="p-3 text-xs font-semibold text-[#13253D]">
                        {tx.description}
                      </td>
                      <td className="p-3 text-xs">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${tx.type === "revenue" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-[#3D4A5E] italic">
                        {tx.tripSlug ? adminData.trips.find(t => t.slug === tx.tripSlug)?.title || tx.tripSlug : "General Overhead"}
                      </td>
                      <td className={`p-3 text-xs font-bold text-right ${tx.type === "revenue" ? "text-green-600" : "text-red-600"}`}>
                        {tx.type === "revenue" ? "+" : "-"}{formatINR(tx.amount)}
                      </td>
                      <td className="p-3 text-center">
                        <ConfirmButton
                          action={async () => { "use server"; await deleteTransaction(tx.id); redirect("/admin/finance"); }}
                          confirmText={`Are you sure you want to delete the transaction "${tx.description}" of ${formatINR(tx.amount)}?`}
                          className="rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-2.5 py-1 text-[10px] font-bold transition"
                        >
                          Delete
                        </ConfirmButton>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-xs text-[#3D4A5E]/60">
                        <span className="text-2xl mb-1 block">💸</span>
                        No transactions match the active ledger ledger filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* right: Add Transaction form */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl bg-white border border-[#F1D9D0] p-6 shadow-sm sticky top-6 space-y-4">
            <h3 className="font-semibold text-[#13253D] border-b border-[#F1D9D0] pb-3">Log Transaction</h3>
            
            <ConfirmForm
              action={async (fd: FormData) => {
                "use server";
                await saveTransaction(fd);
                redirect("/admin/finance");
              }}
              confirmText="Are you sure you want to log this transaction?"
              buttonText="Log Transaction →"
              buttonClassName="w-full rounded-full bg-[#13253D] hover:bg-[#1f3756] text-white py-3 text-xs font-bold transition"
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#3D4A5E]/70 block">Transaction Type</label>
                <select name="type" required className="w-full mt-1.5 rounded-xl border border-[#F1D9D0] px-3 py-2.5 text-xs bg-[#FFF8F0]">
                  <option value="revenue">Revenue (Inflow)</option>
                  <option value="expense">Expense (Outflow)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#3D4A5E]/70 block">Amount (₹)</label>
                <input name="amount" type="number" required placeholder="50000" className="w-full mt-1.5 rounded-xl border border-[#F1D9D0] px-3 py-2.5 text-xs" />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#3D4A5E]/70 block">Category</label>
                <select name="category" required className="w-full mt-1.5 rounded-xl border border-[#F1D9D0] px-3 py-2.5 text-xs bg-[#FFF8F0]">
                  <optgroup label="Revenue Categories">
                    {categories.revenue.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="Expense Categories">
                    {categories.expense.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#3D4A5E]/70 block">Trip Association</label>
                <select name="tripSlug" className="w-full mt-1.5 rounded-xl border border-[#F1D9D0] px-3 py-2.5 text-xs bg-[#FFF8F0]">
                  <option value="">General (No Trip)</option>
                  {adminData.trips.map(t => (
                    <option key={t.slug} value={t.slug}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#3D4A5E]/70 block">Date</label>
                <input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="w-full mt-1.5 rounded-xl border border-[#F1D9D0] px-3 py-2.5 text-xs bg-[#FFF8F0]" />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#3D4A5E]/70 block">Description / Notes</label>
                <textarea name="description" placeholder="e.g. Kashmir tour deposit from Ananya" className="w-full mt-1.5 rounded-xl border border-[#F1D9D0] p-3 text-xs outline-none" rows={3} />
              </div>
            </ConfirmForm>
          </div>
        </div>
      </div>
    </div>
  );
}
