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
  MapPin,
  RefreshCw,
  Clock,
} from "lucide-react";
import { useRideDetail, useCancelRide } from "@/lib/hooks/useRides";
import { RideStatus } from "@/types/ride";
import { formatPaisaToBDT } from "@/lib/utils/format";

const STATUS_STEPS: { status: RideStatus; label: string; desc: string }[] = [
  { status: "REQUESTED", label: "Requested", desc: "Finding compatible Tesla pool" },
  { status: "MATCHED", label: "Matched", desc: "Driver accepted your ride" },
  { status: "DRIVER_ARRIVED", label: "Arrived", desc: "Tesla has arrived at pickup" },
  { status: "STARTED", label: "In Transit", desc: "Trip is underway (fares locked)" },
  { status: "COMPLETED", label: "Completed", desc: "Arrived at destination" },
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

  // TanStack Query: Live ride details with automatic polling
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p>Loading active trip details from backend...</p>
      </div>
    );
  }

  if (!ride || ride.status === "COMPLETED" || ride.status === "CANCELLED") {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
        <div className="p-4 bg-slate-800/60 rounded-full w-fit mx-auto text-slate-400 mb-4">
          <Navigation className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Active Trip</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
          You don&apos;t have any active Tesla pool rides currently in progress.
        </p>
        <Link
          href="/passenger/request"
          className="mt-6 inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl transition text-sm cursor-pointer"
        >
          Book a Ride
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Live Trip Status
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Ride ID: {ride.id.slice(0, 8)}...
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {displayError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Progress Tracker */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl">
        <div className="relative flex justify-between items-center mb-8">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 -z-1" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-cyan-500 -translate-y-1/2 -z-1 transition-all duration-500"
            style={{
              width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%`,
            }}
          />

          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.status} className="flex flex-col items-center gap-2 bg-slate-900 px-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition ${
                    isCompleted
                      ? "bg-cyan-500 text-slate-950"
                      : isCurrent
                      ? "bg-cyan-500/20 text-cyan-400 ring-2 ring-cyan-500"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <div className="text-center">
                  <div
                    className={`text-xs font-semibold ${
                      isCurrent ? "text-cyan-400" : isCompleted ? "text-white" : "text-slate-500"
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
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-white">
                {STATUS_STEPS[currentStepIndex]?.desc || ride.status}
              </div>
              <div className="text-xs text-slate-400">
                Tesla &quot;Bullet&quot; • Capacity 3 Seats
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Locked / Estimated Fare</div>
            <div className="text-lg font-bold text-cyan-400">
              {formatPaisaToBDT(ride.finalFarePaisa || ride.estimatedFarePaisa)}
            </div>
          </div>
        </div>
      </div>

      {/* Ride Summary & Cancel Action */}
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Seats Reserved: <strong className="text-white">{ride.seats}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Payment Method: <strong className="text-white">{ride.paymentMethod}</strong></span>
          </div>
        </div>

        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelRideMutation.isPending}
            className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 cursor-pointer"
          >
            {cancelRideMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Cancel Trip
          </button>
        )}
      </div>
    </div>
  );
}
