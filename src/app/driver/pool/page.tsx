"use client";

import Link from "next/link";
import {
  Car,
  Navigation,
  Play,
  Check,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  Compass,
} from "lucide-react";
import { useCurrentPool, usePoolAction } from "@/lib/hooks/useDriver";
import { formatPaisaToBDT } from "@/lib/utils/format";
import { TeslaCabinView } from "@/components/shared/TeslaCabinView";
import { GoogleMapView } from "@/components/shared/GoogleMapView";

export default function DriverPoolPage() {
  const { data: pool, isLoading, isError, error, refetch } = useCurrentPool();
  const poolActionMutation = usePoolAction();

  const handleAction = (action: "arrive" | "start" | "complete" | "cancel") => {
    if (!pool) return;
    if (action === "cancel" && !confirm("Are you sure you want to cancel this pool trip?")) {
      return;
    }

    poolActionMutation.mutate({
      poolId: pool.id,
      action,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        <p className="font-semibold text-white">Syncing Cockpit Telemetry...</p>
      </div>
    );
  }

  if (!pool || pool.status === "COMPLETED" || pool.status === "CANCELLED") {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-6 glass-panel-elevated rounded-3xl mt-12">
        <div className="p-4 bg-emerald-500/10 rounded-2xl w-fit mx-auto text-emerald-400 mb-5 border border-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
          <Car className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white">Cockpit Idle</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
          You don&apos;t have any active pool trip in progress. Check incoming corridor requests to accept passengers.
        </p>
        <Link
          href="/driver/requests"
          className="mt-8 inline-flex items-center gap-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition hover:scale-105 text-sm cursor-pointer"
        >
          <span>View Passenger Requests</span>
          <Navigation className="w-4 h-4 fill-slate-950" />
        </Link>
      </div>
    );
  }

  const errorMessage = isError
    ? error?.message
    : poolActionMutation.isError
    ? poolActionMutation.error?.message
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Corridor Pilot: {pool.corridor}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Tesla &quot;Bullet&quot; Cockpit Console
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Trip Status: <strong className="text-emerald-400 uppercase">{pool.status}</strong> •
            Pickup Zone: <strong className="text-white">Zone #{pool.pickupZoneId}</strong>
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-3 glass-panel text-slate-300 hover:text-white rounded-2xl transition cursor-pointer border border-slate-700 hover:border-emerald-500/50 flex items-center gap-2 text-xs font-bold w-fit"
          title="Refresh Cockpit"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span>Sync Cockpit</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid: Cockpit Cabin Layout on Left, Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Google Map, Cabin & Passengers (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <GoogleMapView
            pickupZoneId={pool.pickupZoneId}
            destZoneId={pool.members[0]?.rideRequest?.destZoneId || 2}
            distanceKm={3.5}
            showTeslaMarker={true}
            driverName="Jashim"
            vehicleName="Bullet"
            height="h-[320px]"
          />

          <TeslaCabinView
            capacity={pool.capacity}
            occupiedSeats={pool.seatsOccupied}
            selectedSeats={0}
            driverName="Jashim"
          />

          {/* Passenger Manifest Card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Passenger Manifest</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                {pool.members.length} / {pool.capacity} Manifested
              </span>
            </div>

            <div className="space-y-3">
              {pool.members.map((member, index) => {
                const req = member.rideRequest;
                return (
                  <div
                    key={member.id}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">
                        Passenger #{index + 1}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Drop-off: Zone #{req?.destZoneId} • {member.seats} Seat{member.seats > 1 ? "s" : ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          Locked Fare
                        </div>
                        <div className="text-base font-black text-emerald-400">
                          {formatPaisaToBDT(req?.finalFarePaisa || req?.estimatedFarePaisa || 0)}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800 border border-slate-700 text-slate-300 uppercase">
                        {req?.paymentMethod}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: State Machine Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel-elevated p-7 rounded-3xl space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
              Trip State Machine
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed">
              Transition pool lifecycle according to business rules. Starting trip locks fares
              for all passengers and applies the 20% discount.
            </p>

            <div className="space-y-3 pt-2">
              {/* Mark Arrival */}
              {pool.status === "ACCEPTED" && (
                <button
                  onClick={() => handleAction("arrive")}
                  disabled={poolActionMutation.isPending}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition hover:scale-[1.02] cursor-pointer"
                >
                  {poolActionMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4 fill-slate-950" />
                  )}
                  <span>Mark Arrived at Pickup</span>
                </button>
              )}

              {/* Start Trip (Locks Fares) */}
              {(pool.status === "ACCEPTED" || pool.status === "DRIVER_ARRIVED") && (
                <button
                  onClick={() => handleAction("start")}
                  disabled={poolActionMutation.isPending}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black text-sm shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition hover:scale-[1.02] cursor-pointer"
                >
                  {poolActionMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-slate-950" />
                  )}
                  <span>Start Trip (Lock Fares & Discount)</span>
                </button>
              )}

              {/* Complete Trip */}
              {pool.status === "STARTED" && (
                <button
                  onClick={() => handleAction("complete")}
                  disabled={poolActionMutation.isPending}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-sm shadow-[0_0_35px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 transition hover:scale-[1.02] cursor-pointer"
                >
                  {poolActionMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5 stroke-[3]" />
                  )}
                  <span>Complete Trip & Settle Payments</span>
                </button>
              )}

              {/* Cancel Pool */}
              {pool.status !== "STARTED" && (
                <button
                  onClick={() => handleAction("cancel")}
                  disabled={poolActionMutation.isPending}
                  className="w-full py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel Pool (Re-open requests)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
