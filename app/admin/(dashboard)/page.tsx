import { getAdminData, getSettings, saveSettings, getTransactions } from "@/lib/admin-store";
import { formatINR } from "@/lib/utils";
import Link from "next/link";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import HeroSettingsForm from "@/components/admin/HeroSettingsForm";

export default async function AdminPage() {
  const data = await getAdminData();
  const settings = await getSettings();
  const allTransactions = await getTransactions();

  async function handleUpdateHero(formData: FormData) {
    "use server";
    await saveSettings(formData);
  }

  async function handleUpdateMarquee(formData: FormData) {
    "use server";
    await saveSettings(formData);
  }

  async function handleUpdateWhyChoose(formData: FormData) {
    "use server";
    await saveSettings(formData);
  }

  return (
    <div>
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-[#13253D]">Dashboard — Control Everything</h1>
          <p className="text-sm text-[#3D4A5E] mt-2">Full CMS with file-fallback + MySQL Drizzle ready. Toggle featured, publish/draft, moderate testimonials, update leads.</p>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link href="/admin/leads" className="rounded-2xl bg-white border border-[#F1D9D0] p-5 hover:border-[#FF4A7D]/30 transition">
          <div className="text-[11px] uppercase font-bold text-[#13253D]/50">Leads</div>
          <div className="text-3xl font-bold mt-1">{data.stats.leads}</div>
          <div className="text-[11px] text-[#FF4A7D] mt-2 font-bold">Manage →</div>
        </Link>
        <Link href="/admin/trips" className="rounded-2xl bg-white border border-[#F1D9D0] p-5 hover:border-[#FF4A7D]/30 transition">
          <div className="text-[11px] uppercase font-bold text-[#13253D]/50">Trips</div>
          <div className="text-3xl font-bold mt-1">{data.stats.trips}</div>
          <div className="text-[11px] text-[#3D4A5E] mt-2">Featured toggle, publish</div>
        </Link>
        <Link href="/admin/testimonials" className="rounded-2xl bg-white border border-[#F1D9D0] p-5">
          <div className="text-[11px] uppercase font-bold text-[#13253D]/50">Testimonials</div>
          <div className="text-3xl font-bold mt-1">{data.testimonials.length}</div>
          <div className="text-[11px] text-[#3D4A5E] mt-2">Moderate, feature</div>
        </Link>
        <div className="rounded-2xl bg-white border border-[#F1D9D0] p-5">
          <div className="text-[11px] uppercase font-bold text-[#13253D]/50">Custom Trips</div>
          <div className="text-3xl font-bold mt-1">{data.stats.custom}</div>
        </div>
        <div className="rounded-2xl bg-[#FFF0F4] border border-[#FF4A7D]/20 p-5">
          <div className="text-[11px] uppercase font-bold text-[#FF4A7D]">Refunds & Contacts</div>
          <div className="text-3xl font-bold mt-1">{data.stats.refunds + data.stats.contacts}</div>
        </div>
        <Link href="/admin/finance" className="rounded-2xl bg-[#FFF8F0] border border-[#FF8A2B]/20 p-5 hover:border-[#FF8A2B]/40 transition">
          <div className="text-[11px] uppercase font-bold text-[#FF8A2B]">Net Profit</div>
          <div className={`text-2xl font-bold mt-1.5 truncate ${((data.stats as any).netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatINR((data.stats as any).netProfit || 0)}
          </div>
          <div className="text-[11px] text-[#3D4A5E] mt-2 font-bold">Finance CRM →</div>
        </Link>
      </div>

      <AnalyticsCharts transactions={allTransactions} leads={data.leads} />

      <div className="mt-8 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-[20px] bg-white border border-[#F1D9D0] p-6">
            <h3 className="font-semibold text-[#13253D]">Recent Leads — Quick Actions</h3>
            <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto">
              {data.leads.slice(0,6).map((l: any)=>(
                <div key={l.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#F1D9D0] p-3">
                  <div>
                    <div className="font-semibold text-sm">{l.name} — {l.destination}</div>
                    <div className="text-xs text-[#3D4A5E]">{l.email} • {l.travelMonth} • {l.status}</div>
                  </div>
                  <Link href="/admin/leads" className="rounded-full bg-[#13253D] text-white px-3 py-1.5 text-[11px]">Open CRM</Link>
                </div>
              ))}
              {data.leads.length===0 && <div className="text-sm text-[#3D4A5E]">No leads yet. Submit enquiry on homepage to test.</div>}
            </div>
          </div>

          <div className="rounded-[20px] bg-white border border-[#F1D9D0] p-6">
            <h3 className="font-semibold text-[#13253D] mb-3">Announcements & Offers Strip</h3>
            <form action={handleUpdateMarquee} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#13253D]">Offers & Announcements Scrolling Text (Separated by •)</label>
                <textarea 
                  name="marqueeText" 
                  defaultValue={settings.marqueeText} 
                  rows={2} 
                  className="w-full mt-1.5 rounded-xl border px-3 py-2 text-sm text-[#13253D] font-medium" 
                  placeholder="e.g. 🎉 Get ₹2,000 Off on your first booking! Code: SISTERHOOD2000 • Group Discount: Book for 4 or more girls..."
                />
              </div>
              <button 
                type="submit" 
                className="rounded-full bg-[#13253D] hover:bg-[#FF4A7D] text-white px-4 py-2 text-xs font-bold transition-all shadow-sm"
              >
                Update Offers Text
              </button>
            </form>
          </div>

          <HeroSettingsForm settings={settings} action={handleUpdateHero} />

          <div className="rounded-[20px] bg-white border border-[#F1D9D0] p-6 mt-6">
            <h3 className="font-semibold text-[#13253D] mb-4">Edit Safety Section (Why Choose Grid)</h3>
            <form action={handleUpdateWhyChoose} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-[#13253D]">Section Badge</label>
                  <input 
                    type="text"
                    name="whyChooseBadge" 
                    defaultValue={settings.whyChooseBadge} 
                    className="w-full mt-1 rounded-xl border px-3 py-2 text-sm text-[#13253D] font-medium" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#13253D]">Section Title (Use newlines for breaks)</label>
                  <textarea 
                    name="whyChooseTitle" 
                    defaultValue={settings.whyChooseTitle} 
                    rows={2}
                    className="w-full mt-1 rounded-xl border px-3 py-2 text-sm text-[#13253D] font-medium" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#13253D]">Section Description</label>
                <textarea 
                  name="whyChooseDesc" 
                  defaultValue={settings.whyChooseDesc} 
                  rows={2}
                  className="w-full mt-1.5 rounded-xl border px-3 py-2 text-sm text-[#13253D] font-medium" 
                />
              </div>

              <div className="border-t border-[#F1D9D0] pt-4">
                <h4 className="text-xs font-bold uppercase text-[#FF4A7D] mb-4">Grid Cards (Exactly 6 cards)</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  {settings.whyChooseReasons?.map((r: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-[#F1D9D0] p-4 bg-[#FFF8F0]/30 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-[#13253D] uppercase">Card #{idx + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <label className="text-[10px] font-bold text-[#3D4A5E]">Icon:</label>
                          <select 
                            name={`card_icon_${idx}`} 
                            defaultValue={r.icon}
                            className="text-xs rounded border px-2 py-1 bg-white text-[#13253D] font-semibold"
                          >
                            <option value="Shield">🛡️ Shield</option>
                            <option value="Heart">❤️ Heart</option>
                            <option value="Users">👥 Users</option>
                            <option value="Map">🗺️ Map</option>
                            <option value="Clock">🕒 Clock</option>
                            <option value="Wallet">💳 Wallet</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <input 
                          type="text"
                          name={`card_title_${idx}`} 
                          defaultValue={r.title} 
                          placeholder="Card Title"
                          className="w-full rounded-lg border px-3 py-1.5 text-xs text-[#13253D] font-bold" 
                        />
                      </div>
                      <div>
                        <textarea 
                          name={`card_desc_${idx}`} 
                          defaultValue={r.desc} 
                          placeholder="Card Description"
                          rows={2}
                          className="w-full rounded-lg border px-3 py-1.5 text-xs text-[#3D4A5E] font-medium" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="rounded-full bg-[#13253D] hover:bg-[#FF4A7D] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-sm"
              >
                Save Safety Grid
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[20px] bg-[#13253D] text-white p-6">
            <h3 className="font-semibold">Control Panel — What you can do now</h3>
            <ul className="mt-4 space-y-2 text-xs text-white/80 leading-relaxed">
              <li>✅ <Link href="/admin/trips" className="underline text-[#FF8A2B]">Trip Packages</Link> — Toggle Featured, Publish/Draft, Edit price, SEO</li>
              <li>✅ <Link href="/admin/leads" className="underline text-[#FF8A2B]">Leads CRM</Link> — Change status (New→Booked), add notes, follow-up date, WhatsApp log</li>

              <li>✅ <Link href="/admin/testimonials" className="underline text-[#FF8A2B]">Testimonials</Link> — Approve/reject, feature, add new</li>
              <li>✅ <Link href="/admin/blogs" className="underline text-[#FF8A2B]">Blogs</Link> — Create new resource posts</li>
              <li>✅ <Link href="/admin/policies" className="underline text-[#FF8A2B]">Policies</Link> — Version history, last updated</li>
              <li>✅ <Link href="/admin/contacts" className="underline text-[#FF8A2B]">Contacts & Refunds</Link> — Resolve, add admin notes</li>
            </ul>
            <div className="mt-4 rounded-xl bg-white/10 border border-white/10 p-3 text-[11px] text-white/60">In production, these write to MySQL via Drizzle. In demo, writes to <code>.data/*.json</code> so you see persistence. All server actions are in <code>lib/admin-store.ts</code> & <code>lib/actions.ts</code>.</div>
          </div>

          <div className="rounded-[20px] bg-white border border-[#F1D9D0] p-6">
            <h3 className="font-semibold text-[#13253D]">Quick Create</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/admin/trips" className="rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] p-3 text-xs font-semibold hover:bg-[#FFF0F4]">+ New Trip</Link>
              <Link href="/admin/blogs" className="rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] p-3 text-xs font-semibold hover:bg-[#FFF0F4]">+ Blog Post</Link>
              <Link href="/admin/testimonials" className="rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] p-3 text-xs font-semibold hover:bg-[#FFF0F4]">+ Testimonial</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
