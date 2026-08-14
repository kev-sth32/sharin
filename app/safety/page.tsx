import { MessageSquare, ShieldCheck, Heart, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Safety Promise - TripNaari Women-First Accountability" };

export default function SafetyPage() {
  return (
    <div className="bg-[#FFF8F0] py-16 md:py-24 min-h-screen">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#FF4A7D] mb-4">
            Safety Accountability
          </div>
          <h1 className="font-display font-[800] text-[36px] md:text-[48px] leading-[1.05] text-[#13253D]">
            Our Safety SOP, written for you.
          </h1>
          <p className="mt-4 text-[16px] md:text-[17px] leading-relaxed text-[#3D4A5E]">
            We read public feedback: safety is praised, operations need complete transparency. Here is the SOP our Trip Leaders follow — and you can hold us accountable to it.
          </p>
        </div>

        {/* SOP Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* SOP 1 */}
          <div className="group relative overflow-hidden rounded-3xl bg-white border border-[#F1D9D0] p-6 md:p-8 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.05)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(19,37,61,0.1)] hover:scale-[1.01]">
            <div className="flex items-center gap-4 border-b border-[#F1D9D0]/50 pb-4 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#FFF0F4] text-[#FF4A7D] shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF4A7D]">SOP 1</span>
                <h3 className="font-display font-bold text-lg text-[#13253D] leading-tight">
                  Pre-Departure Safety & Communication
                </h3>
              </div>
            </div>
            
            <div className="bg-[#FFFDFB] border-l-4 border-[#FF4A7D]/40 p-3 rounded-r-xl text-[14px] text-[#4A5568] italic mb-4">
              <strong>Objective:</strong> Ensure every traveller starts the journey with complete clarity and support.
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#8A9EB5] block mb-2">TripNaari ensures:</span>
                <ul className="space-y-2.5 text-[14px] text-[#3D4A5E] leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FF4A7D] shrink-0 mt-1" />
                    <span>Verified expert Trip Leader details shared before departure</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FF4A7D] shrink-0 mt-1" />
                    <span>WhatsApp support group created at least 7 days before travel</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FF4A7D] shrink-0 mt-1" />
                    <span>Hotel category, itinerary, pickup points, and emergency contacts shared in advance</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FF4A7D] shrink-0 mt-1" />
                    <span>Medical, dietary, and accessibility requirements reviewed before departure</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-dashed border-[#F1D9D0] pt-4 mt-6">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFF0F4] text-[#FF4A7D] mb-1.5">
                  Traveller Benefit
                </span>
                <p className="text-[14px] font-semibold text-[#13253D] leading-relaxed">
                  No last-minute confusion, unknown contacts, or unclear arrangements.
                </p>
              </div>
            </div>
          </div>

          {/* SOP 2 */}
          <div className="group relative overflow-hidden rounded-3xl bg-white border border-[#F1D9D0] p-6 md:p-8 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.05)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(19,37,61,0.1)] hover:scale-[1.01]">
            <div className="flex items-center gap-4 border-b border-[#F1D9D0]/50 pb-4 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#E6FFFA] text-[#0D9488] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488]">SOP 2</span>
                <h3 className="font-display font-bold text-lg text-[#13253D] leading-tight">
                  Verified Stay, Transport & Partner Safety
                </h3>
              </div>
            </div>
            
            <div className="bg-[#FFFDFB] border-l-4 border-[#0D9488]/40 p-3 rounded-r-xl text-[14px] text-[#4A5568] italic mb-4">
              <strong>Objective:</strong> Travel only with trusted and safety-checked partners.
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#8A9EB5] block mb-2">TripNaari ensures:</span>
                <ul className="space-y-2.5 text-[14px] text-[#3D4A5E] leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-1" />
                    <span>Hotels and homestays are safety-audited for locks, location, hygiene, and women-traveller suitability</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-1" />
                    <span>Drivers are police-verified and background checked</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-1" />
                    <span>Vehicles are legally registered, insured, and fitness-compliant</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-1" />
                    <span>Minimum 5 years of hill-driving experience for mountain routes</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-1" />
                    <span>No night driving without group consent and safety approval</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-dashed border-[#F1D9D0] pt-4 mt-6">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E6FFFA] text-[#0D9488] mb-1.5">
                  Traveller Benefit
                </span>
                <p className="text-[14px] font-semibold text-[#13253D] leading-relaxed">
                  Secure accommodation and reliable transportation throughout the trip.
                </p>
              </div>
            </div>
          </div>

          {/* SOP 3 */}
          <div className="group relative overflow-hidden rounded-3xl bg-white border border-[#F1D9D0] p-6 md:p-8 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.05)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(19,37,61,0.1)] hover:scale-[1.01]">
            <div className="flex items-center gap-4 border-b border-[#F1D9D0]/50 pb-4 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#FFF5F5] text-[#E11D48] shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#E11D48]">SOP 3</span>
                <h3 className="font-display font-bold text-lg text-[#13253D] leading-tight">
                  On-Trip Monitoring & Emergency Response
                </h3>
              </div>
            </div>
            
            <div className="bg-[#FFFDFB] border-l-4 border-[#E11D48]/40 p-3 rounded-r-xl text-[14px] text-[#4A5568] italic mb-4">
              <strong>Objective:</strong> Maintain active safety supervision every day of the journey.
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#8A9EB5] block mb-2">TripNaari ensures:</span>
                <ul className="space-y-2.5 text-[14px] text-[#3D4A5E] leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#E11D48] shrink-0 mt-1" />
                    <span>Daily morning safety briefing by the Trip Leader</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#E11D48] shrink-0 mt-1" />
                    <span>Regular wellness check-ins with all travellers</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#E11D48] shrink-0 mt-1" />
                    <span>Trip Leader travels in the same vehicle and stays in the same property</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#E11D48] shrink-0 mt-1" />
                    <span>CPR-trained leader carries first-aid support; oxygen support available on Himalayan departures</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#E11D48] shrink-0 mt-1" />
                    <span>Emergency contact kit includes nearest hospital, police station, ambulance, and local ground support</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#E11D48] shrink-0 mt-1" />
                    <span>24×7 operations helpline available for urgent assistance</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-dashed border-[#F1D9D0] pt-4 mt-6">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFF5F5] text-[#E11D48] mb-1.5">
                  Traveller Benefit
                </span>
                <p className="text-[14px] font-semibold text-[#13253D] leading-relaxed">
                  Immediate support is available without searching for help during an emergency.
                </p>
              </div>
            </div>
          </div>

          {/* SOP 4 */}
          <div className="group relative overflow-hidden rounded-3xl bg-white border border-[#F1D9D0] p-6 md:p-8 shadow-[0_10px_35px_-8px_rgba(19,37,61,0.05)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(19,37,61,0.1)] hover:scale-[1.01]">
            <div className="flex items-center gap-4 border-b border-[#F1D9D0]/50 pb-4 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#FFFBEB] text-[#D97706] shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706]">SOP 4</span>
                <h3 className="font-display font-bold text-lg text-[#13253D] leading-tight">
                  Safety Escalation, Transparency & Accountability
                </h3>
              </div>
            </div>
            
            <div className="bg-[#FFFDFB] border-l-4 border-[#D97706]/40 p-3 rounded-r-xl text-[14px] text-[#4A5568] italic mb-4">
              <strong>Objective:</strong> Resolve concerns quickly and improve continuously.
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#8A9EB5] block mb-2">TripNaari ensures:</span>
                <ul className="space-y-2.5 text-[14px] text-[#3D4A5E] leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0 mt-1" />
                    <span>Level 1: Trip Leader immediate resolution</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0 mt-1" />
                    <span>Level 2: Operations team available 24×7</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0 mt-1" />
                    <span>Level 3: Founder escalation within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0 mt-1" />
                    <span>Written cancellation and refund policy before payment</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0 mt-1" />
                    <span>Refunds processed within 7–10 working days where applicable</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0 mt-1" />
                    <span>Post-trip safety audits completed after every departure</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0 mt-1" />
                    <span>Safety learnings reviewed regularly and communicated transparently to the community</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0 mt-1" />
                    <span>Zero tolerance for harassment, discrimination, hidden costs, or unsafe conduct</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-dashed border-[#F1D9D0] pt-4 mt-6">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFFBEB] text-[#D97706] mb-1.5">
                  Traveller Benefit
                </span>
                <p className="text-[14px] font-semibold text-[#13253D] leading-relaxed">
                  Clear accountability, documented processes, and transparent grievance handling.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Detour Alert banner */}
        <div className="mt-12 rounded-3xl border border-[#FF8A2B]/20 bg-[#FFF6EF] p-5 md:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-3 shrink-0">
            <AlertTriangle className="w-6 h-6 text-[#FF8A2B]" />
            <strong className="text-[#13253D] font-bold sm:hidden">Low group size policy</strong>
          </div>
          <div className="text-[14px] leading-relaxed text-[#3D4A5E]">
            <strong className="text-[#13253D] hidden sm:block mb-1">Low group size policy</strong>
            If a group size drops below 6, we offer 3 choices:
            <ul className="list-disc pl-5 mt-2 mb-2 space-y-1 font-medium">
              <li>Move to the next date with a free upgrade</li>
              <li>Supplement max 10% extra to travel with a smaller group size</li>
              <li>Get a 100% full refund</li>
            </ul>
            <span className="font-bold text-[#13253D] block mt-2">We never cancel a confirmed date without your explicit consent.</span>
          </div>
        </div>

      </div>
    </div>
  );
}

