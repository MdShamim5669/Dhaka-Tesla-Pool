"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Car,
  Radio,
  Users,
  ShieldCheck,
  Inbox,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useDriverTesla, useToggleDriverAvailability } from "@/lib/hooks/useDriver";

export default function DriverDashboardPage() {
  const [isOnline, setIsOnline] = useState(true);

  // TanStack Query: Tesla vehicle & capacity
  const { data: tesla } = useDriverTesla();
  const toggleMutation = useToggleDriverAvailability();

  const vehicleName = tesla?.name || "Bullet";
  const plateNo = tesla?.plateNo || "DHA-TES-001";
  const capacity = tesla?.capacity || 3;

  const handleToggle = () => {
    const nextState = !isOnline;
    toggleMutation.mutate(nextState, {
      onSuccess: () => {
        setIsOnline(nextState);
      },
      onError: () => {
        setIsOnline(nextState);
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header and Online Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Driver Command Center
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your Tesla availability and pooled ride pickups.
          </p>
        </div>

        <button
          onClick={handleToggle}
          disabled={toggleMutation.isPending}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold transition shadow-lg cursor-pointer ${
            isOnline
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-emerald-950/40"
              : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
          }`}
        >
          {toggleMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Radio className={`w-4 h-4 ${isOnline ? "animate-pulse" : ""}`} />
          )}
          <span>{isOnline ? "Online & Accepting Pools" : "Offline"}</span>
        </button>
      </div>

      {/* Vehicle Card */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Car className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-white">
                  Tesla &quot;{vehicleName}&quot;
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Plate: {plateNo} • Fixed Passenger Capacity: {capacity} Seats
              </p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <Link
              href="/driver/requests"
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl transition text-sm shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Inbox className="w-4 h-4" />
              <span>Incoming Requests</span>
            </Link>
            <Link
              href="/driver/pool"
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 bg-slate-800 text-white font-medium px-5 py-3 rounded-xl transition text-sm cursor-pointer"
            >
              <span>Current Pool</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Max Pool Seats: {capacity}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Concurrency Overbook Protection: ON</span>
          </div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Corridor-Based Matching Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
