"use client";

import { MapPin, Navigation, Zap, Compass } from "lucide-react";
import { Zone } from "@/types/ride";

interface CorridorRouteMapProps {
  pickupZone?: Zone;
  destZone?: Zone;
  distanceKm?: number;
  discountPercentage?: number;
}

export function CorridorRouteMap({
  pickupZone = { id: 1, name: "Banani", corridor: "North-East" },
  destZone = { id: 2, name: "Mohakhali", corridor: "North-East" },
  distanceKm = 3.0,
  discountPercentage = 20,
}: CorridorRouteMapProps) {
  const isSameCorridor = pickupZone.corridor === destZone.corridor;

  return (
    <div className="relative glass-panel rounded-3xl p-6 border border-cyan-500/20 shadow-2xl overflow-hidden">
      {/* Ambience & Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-30 -z-1" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-cyan-500/10 blur-3xl -z-1" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Dhaka Corridor Route Radar</h3>
            <span className="text-[11px] text-slate-400">Live pooling telemetry</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              isSameCorridor
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
            }`}
          >
            {isSameCorridor ? "Corridor Match Active" : "Inter-Corridor Route"}
          </span>
        </div>
      </div>

      {/* Interactive Visual Route Track */}
      <div className="my-6 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative">
        <div className="flex items-center justify-between relative z-10">
          {/* Pickup Zone Node */}
          <div className="flex flex-col items-center gap-2 text-center w-28">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <MapPin className="w-6 h-6 animate-bounce" />
              </div>
              <div className="absolute -inset-1 rounded-2xl border border-cyan-400/40 animate-ping opacity-40 -z-1" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">
                {pickupZone.name}
              </div>
              <span className="text-[10px] text-cyan-400 font-semibold uppercase">
                Pickup Anchor
              </span>
            </div>
          </div>

          {/* Animated Connecting Vector */}
          <div className="flex-1 px-4 relative flex flex-col items-center">
            {/* Pulsating Glowing Route Line */}
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 animate-radar shadow-[0_0_15px_rgba(0,242,254,0.8)]" />
            </div>

            {/* In-Transit Tesla Icon Marker */}
            <div className="absolute -top-3.5 px-3 py-1 rounded-full bg-slate-950 border border-cyan-500/50 text-[10px] font-bold text-cyan-300 flex items-center gap-1.5 shadow-xl">
              <Navigation className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>~{distanceKm.toFixed(1)} km</span>
            </div>

            {/* Pool Match Discount Badge */}
            <div className="mt-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-300">
              <Zap className="w-3 h-3 fill-emerald-400 text-emerald-400" />
              <span>{discountPercentage}% Pool Discount Active</span>
            </div>
          </div>

          {/* Destination Zone Node */}
          <div className="flex flex-col items-center gap-2 text-center w-28">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">
                {destZone.name}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                {destZone.corridor}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Corridor Details Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>North-East Corridor (Banani, Gulshan, Mohakhali, Baridhara)</span>
        </span>
        <span className="text-slate-300 font-medium">Single Shared Tesla Trip</span>
      </div>
    </div>
  );
}
