"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwd }),
    });
    const data = await res.json();
    if (data.success) {
      router.push("/admin24639");
    } else {
      setError(data.error || "Invalid password");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] grid place-items-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-[24px] bg-white border border-[#F1D9D0] p-8 card-shadow">
        <div className="w-10 h-10 rounded-xl bg-[#FF4A7D] grid place-items-center text-white font-black">TN</div>
        <h1 className="mt-4 font-display font-bold text-2xl text-[#13253D]">TripNaari Admin</h1>
        <p className="mt-1 text-sm text-[#3D4A5E]">Women-first CMS • Secure access</p>

        <div className="mt-6">
          <label className="text-[12px] font-bold uppercase tracking-widest">Admin Password</label>
          <input
            type="password"
            value={pwd}
            onChange={(e)=>setPwd(e.target.value)}
            placeholder="Enter password"
            className="mt-2 w-full h-12 rounded-2xl border border-[#F1D9D0] px-4 text-sm focus:outline-none focus:border-[#FF4A7D]/50 focus:ring-4 focus:ring-[#FF4A7D]/10"
            required
          />
        </div>

        {error && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">{error}</div>}

        <Button type="submit" className="w-full mt-6" size="lg" isLoading={loading}>Login →</Button>

        <div className="mt-6 rounded-xl bg-[#FFF8F0] border border-[#F1D9D0] p-3 text-[11px] leading-relaxed text-[#3D4A5E]">
          <strong>Production security active:</strong><br/>
          Custom administrative credentials required. Set <code>ADMIN_PASSWORD</code> in .env to modify.
        </div>
      </form>
    </div>
  );
}
