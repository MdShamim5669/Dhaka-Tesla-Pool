"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ShieldCheck,
  ArrowRight,
  X,
  Info,
} from "lucide-react";

export function TeslaReserveSection() {
  const router = useRouter();

  // Tomorrow's date formatted as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split("T")[0];

  const [date, setDate] = useState<string>(defaultDateStr);
  const [time, setTime] = useState<string>("09:30");
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to passenger request page with scheduled params
    router.push(`/passenger/request?scheduled=true&date=${date}&time=${time}`);
  };

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Section Title matching reference */}
      <div className="mb-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Plan for later
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Hero Card - Muted Sage/Teal Background matching reference */}
        <div className="lg:col-span-8 bg-[#95B8C0] rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="relative z-10 max-w-md">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              Get your ride right with Tesla Reserve
            </h3>

            <div className="mt-8 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                Choose date and time
              </label>

              <form onSubmit={handleNext} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Date Input */}
                  <div className="relative flex items-center bg-white/95 rounded-xl border border-slate-300/80 px-4 py-3 shadow-sm hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900 transition">
                    <Calendar className="w-5 h-5 text-slate-700 mr-3 shrink-0" />
                    <input
                      type="date"
                      value={date}
                      min={defaultDateStr}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Time Input */}
                  <div className="relative flex items-center bg-white/95 rounded-xl border border-slate-300/80 px-4 py-3 shadow-sm hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900 transition">
                    <Clock className="w-5 h-5 text-slate-700 mr-3 shrink-0" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Next Button matching black reference style */}
                <button
                  type="submit"
                  className="w-full sm:w-48 py-3.5 px-8 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-sm tracking-wide shadow-md hover:shadow-lg transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Watch & Calendar Illustration on right side matching reference */}
          <div className="hidden md:block absolute -right-6 -bottom-6 w-96 h-80 pointer-events-none opacity-95">
            <Image
              src="/images/tesla_reserve_planner.jpg"
              alt="Tesla Reserve Planner Timepiece"
              fill
              className="object-cover rounded-2xl shadow-xl"
            />
          </div>
        </div>

        {/* Right Card - Benefits Box matching reference */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100 flex flex-col justify-between">
          <div>
            <h4 className="text-xl font-black text-slate-900 tracking-tight mb-6">
              Benefits
            </h4>

            <ul className="space-y-6">
              {/* Benefit 1 */}
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-900 shrink-0 mt-0.5">
                  <Calendar className="w-5 h-5 stroke-[2]" />
                </div>
                <p className="text-sm font-medium text-slate-700 leading-snug">
                  Choose your exact pickup time up to 90 days in advance.
                </p>
              </li>

              <div className="border-t border-slate-100" />

              {/* Benefit 2 */}
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-900 shrink-0 mt-0.5">
                  <Clock className="w-5 h-5 stroke-[2]" />
                </div>
                <p className="text-sm font-medium text-slate-700 leading-snug">
                  Extra wait time included to meet your ride.
                </p>
              </li>

              <div className="border-t border-slate-100" />

              {/* Benefit 3 */}
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-900 shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5 stroke-[2]" />
                </div>
                <p className="text-sm font-medium text-slate-700 leading-snug">
                  Cancel at no charge up to 60 minutes in advance.
                </p>
              </li>
            </ul>
          </div>

          {/* Terms trigger matching reference */}
          <div className="pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
            >
              See terms
            </button>
          </div>
        </div>
      </div>

      {/* Modal for "See Terms" */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Tesla Reserve Terms</h3>
                <p className="text-xs text-slate-500">Dhaka Corridor Service Agreement</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed max-h-80 overflow-y-auto pr-2">
              <p>
                <strong>1. Reservation Window:</strong> You may reserve a Tesla Model 3
                up to 90 days in advance and a minimum of 2 hours prior to scheduled departure across any of the 10 authorized Dhaka zones.
              </p>
              <p>
                <strong>2. Complimentary Wait Time:</strong> Tesla Reserve rides include up to
                15 minutes of complimentary wait time starting from your scheduled pickup time.
              </p>
              <p>
                <strong>3. Free Cancellation:</strong> Cancellations made more than 60 minutes
                before the scheduled pickup time are completely free of charge. Full refunds will be credited instantly to your TeslaPay wallet or original payment method.
              </p>
              <p>
                <strong>4. Guaranteed Vehicle:</strong> All reservations are assigned to our
                exclusive electric fleet (e.g. Model 3 Bullet, DHA-TES-001) driven by verified, licensed pilots.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
