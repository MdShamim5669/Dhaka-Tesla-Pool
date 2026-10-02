"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Car,
  Users,
  Navigation,
  Play,
  Check,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { Pool } from "@/types/pool";
import { formatPaisaToBDT } from "@/lib/utils/format";

export default function DriverPoolPage() {
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentPool = async () => {
    try {
      const res = await apiClient.get("/driver/pools/current");
      setPool(res.data.data);
    } catch {
      // Mock demonstration pool matching PRD (Jashim's Bullet with Nusrat & Rafiq)
      setPool({
        id: "pool-bullet-demo-1",
        teslaId: "tesla-bullet",
        status: "ACCEPTED",
        pickupZoneId: 1, // Banani
        corridor: "North-East",
        seatsOccupied: 2,
        capacity: 3,
        members: [
          {
            id: "pm-1",
            poolId: "pool-bullet-demo-1",
            rideRequestId: "req-nusrat-1",
            seats: 1,
            joinedAt: new Date().toISOString(),
            rideRequest: {
              id: "req-nusrat-1",
              passengerId: "p1",
              pickupZoneId: 1,
              destZoneId: 2,
              seats: 1,
              status: "MATCHED",
              distanceM: 3000,
              estimatedFarePaisa: 10400,
              finalFarePaisa: 8320,
              paymentMethod: "TESLAPAY",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          {
            id: "pm-2",
            poolId: "pool-bullet-demo-1",
            rideRequestId: "req-rafiq-2",
            seats: 1,
            joinedAt: new Date().toISOString(),
            rideRequest: {
              id: "req-rafiq-2",
              passengerId: "p2",
              pickupZoneId: 1,
              destZoneId: 3,
              seats: 1,
              status: "MATCHED",
              distanceM: 4000,
              estimatedFarePaisa: 12200,
              finalFarePaisa: 9760,
              paymentMethod: "CASH",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentPool();
  }, []);

  const handleAction = async (action: "arrive" | "start" | "complete" | "cancel") => {
    if (!pool) return;
    if (action === "cancel" && !confirm("Are you sure you want to cancel this pool trip?")) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await apiClient.post(`/driver/pools/${pool.id}/${action}`);
      await fetchCurrentPool();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to perform action: ${action}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p>Loading current pool status...</p>
      </div>
    );
  }

  if (!pool || pool.status === "COMPLETED" || pool.status === "CANCELLED") {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
        <Car className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">No Active Pool</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
          You don&apos;t have any active pool trip in progress. Accept requests to start a new pool.
        </p>
        <Link
          href="/driver/requests"
          className="mt-6 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition text-sm shadow-lg shadow-emerald-500/20"
        >
          View Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Active Pool Trip Control
          </h1>
          <p className="text-slate-400 mt-1">
            Status: <span className="font-semibold text-emerald-400">{pool.status}</span> •
            Corridor: <span className="text-slate-200">{pool.corridor}</span>
          </p>
        </div>

        <button
          onClick={fetchCurrentPool}
          className="p-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl transition"
          title="Refresh Pool"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Capacity & Seat Visualizer */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white">Tesla &quot;Bullet&quot; Capacity</span>
          </div>
          <span className="text-sm font-semibold text-slate-300">
            {pool.seatsOccupied} / {pool.capacity} Seats Filled
          </span>
        </div>

        {/* Seat Slots */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: pool.capacity }).map((_, idx) => {
            const isFilled = idx < pool.seatsOccupied;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition ${
                  isFilled
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-800/40 border-slate-700/60 text-slate-500"
                }`}
              >
                <Car className={`w-6 h-6 ${isFilled ? "text-emerald-400" : "text-slate-600"}`} />
                <span className="text-xs font-semibold">
                  Seat #{idx + 1}: {isFilled ? "Occupied" : "Available"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Passenger Pool Members List */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl space-y-4">
        <h2 className="text-lg font-bold text-white">Pool Members ({pool.members.length})</h2>

        <div className="space-y-3">
          {pool.members.map((member, index) => {
            const req = member.rideRequest;
            return (
              <div
                key={member.id}
                className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="font-semibold text-white">
                    Passenger #{index + 1}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Destination: Zone #{req?.destZoneId} • {member.seats} Seat{member.seats > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Locked Individual Fare</div>
                    <div className="text-base font-bold text-emerald-400">
                      {formatPaisaToBDT(req?.finalFarePaisa || req?.estimatedFarePaisa || 0)}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 uppercase">
                    {req?.paymentMethod}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Actions (State Machine Control) */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl space-y-4">
        <h2 className="text-lg font-bold text-white">Trip Controls</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Mark Arrival */}
          {pool.status === "ACCEPTED" && (
            <button
              onClick={() => handleAction("arrive")}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3.5 rounded-xl transition text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              <span>Mark Arrived</span>
            </button>
          )}

          {/* Start Trip (Locks Fares) */}
          {(pool.status === "ACCEPTED" || pool.status === "DRIVER_ARRIVED") && (
            <button
              onClick={() => handleAction("start")}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Start Trip (Lock Fares)</span>
            </button>
          )}

          {/* Complete Trip */}
          {pool.status === "STARTED" && (
            <button
              onClick={() => handleAction("complete")}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Complete & Settle</span>
            </button>
          )}

          {/* Cancel Pool */}
          {pool.status !== "STARTED" && (
            <button
              onClick={() => handleAction("cancel")}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold py-3.5 rounded-xl transition text-sm disabled:opacity-50 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Pool</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
