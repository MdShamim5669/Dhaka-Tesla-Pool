"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Car,
  CheckCircle2,
  Navigation,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useRideDetail, useCancelRide } from "@/lib/hooks/useRides";
import { RideStatus } from "@/types/ride";
import { formatPaisaToBDT } from "@/lib/utils/format";
import { TeslaCabinView } from "@/components/shared/TeslaCabinView";

const STATUS_STEPS: { status: RideStatus; label: string; desc: string }[] = [
  { status: "REQUESTED", label: "Requested", desc: "Corridor matcher scanning compatible Teslas" },
  { status: "MATCHED", label: "Matched", desc: "Driver accepted request into pool" },
  { status: "DRIVER_ARRIVED", label: "Arrived", desc: "Tesla waiting at pickup point" },
  { status: "STARTED", label: "In Transit", desc: "Trip active • 20% pooling discount locked" },
  { status: "COMPLETED", label: "Arrived", desc: "Drop-off complete • Payment settled" },
];

export default function ActiveTripPage() {
  const [activeRideId, setActiveRideId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dtp_active_ride_id");
      if (stored) {
        setActiveRideId(stored);
      }
    }
  }, []);

  // TanStack Query: Live polling for ride details
  const { data: ride, isLoading, isError, error, refetch } = useRideDetail(activeRideId);
  const cancelRideMutation = useCancelRide();

  const handleCancel = async () => {
    if (!activeRideId) return;
    if (!confirm("Are you sure you want to cancel this ride?")) return;

    cancelRideMutation.mutate(activeRideId, {
      onSuccess: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("dtp_active_ride_id");
        }
      },
    });
  };

  if (isLoading && activeRideId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-4">
        <div className="relative">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <div className="absolute -inset-2 rounded-full border border-cyan-400/20 animate-ping -z-1" />
        </div>
        <p className="font-semibold text-white">Connecting to Tesla Telemetry...</p>
      </div>
    );
  }

  if (!ride || ride.status === "COMPLETED" || ride.status === "CANCELLED") {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-6 glass-panel-elevated rounded-3xl mt-12">
        <div className="p-4 bg-cyan-500/10 rounded-2xl w-fit mx-auto text-cyan-400 mb-5 border border-cyan-500/20 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
          <Car className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white">No Active Trip Found</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
          You don&apos;t have any active Tesla pool rides currently underway. Request a ride
          to start a new journey.
        </p>
        <Link
          href="/passenger/request"
          className="mt-8 inline-flex items-center gap-2.5 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] transition hover:scale-105 text-sm cursor-pointer"
        >
          <span>Book a Tesla Ride</span>
          <Navigation className="w-4 h-4 fill-slate-950" />
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.status === ride.status);
  const canCancel = ["REQUESTED", "MATCHED", "DRIVER_ARRIVED"].includes(ride.status);
  const displayError = isError
    ? error?.message
    : cancelRideMutation.isError
    ? cancelRideMutation.error?.message
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetry Link: LIVE</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Tesla Flight Tracker
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Mission ID: <span className="font-mono text-cyan-300">{ride.id}</span>
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-3 glass-panel text-slate-300 hover:text-white rounded-2xl transition cursor-pointer border border-slate-700 hover:border-cyan-500/50 flex items-center gap-2 text-xs font-bold w-fit"
          title="Refresh Telemetry"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span>Sync Status</span>
        </button>
      </div>

      {displayError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Progress Timeline Stepper */}
      <div className="glass-panel-elevated p-8 rounded-3xl space-y-8 shadow-2xl relative overflow-hidden">
        {/* Glow vector */}
        <div className="absolute top-0 right-0 w-96 h-48 bg-cyan-500/10 blur-[100px] pointer-events-none -z-1" />

        <div className="relative flex justify-between items-center px-4">
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-800 -translate-y-1/2 -z-1" />
          <div
            className="absolute top-1/2 left-8 h-1 bg-gradient-to-r from-cyan-400 to-emerald-400 -translate-y-1/2 -z-1 transition-all duration-700 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
            style={{
              width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 85}%`,
            }}
          />

          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.status} className="flex flex-col items-center gap-2 bg-slate-950/80 px-2 py-1 rounded-2xl">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                      : isCurrent
                      ? "bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-pulse"
                      : "bg-slate-800/80 text-slate-500 border border-slate-700"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : idx + 1}
                </div>
                <div className="text-center">
                  <div
                    className={`text-xs font-bold tracking-tight ${
                      isCurrent ? "text-cyan-300" : isCompleted ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current State Detail Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 text-cyan-400 border border-cyan-500/30">
              <Car className="w-8 h-8 animate-radar" />
            </div>
            <div>
              <div className="text-lg font-black text-white">
                {STATUS_STEPS[currentStepIndex]?.desc || ride.status}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <span>Vehicle: Tesla &quot;Bullet&quot;</span>
                <span>•</span>
                <span className="text-cyan-300 font-semibold">Plate: DHA-TES-001</span>
                <span>•</span>
                <span className="text-emerald-400">Driver: Jashim</span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {ride.status === "STARTED" ? "Locked Final Fare" : "Estimated Fare"}
            </div>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              {formatPaisaToBDT(ride.finalFarePaisa || ride.estimatedFarePaisa)}
            </div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold mt-0.5">
              Method: <strong className="text-white">{ride.paymentMethod}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Driver Card & Cabin View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Driver & Trip Specs Card */}
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Verified Pilot Manifest</span>
          </h2>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg">
              J
            </div>
            <div>
              <div className="font-extrabold text-white text-lg">Jashim Driver</div>
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Verified Pool Captain • 4.9 ★ Rating</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Pickup Point:</span>
              <span className="font-bold text-white">Zone #{ride.pickupZoneId}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Drop-off Destination:</span>
              <span className="font-bold text-white">Zone #{ride.destZoneId}</span>
            </div>
          </div>

          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelRideMutation.isPending}
              className="w-full py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {cancelRideMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>Cancel Trip (Allowed before transit start)</span>
            </button>
          )}
        </div>

        {/* Cabin View */}
        <TeslaCabinView
          capacity={3}
          occupiedSeats={ride.seats}
          selectedSeats={ride.seats}
          driverName="Jashim"
        />
      </div>
    </div>
  );
}
