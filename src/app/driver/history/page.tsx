"use client";

import { useEffect, useState } from "react";
import { History, MapPin, Users, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { Pool } from "@/types/pool";
import { formatDateTime } from "@/lib/utils/format";

export default function DriverHistoryPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/driver/pools")
      .then((res) => {
        setPools(res.data.data || []);
      })
      .catch(() => {
        // Mock sample history for preview
        setPools([
          {
            id: "pool-demo-completed-1",
            teslaId: "bullet",
            status: "COMPLETED",
            pickupZoneId: 1,
            corridor: "North-East",
            seatsOccupied: 2,
            capacity: 3,
            startedAt: new Date(Date.now() - 3600000 * 25).toISOString(),
            completedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            members: [],
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Driver Trip History
        </h1>
        <p className="text-slate-400 mt-1">
          Review your completed pool trips and capacity efficiency.
        </p>
      </div>

      {loading ? (
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
