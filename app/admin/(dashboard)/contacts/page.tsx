import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function read(name: string) {
  try {
    const fp = path.join(process.cwd(), ".data", name);
    if (!fs.existsSync(fp)) return [];
    return JSON.parse(fs.readFileSync(fp, "utf-8")).reverse();
  } catch { return []; }
}

export default function ContactsAdmin() {
  const contacts = read("contacts.json");
  const refunds = read("refunds.json");
  const newsletters = read("newsletter.json");

  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Contacts, Refunds, Newsletter</h1>
      <p className="text-xs text-[#3D4A5E] mt-1">View user requests submitted via Support forms, Refund/Cancellation requests, and Newsletter signups.</p>
      
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        {/* Support Messages Column */}
        <div className="rounded-2xl bg-white border border-[#F1D9D0] p-5 flex flex-col min-h-[400px]">
          <h3 className="font-semibold text-[#13253D]">Support Messages — {contacts.length}</h3>
          <div className="mt-3 flex-1 overflow-y-auto space-y-2 max-h-[500px] pr-1">
            {contacts.map((c: any) => (
              <div key={c.id || Math.random()} className="rounded-xl border border-[#F1D9D0] p-3 text-xs bg-[#FFF8F0]/30 hover:bg-[#FFF8F0]/60 transition">
                <div className="font-bold text-[#13253D]">{c.name} — {c.category}</div>
                <div className="text-[#FF4A7D] font-medium mt-0.5">{c.email} {c.phone && `• ${c.phone}`}</div>
                <div className="text-[#3D4A5E] font-semibold mt-1">Subject: {c.subject}</div>
                <p className="mt-1 text-[#3D4A5E] leading-relaxed whitespace-pre-wrap">{c.message}</p>
                <div className="mt-2 text-[9px] text-[#3D4A5E]/50">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}</div>
              </div>
            ))}
            {contacts.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#3D4A5E]/60 text-xs">
                <span className="text-2xl mb-1">📥</span>
                No support messages yet.<br/>Submit the contact form on the Support page to test.
              </div>
            )}
          </div>
        </div>

        {/* Refund Requests Column */}
        <div className="rounded-2xl bg-[#FFF0F4] border border-[#FF4A7D]/25 p-5 flex flex-col min-h-[400px]">
          <h3 className="font-semibold text-[#FF4A7D]">Refund Requests — {refunds.length}</h3>
          <div className="mt-3 flex-1 overflow-y-auto space-y-2 max-h-[500px] pr-1">
            {refunds.map((r: any) => (
              <div key={r.id || Math.random()} className="rounded-xl border border-[#FF4A7D]/20 bg-white p-3 text-xs hover:border-[#FF4A7D]/45 transition">
                <div className="font-bold text-[#13253D]">{r.email}</div>
                <div className="text-[#FF4A7D] font-medium mt-0.5">Booking ID: {r.bookingId || "N/A"} {r.phone && `• ${r.phone}`}</div>
                <p className="mt-2 text-[#3D4A5E] leading-relaxed whitespace-pre-wrap"><strong className="text-[#13253D]">Reason:</strong> {r.reason}</p>
                <div className="mt-2 flex items-center justify-between text-[9px] text-[#3D4A5E]/50">
                  <span>Policy ack: {r.policyAcknowledged ? 'Yes' : 'No'}</span>
                  <span>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</span>
                </div>
              </div>
            ))}
            {refunds.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#5B2063]/60 text-xs">
                <span className="text-2xl mb-1">💸</span>
                No refund requests yet.<br/>Submit a refund request on the Support page to test.
              </div>
            )}
          </div>
        </div>

        {/* Newsletter Column */}
        <div className="rounded-2xl bg-white border border-[#F1D9D0] p-5 flex flex-col min-h-[400px]">
          <h3 className="font-semibold text-[#13253D]">Newsletter — {newsletters.length}</h3>
          <div className="mt-3 flex-1 overflow-y-auto space-y-2 max-h-[500px] pr-1">
            {newsletters.map((n: any) => (
              <div key={n.id || Math.random()} className="rounded-xl border border-[#F1D9D0] p-3 text-xs bg-[#FFF8F0]/30 hover:bg-[#FFF8F0]/60 transition">
                <div className="font-bold text-[#13253D]">{n.email}</div>
                {n.name && <div className="text-[#3D4A5E] mt-0.5">Name: {n.name}</div>}
                <div className="mt-2 text-[9px] text-[#3D4A5E]/50">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</div>
              </div>
            ))}
            {newsletters.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#3D4A5E]/60 text-xs">
                <span className="text-2xl mb-1">✉️</span>
                No newsletter subscribers yet.<br/>Sign up on the homepage to test.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
