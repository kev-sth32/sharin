"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Mail, 
  Phone, 
  Calendar, 
  FileSpreadsheet, 
  MessageSquare,
  AlertTriangle,
  XCircle,
  Loader2,
  Check
} from "lucide-react";
import { 
  updateSupportStatus, 
  deleteSupportMessage, 
  updateRefundStatus, 
  deleteRefundRequest, 
  deleteNewsletterSubscriber 
} from "@/lib/actions";

interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  category: string;
  subject: string;
  message: string;
  createdAt?: string;
  status?: "unread" | "resolved";
  notes?: string;
}

interface Refund {
  id: number;
  email: string;
  phone?: string;
  bookingId?: string;
  reason: string;
  policyAcknowledged: boolean;
  createdAt?: string;
  status?: "pending" | "approved" | "rejected";
  notes?: string;
}

interface Newsletter {
  id: number;
  email: string;
  name?: string;
  createdAt?: string;
}

export default function ContactsClient({
  initialContacts,
  initialRefunds,
  initialNewsletters,
}: {
  initialContacts: Contact[];
  initialRefunds: Refund[];
  initialNewsletters: Newsletter[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"support" | "refunds" | "newsletter">("support");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Admin notes local state
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [savingNoteId, setSavingNoteId] = useState<number | null>(null);

  // CSV Export for Newsletters
  const handleExportCSV = () => {
    const headers = ["Email", "Name", "Date Joined"];
    const rows = initialNewsletters.map(n => [
      n.email,
      n.name || "",
      n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Actions
  const handleUpdateSupport = async (id: number, status: "unread" | "resolved") => {
    const note = notesState[`support-${id}`];
    setSavingNoteId(id);
    startTransition(async () => {
      const res = await updateSupportStatus(id, status, note);
      if (res.success) {
        router.refresh();
      } else {
        alert("Error updating status: " + res.error);
      }
      setSavingNoteId(null);
    });
  };

  const handleDeleteSupport = async (id: number) => {
    if (!confirm("Are you sure you want to delete this support message?")) return;
    startTransition(async () => {
      const res = await deleteSupportMessage(id);
      if (res.success) router.refresh();
    });
  };

  const handleUpdateRefund = async (id: number, status: "pending" | "approved" | "rejected") => {
    const note = notesState[`refund-${id}`];
    setSavingNoteId(id);
    startTransition(async () => {
      const res = await updateRefundStatus(id, status, note);
      if (res.success) {
        router.refresh();
      } else {
        alert("Error updating status: " + res.error);
      }
      setSavingNoteId(null);
    });
  };

  const handleDeleteRefund = async (id: number) => {
    if (!confirm("Are you sure you want to delete this refund request?")) return;
    startTransition(async () => {
      const res = await deleteRefundRequest(id);
      if (res.success) router.refresh();
    });
  };

  const handleDeleteSubscriber = async (id: number) => {
    if (!confirm("Are you sure you want to remove this newsletter subscriber?")) return;
    startTransition(async () => {
      const res = await deleteNewsletterSubscriber(id);
      if (res.success) router.refresh();
    });
  };

  // Filtered lists
  const filteredContacts = initialContacts.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      c.category.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.message.toLowerCase().includes(q)
    );
  });

  const filteredRefunds = initialRefunds.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      r.email.toLowerCase().includes(q) ||
      (r.phone && r.phone.includes(q)) ||
      (r.bookingId && r.bookingId.toLowerCase().includes(q)) ||
      r.reason.toLowerCase().includes(q)
    );
  });

  const filteredNewsletters = initialNewsletters.filter(n => {
    const q = searchQuery.toLowerCase();
    return (
      n.email.toLowerCase().includes(q) ||
      (n.name && n.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#13253D]">Support & Subscribers Hub</h1>
          <p className="text-xs text-[#3D4A5E] mt-1">Manage contact inquiries, refund requests, and newsletter audience database.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "newsletter" && filteredNewsletters.length > 0 && (
            <button 
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#F1D9D0] bg-white hover:bg-[#FFF8F0]/30 text-[#13253D] px-4 py-2 text-xs font-bold transition shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#FF4A7D]" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white border border-[#F1D9D0] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-1.5 p-1 bg-[#FFF8F0]/60 rounded-xl border border-[#F1D9D0]/50 w-fit">
          <button 
            onClick={() => { setActiveTab("support"); setSearchQuery(""); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition duration-150 ${activeTab === "support" ? "bg-[#FF4A7D] text-white shadow-sm" : "text-[#13253D] hover:bg-[#FFF0F4]/40"}`}
          >
            Support Messages ({initialContacts.length})
          </button>
          <button 
            onClick={() => { setActiveTab("refunds"); setSearchQuery(""); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition duration-150 ${activeTab === "refunds" ? "bg-[#FF4A7D] text-white shadow-sm" : "text-[#13253D] hover:bg-[#FFF0F4]/40"}`}
          >
            Refund Requests ({initialRefunds.length})
          </button>
          <button 
            onClick={() => { setActiveTab("newsletter"); setSearchQuery(""); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition duration-150 ${activeTab === "newsletter" ? "bg-[#FF4A7D] text-white shadow-sm" : "text-[#13253D] hover:bg-[#FFF0F4]/40"}`}
          >
            Newsletter ({initialNewsletters.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#13253D]/40" />
          <input 
            type="text"
            placeholder={`Search ${activeTab === "support" ? "messages" : activeTab === "refunds" ? "refunds" : "subscribers"}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#F1D9D0] bg-white text-xs text-[#13253D] focus:outline-none focus:border-[#FF4A7D]/60 focus:ring-4 focus:ring-[#FF4A7D]/5 transition shadow-sm placeholder:text-[#13253D]/40"
          />
        </div>
      </div>

      {/* Lists */}
      <div className="relative min-h-[400px]">
        {isPending && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-2xl backdrop-blur-[1px]">
            <Loader2 className="w-8 h-8 text-[#FF4A7D] animate-spin" />
          </div>
        )}

        {/* Support Tab Content */}
        {activeTab === "support" && (
          <div className="grid gap-4">
            {filteredContacts.map((c) => {
              const notesKey = `support-${c.id}`;
              const hasNotesChange = (notesState[notesKey] !== undefined) && (notesState[notesKey] !== (c.notes || ""));
              return (
                <div key={c.id} className={`rounded-2xl border bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition ${c.status === 'resolved' ? 'border-[#F1D9D0]/50 opacity-90' : 'border-[#F1D9D0]'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-[#13253D] text-base">{c.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                          c.status === 'resolved' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                            : 'bg-rose-50 border-rose-100 text-rose-500'
                        }`}>
                          {c.status || "unread"}
                        </span>
                        <span className="text-[10px] rounded-full bg-[#FFF8F0] border border-[#F1D9D0] text-[#13253D] px-2.5 py-0.5 font-bold uppercase tracking-wide">
                          {c.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#3D4A5E]/70 font-semibold pt-1">
                        <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#FF4A7D]" />{c.email}</span>
                        {c.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#FF4A7D]" />{c.phone}</span>}
                        {c.createdAt && <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#FF4A7D]" />{new Date(c.createdAt).toLocaleString()}</span>}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeleteSupport(c.id)}
                      className="self-end sm:self-start w-8 h-8 rounded-full border border-red-100 bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 border-t border-[#F1D9D0]/40 pt-4 text-left">
                    <div className="text-[11px] uppercase tracking-wider font-extrabold text-[#13253D]/40 mb-1">Subject</div>
                    <div className="text-xs font-bold text-[#13253D]">{c.subject}</div>
                    <div className="text-[11px] uppercase tracking-wider font-extrabold text-[#13253D]/40 mt-3 mb-1">Message</div>
                    <p className="text-xs text-[#3D4A5E] leading-relaxed whitespace-pre-wrap font-medium bg-[#FFF8F0]/20 border border-[#F1D9D0]/30 rounded-xl p-3.5">{c.message}</p>
                  </div>

                  {/* Notes & Actions */}
                  <div className="mt-4 bg-[#FFF8F0]/30 border border-[#F1D9D0]/50 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-[#13253D]/50">Internal Admin Notes</label>
                      <div className="relative flex items-center">
                        <input 
                          type="text" 
                          placeholder="No notes added. Type resolution logs here..."
                          defaultValue={c.notes || ""}
                          onChange={(e) => setNotesState({ ...notesState, [notesKey]: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#F1D9D0] bg-white text-xs text-[#13253D] focus:outline-none focus:border-[#FF4A7D]/40 pr-16"
                        />
                        {hasNotesChange && (
                          <button
                            onClick={() => handleUpdateSupport(c.id, c.status || "unread")}
                            disabled={savingNoteId === c.id}
                            className="absolute right-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded px-2.5 py-1 text-[10px] font-bold shadow-sm flex items-center gap-1 transition"
                          >
                            {savingNoteId === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Save
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-end gap-2 shrink-0 self-end md:self-center">
                      {c.status !== "resolved" ? (
                        <button 
                          onClick={() => handleUpdateSupport(c.id, "resolved")}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-xs px-4 py-2.5 shadow-sm transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark Resolved
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateSupport(c.id, "unread")}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#F1D9D0] bg-white hover:bg-[#FFF8F0]/30 text-[#13253D] font-bold text-xs px-4 py-2.5 shadow-sm transition"
                        >
                          <Clock className="w-3.5 h-3.5 text-[#FF4A7D]" />
                          Reopen Message
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredContacts.length === 0 && (
              <div className="bg-white border border-[#F1D9D0] rounded-2xl p-12 text-center text-[#3D4A5E]/60 text-xs shadow-sm">
                <MessageSquare className="w-8 h-8 text-[#FF4A7D]/40 mx-auto mb-2" />
                No support messages found matching search criteria.
              </div>
            )}
          </div>
        )}

        {/* Refund Tab Content */}
        {activeTab === "refunds" && (
          <div className="grid gap-4">
            {filteredRefunds.map((r) => {
              const notesKey = `refund-${r.id}`;
              const hasNotesChange = (notesState[notesKey] !== undefined) && (notesState[notesKey] !== (r.notes || ""));
              return (
                <div key={r.id} className="rounded-2xl border border-[#F1D9D0] bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-[#13253D] text-base">{r.email}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                          r.status === 'approved' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                            : r.status === 'rejected'
                            ? 'bg-rose-50 border-rose-200 text-rose-600'
                            : 'bg-amber-50 border-amber-200 text-amber-600'
                        }`}>
                          {r.status || "pending"}
                        </span>
                        {r.bookingId && (
                          <span className="text-[10px] rounded-full bg-[#FFF0F4] border border-[#FF4A7D]/20 text-[#FF4A7D] px-2.5 py-0.5 font-bold">
                            Booking: {r.bookingId}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#3D4A5E]/70 font-semibold pt-1">
                        {r.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#FF4A7D]" />{r.phone}</span>}
                        {r.createdAt && <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#FF4A7D]" />{new Date(r.createdAt).toLocaleString()}</span>}
                        <span className="inline-flex items-center gap-1">
                          <AlertTriangle className={`w-3.5 h-3.5 ${r.policyAcknowledged ? 'text-emerald-500' : 'text-amber-500'}`} />
                          Policy Acknowledged: {r.policyAcknowledged ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeleteRefund(r.id)}
                      className="self-end sm:self-start w-8 h-8 rounded-full border border-red-100 bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 border-t border-[#F1D9D0]/40 pt-4 text-left">
                    <div className="text-[11px] uppercase tracking-wider font-extrabold text-[#13253D]/40 mb-1">Reason for Refund</div>
                    <p className="text-xs text-[#3D4A5E] leading-relaxed whitespace-pre-wrap font-medium bg-[#FFF8F0]/20 border border-[#F1D9D0]/30 rounded-xl p-3.5">{r.reason}</p>
                  </div>

                  {/* Notes & Actions */}
                  <div className="mt-4 bg-[#FFF8F0]/30 border border-[#F1D9D0]/50 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-[#13253D]/50">Internal Review Notes</label>
                      <div className="relative flex items-center">
                        <input 
                          type="text" 
                          placeholder="Add details about refund status or bank transfer confirmation..."
                          defaultValue={r.notes || ""}
                          onChange={(e) => setNotesState({ ...notesState, [notesKey]: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-[#F1D9D0] bg-white text-xs text-[#13253D] focus:outline-none focus:border-[#FF4A7D]/40 pr-16"
                        />
                        {hasNotesChange && (
                          <button
                            onClick={() => handleUpdateRefund(r.id, r.status || "pending")}
                            disabled={savingNoteId === r.id}
                            className="absolute right-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded px-2.5 py-1 text-[10px] font-bold shadow-sm flex items-center gap-1 transition"
                          >
                            {savingNoteId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Save
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button 
                        onClick={() => handleUpdateRefund(r.id, "approved")}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-xs px-3.5 py-2.5 shadow-sm transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleUpdateRefund(r.id, "rejected")}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-500 hover:bg-[#FF4A7D] active:scale-[0.98] text-white font-bold text-xs px-3.5 py-2.5 shadow-sm transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                      {r.status && r.status !== "pending" && (
                        <button 
                          onClick={() => handleUpdateRefund(r.id, "pending")}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#F1D9D0] bg-white hover:bg-[#FFF8F0]/30 text-[#13253D] font-bold text-xs px-3.5 py-2.5 shadow-sm transition"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredRefunds.length === 0 && (
              <div className="bg-white border border-[#F1D9D0] rounded-2xl p-12 text-center text-[#3D4A5E]/60 text-xs shadow-sm">
                <AlertTriangle className="w-8 h-8 text-[#FF4A7D]/40 mx-auto mb-2" />
                No refund requests found matching search criteria.
              </div>
            )}
          </div>
        )}

        {/* Newsletter Tab Content */}
        {activeTab === "newsletter" && (
          <div className="bg-white border border-[#F1D9D0] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-[#FFF8F0] border-b border-[#F1D9D0] text-[#13253D] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Subscriber Email</th>
                    <th className="px-6 py-4">Name (Optional)</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1D9D0]/40 font-semibold text-[#13253D]/90">
                  {filteredNewsletters.map((n) => (
                    <tr key={n.id} className="hover:bg-[#FFF8F0]/10 transition-colors">
                      <td className="px-6 py-4 text-[#FF4A7D] font-bold">{n.email}</td>
                      <td className="px-6 py-4 text-[#3D4A5E]">{n.name || <span className="text-[#3D4A5E]/40 italic">Not provided</span>}</td>
                      <td className="px-6 py-4 text-[#3D4A5E]/70 font-medium">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteSubscriber(n.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-red-50 text-red-400 hover:text-red-500 hover:bg-red-50 transition"
                          title="Remove subscriber"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredNewsletters.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-[#3D4A5E]/60">
                        <Mail className="w-8 h-8 text-[#FF4A7D]/40 mx-auto mb-2" />
                        No subscribers found matching search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
