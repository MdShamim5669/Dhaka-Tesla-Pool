"use client";

import { useEffect, useState } from "react";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { RideRequest } from "@/types/ride";
import { formatPaisaToBDT, formatDateTime } from "@/lib/utils/format";

export default function RideHistoryPage() {
  const [rides, setRides] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/rides")
      .then((res) => {
        setRides(res.data.data || []);
      })
      .catch(() => {
        // Mock sample history for preview
        setRides([
          {
            id: "ride-demo-1",
            passengerId: "p1",
            pickupZoneId: 1,
            destZoneId: 2,
            seats: 1,
            status: "COMPLETED",
            distanceM: 3000,
            estimatedFarePaisa: 10400,
            finalFarePaisa: 8320,
            paymentMethod: "TESLAPAY",
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 23).toISOString(),
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Ride History
        </h1>
        <p className="text-slate-400 mt-1">
          Review your past pooled and solo Tesla trips.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      ) : rides.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <Navigation className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-white font-semibold">No rides found</p>
          <p className="text-slate-400 text-sm mt-1">
            Completed rides will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
            <div
              key={ride.id}
              className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      ride.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : ride.status === "CANCELLED"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                    }`}
                  >
                    {ride.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDateTime(ride.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-white">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>
                    Pickup Zone {ride.pickupZoneId} → Destination Zone{" "}
                    {ride.destZoneId}
                  </span>
                  <span className="text-slate-500 text-xs">
                    ({ride.seats} seat{ride.seats > 1 ? "s" : ""})
                  </span>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
                <div className="text-xs text-slate-400">Paid Amount</div>
                <div className="text-lg font-bold text-white">
                  {formatPaisaToBDT(ride.finalFarePaisa || ride.estimatedFarePaisa)}
                </div>
                <div className="text-xs text-slate-500 uppercase font-semibold">
                  {ride.paymentMethod}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
