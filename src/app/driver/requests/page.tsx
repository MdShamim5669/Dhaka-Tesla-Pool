"use client";

import { useRouter } from "next/navigation";
import {
  Inbox,
  MapPin,
  Users,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useDriverRequests, useAcceptRideRequest } from "@/lib/hooks/useDriver";
import { formatPaisaToBDT } from "@/lib/utils/format";

export default function DriverRequestsPage() {
  const router = useRouter();

  // TanStack Query: Live polling for incoming requests
  const { data: requests = [], isLoading, isError, error, refetch } = useDriverRequests();
  const acceptMutation = useAcceptRideRequest();

  const handleAccept = (rideId: string) => {
    acceptMutation.mutate(rideId, {
      onSuccess: () => {
        router.push("/driver/pool");
      },
    });
  };

  const errorMessage = isError
    ? error?.message
    : acceptMutation.isError
    ? acceptMutation.error?.message
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Compatible Ride Requests
          </h1>
          <p className="text-slate-400 mt-1">
            Accept compatible passenger requests to fill empty seats in your pool.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
          title="Refresh Feed"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <Inbox className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-white font-semibold">No Pending Requests</p>
          <p className="text-slate-400 text-sm mt-1">
            Compatible requests in your pickup zone and corridor will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    Pickup: Zone #{req.pickupZoneId}
                  </span>
                  <span className="text-slate-500 text-xs">→</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Dest: Zone #{req.destZoneId}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold ml-2 uppercase">
                    ({req.paymentMethod})
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>{req.seats} Seat{req.seats > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>~{(req.distanceM / 1000).toFixed(1)} km</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:border-l sm:border-slate-800 sm:pl-6">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-400">Est. Fare</div>
                  <div className="text-xl font-bold text-white">
                    {formatPaisaToBDT(req.estimatedFarePaisa)}
                  </div>
                </div>

                <button
                  onClick={() => handleAccept(req.id)}
                  disabled={acceptMutation.isPending}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition text-sm disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {acceptMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Accept into Pool</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
