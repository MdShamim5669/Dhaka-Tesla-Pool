"use client";

import Link from "next/link";
import {
  Car,
  Users,
  ShieldCheck,
  ArrowRight,
  Zap,
  Compass,
  CreditCard,
} from "lucide-react";
import { CorridorRouteMap } from "@/components/shared/CorridorRouteMap";
import { TeslaCabinView } from "@/components/shared/TeslaCabinView";
import { LiveStatsTicker } from "@/components/shared/LiveStatsTicker";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Cyber Navbar */}
      <header className="border-b border-cyan-500/10 bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-400 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] group-hover:scale-105 transition">
              <Car className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                <span>Dhaka Tesla</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                  Pool
                </span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-cyan-400/80 font-bold -mt-0.5">
                Zero Overbooking • 20% Off
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl hover:bg-slate-800/60 transition"
            >
              Sign In
            </Link>
            <Link
              href="/passenger/request"
              className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-bold text-slate-950 rounded-xl group bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:scale-105 transition"
            >
              <span className="px-5 py-2.5 transition-all ease-in duration-75 rounded-[10px] bg-gradient-to-r from-cyan-400 to-emerald-300 group-hover:bg-opacity-0">
                Book a Tesla
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24 relative overflow-hidden">
        {/* Ambient Gradient Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-emerald-600/15 to-purple-600/20 blur-[130px] rounded-full pointer-events-none -z-1" />

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-bold mb-8 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Live Dhaka Corridor Pooling Enabled</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400">Atomic Postgres Engine</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-7xl font-black tracking-tight text-center max-w-4xl text-white leading-[1.1]">
          Share a seat. Split the fare.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Survive Dhaka traffic.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300/80 text-center max-w-2xl font-normal leading-relaxed">
          The next-generation ride-pooling network engineered specifically for Dhaka.
          Pair seamlessly with verified commuters traveling your exact corridor in
          fleet Teslas like Jashim&apos;s &quot;Bullet&quot;.
        </p>

        {/* CTA Button Group */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/passenger/request"
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-extrabold px-8 py-4 rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.4)] hover:shadow-[0_0_45px_rgba(16,185,129,0.5)] transition hover:scale-102 text-base cursor-pointer"
          >
            <Zap className="w-5 h-5 fill-slate-950" />
            <span>Book Pooled Tesla</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/driver"
            className="flex items-center justify-center gap-3 border border-slate-700 hover:border-cyan-500/50 bg-slate-900/80 hover:bg-slate-850 text-white font-bold px-8 py-4 rounded-2xl transition text-base backdrop-blur-xl hover:scale-102 cursor-pointer"
          >
            <Car className="w-5 h-5 text-cyan-400" />
            <span>Driver Cockpit</span>
          </Link>
        </div>

        {/* Live Metrics Ticker */}
        <div className="mt-16 max-w-5xl w-full">
          <LiveStatsTicker />
        </div>

        {/* Interactive Visual Showcase */}
        <div className="mt-16 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              <Compass className="w-4 h-4" />
              <span>Smart Corridor Matching</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              One Shared Tesla. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                Individual Guaranteed Fares.
              </span>
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
              Compatible requests (e.g. Nusrat traveling Banani → Mohakhali and Rafiq
              traveling Banani → Gulshan 1) share one vehicle. Fares lock the instant
              the trip starts with an automatic 20% discount.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <span>Exact integer paisa calculation (no float rounding errors)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <span>Full privacy: Passengers see only their own individual fare</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <span>TeslaPay cashless wallet with SSLCommerz bKash/Nagad top-up</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <CorridorRouteMap
              pickupZone={{ id: 1, name: "Banani", corridor: "North-East" }}
              destZone={{ id: 2, name: "Mohakhali", corridor: "North-East" }}
              distanceKm={3.0}
              discountPercentage={20}
            />
            <TeslaCabinView capacity={3} occupiedSeats={1} selectedSeats={1} driverName="Jashim" />
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-24">
          <div className="p-8 rounded-3xl glass-panel border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="p-4 w-fit rounded-2xl bg-cyan-500/10 text-cyan-400 mb-6 border border-cyan-500/20">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-white text-xl">Dynamic Corridor Pooling</h3>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Riders going in the same direction share the ride without confusing zig-zag
              detours. Same pickup zone, shared corridor destination.
            </p>
          </div>

          <div className="p-8 rounded-3xl glass-panel border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="p-4 w-fit rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-white text-xl">Concurrency Guarantee</h3>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              PostgreSQL atomic updates with CHECK constraints prevent overbooking, even
              when multiple passengers click the last available seat simultaneously.
            </p>
          </div>

          <div className="p-8 rounded-3xl glass-panel border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="p-4 w-fit rounded-2xl bg-purple-500/10 text-purple-400 mb-6 border border-purple-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-white text-xl">TeslaPay & SSLCommerz</h3>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Instant cashless payment with auto-debit at trip completion. Top up in seconds
              using bKash, Nagad, Rocket, or Visa/Mastercard.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Dhaka Tesla Pool • Autonomous Ride-Pooling MVP</span>
          </div>
          <div>© 2026 Dhaka Tesla Pool. Engineered for Dhaka&apos;s roads.</div>
        </div>
      </footer>
    </div>
  );
}
