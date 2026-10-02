import Link from "next/link";
import { Car, Users, ShieldCheck, ArrowRight, Wallet } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Car className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Dhaka Tesla <span className="text-cyan-400">Pool</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-6">
          <span>⚡ Smart Corridor Matching</span>
          <span>•</span>
          <span>Zero Overbooking Guarantee</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl">
          Share a seat. Split the fare.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
            Survive Dhaka traffic.
          </span>
        </h1>

        <p className="mt-6 text-lg text-slate-400 max-w-2xl">
          A ride-pooling service for Dhaka. Pair with compatible passengers
          traveling your route, save up to 20% on fares, and experience premium
          Tesla rides.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/passenger/request"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-semibold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition"
          >
            Request a Ride <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/driver"
            className="flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 bg-slate-900/80 text-white font-medium px-6 py-3 rounded-xl transition"
          >
            Driver Portal
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mt-20 text-left">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
            <div className="p-3 w-fit rounded-xl bg-cyan-500/10 text-cyan-400 mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-lg">Smart Corridor Pooling</h3>
            <p className="text-sm text-slate-400 mt-2">
              Matches passengers on matching pickup zones and corridor destinations
              (e.g., Banani → Mohakhali & Gulshan 1).
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
            <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-lg">Guaranteed Capacity</h3>
            <p className="text-sm text-slate-400 mt-2">
              Atomic database concurrency ensures vehicles (like Jashim&apos;s
              &quot;Bullet&quot;) never overbook past capacity.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
            <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-400 mb-4">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-lg">Transparent Pricing & Wallet</h3>
            <p className="text-sm text-slate-400 mt-2">
              Exact hand-calculated fares in integer paisa. Top up with SSLCommerz
              or pay cash directly to the driver.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        © 2026 Dhaka Tesla Pool. Engineered for Dhaka&apos;s Roads.
      </footer>
    </div>
  );
}
