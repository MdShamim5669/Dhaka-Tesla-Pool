"use client";

import { History, MapPin, Users, Loader2, RefreshCw } from "lucide-react";
import { useDriverPoolHistory } from "@/lib/hooks/useDriver";
import { formatDateTime } from "@/lib/utils/format";

export default function DriverHistoryPage() {
  const { data: pools = [], isLoading, refetch } = useDriverPoolHistory();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Driver Trip History
          </h1>
          <p className="text-slate-400 mt-1">
            Review your completed pool trips and capacity efficiency.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
          title="Refresh History"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      ) : pools.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <History className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-white font-semibold">No Past Trips</p>
          <p className="text-slate-400 text-sm mt-1">
            Completed pool trips will be listed here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pools.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      p.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {p.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {p.completedAt ? formatDateTime(p.completedAt) : "Recent"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-white">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>
                    Pickup Anchor: Zone #{p.pickupZoneId} • Corridor: {p.corridor}
                  </span>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
                <div className="text-xs text-slate-400">Seats Utilized</div>
                <div className="flex items-center gap-1.5 text-base font-bold text-white justify-end">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>
                    {p.seatsOccupied} / {p.capacity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
