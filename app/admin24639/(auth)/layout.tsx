export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFF8F0] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        {children}
        <div className="mt-6 text-center text-[11px] text-[#3D4A5E]/60">
          Secure admin • HttpOnly cookie • Rate limited • © TripNaari 2026
        </div>
      </div>
    </div>
  );
}
