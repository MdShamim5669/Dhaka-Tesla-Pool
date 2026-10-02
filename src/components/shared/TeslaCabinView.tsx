"use client";

import { Car, User, CheckCircle2, Shield } from "lucide-react";

interface TeslaCabinViewProps {
  capacity?: number;
  occupiedSeats?: number;
  selectedSeats?: number;
  driverName?: string;
  onSelectSeats?: (seats: number) => void;
  interactive?: boolean;
}

export function TeslaCabinView({
  capacity = 3,
  occupiedSeats = 1,
  selectedSeats = 1,
  driverName = "Jashim",
  onSelectSeats,
  interactive = false,
}: TeslaCabinViewProps) {
  const remaining = capacity - occupiedSeats;

  return (
    <div className="relative glass-panel rounded-3xl p-6 border border-cyan-500/20 shadow-2xl overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -z-1" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-1" />

      {/* Header Info */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 border border-cyan-500/30 text-cyan-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <span>Tesla &quot;Bullet&quot; Cockpit</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Model 3
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Pilot: <strong className="text-slate-200">{driverName}</strong> • {capacity} Passenger Capacity
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Cabin Status
          </div>
          <div className="text-sm font-extrabold text-emerald-400">
            {remaining > 0 ? `${remaining} Seats Open` : "Cabin Full"}
          </div>
        </div>
      </div>

      {/* Tesla Car Silhouette Interior */}
      <div className="my-6 max-w-[280px] mx-auto relative p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/40 to-slate-950 border border-slate-800 shadow-inner">
        {/* Windshield Indicator */}
        <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto rounded-full mb-6 opacity-60 shadow-[0_0_12px_rgba(6,182,212,0.8)]" />

        {/* Front Row: Driver & Passenger Seat #1 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Driver Seat (Always Reserved) */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-cyan-500/30 flex flex-col items-center justify-center gap-1.5 shadow-lg relative">
            <div className="absolute -top-2 px-2 py-0.5 bg-cyan-500 text-slate-950 text-[9px] font-black rounded-full uppercase tracking-wider">
              Driver
            </div>
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">{driverName}</span>
          </div>

          {/* Front Passenger (Seat 1) */}
          <button
            type="button"
            disabled={!interactive || occupiedSeats >= 1}
            onClick={() => interactive && onSelectSeats && onSelectSeats(1)}
            className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${
              occupiedSeats >= 1
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : selectedSeats >= 1
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400"
                : "bg-slate-800/40 border-slate-700/80 text-slate-400 hover:border-slate-500"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium">
              {occupiedSeats >= 1 ? "Occupied" : selectedSeats >= 1 ? "Selected" : "Seat #1"}
            </span>
          </button>
        </div>

        {/* Rear Row: Passenger Seat #2 & Seat #3 */}
        <div className="grid grid-cols-2 gap-4">
          {/* Rear Left (Seat 2) */}
          <button
            type="button"
            disabled={!interactive || occupiedSeats >= 2}
            onClick={() => interactive && onSelectSeats && onSelectSeats(2)}
            className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${
              occupiedSeats >= 2
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : selectedSeats >= 2
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400"
                : "bg-slate-800/40 border-slate-700/80 text-slate-400 hover:border-slate-500"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium">
              {occupiedSeats >= 2 ? "Occupied" : selectedSeats >= 2 ? "Selected" : "Seat #2"}
            </span>
          </button>

          {/* Rear Right (Seat 3) */}
          <button
            type="button"
            disabled={!interactive || occupiedSeats >= 3}
            onClick={() => interactive && onSelectSeats && onSelectSeats(3)}
            className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${
              occupiedSeats >= 3
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : selectedSeats >= 3
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400"
                : "bg-slate-800/40 border-slate-700/80 text-slate-400 hover:border-slate-500"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium">
              {occupiedSeats >= 3 ? "Occupied" : selectedSeats >= 3 ? "Selected" : "Seat #3"}
            </span>
          </button>
        </div>

        {/* Rear Trunk Ambient Indicator */}
        <div className="w-20 h-1 bg-slate-800 mx-auto rounded-full mt-6" />
      </div>

      {/* Legend & Concurrency Protection Indicator */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Atomic Postgres Seat Lock</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Selected
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Occupied
          </span>
        </div>
      </div>
    </div>
  );
}
