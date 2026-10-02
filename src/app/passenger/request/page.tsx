"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Users,
  Wallet,
  Banknote,
  Sparkles,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useZones, useFareEstimate, useCreateRideRequest } from "@/lib/hooks/useRides";
import { Zone, PaymentMethod } from "@/types/ride";
import { formatPaisaToBDT } from "@/lib/utils/format";

const DEFAULT_ZONES: Zone[] = [
  { id: 1, name: "Banani", corridor: "North-East" },
  { id: 2, name: "Mohakhali", corridor: "North-East" },
  { id: 3, name: "Gulshan 1", corridor: "North-East" },
  { id: 4, name: "Gulshan 2", corridor: "North-East" },
  { id: 5, name: "Baridhara", corridor: "North-East" },
  { id: 6, name: "Uttara", corridor: "North" },
  { id: 7, name: "Airport", corridor: "North" },
  { id: 8, name: "Mirpur", corridor: "West" },
  { id: 9, name: "Dhanmondi", corridor: "West" },
  { id: 10, name: "Bashundhara", corridor: "East" },
];

export default function RequestRidePage() {
  const router = useRouter();
  const [pickupZoneId, setPickupZoneId] = useState<number>(1);
  const [destZoneId, setDestZoneId] = useState<number>(2);
  const [seats, setSeats] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TESLAPAY");
  const [validationError, setValidationError] = useState<string | null>(null);

  // TanStack Query: Fetch zones
  const { data: zonesData, isLoading: zonesLoading } = useZones();
  const zones = zonesData && zonesData.length > 0 ? zonesData : DEFAULT_ZONES;

  // TanStack Query: Live Fare Estimate
  const { data: estimateData, isLoading: estimateLoading } = useFareEstimate({
    pickupZoneId,
    destZoneId,
    seats,
  });

  // TanStack Mutation: Request Ride
  const createRideMutation = useCreateRideRequest();

  // Fallback calculation if backend endpoint is in flight
  const estimatedKm = Math.abs(destZoneId - pickupZoneId) * 1.5 + 2;
  const subtotalFallback = 5000 + Math.round(estimatedKm * 1800);
  const discountFallback = Math.floor((subtotalFallback * 2000) / 10000);

  const soloFarePaisa = estimateData?.soloFarePaisa ?? subtotalFallback * seats;
  const pooledFarePaisa =
    estimateData?.pooledFarePaisa ?? (subtotalFallback - discountFallback) * seats;
  const distanceKm = estimateData?.distanceKm ?? estimatedKm;

  const handleBooking = async () => {
    if (pickupZoneId === destZoneId) {
      setValidationError("Pickup and destination zones must be different");
      return;
    }
    setValidationError(null);

    const idempotencyKey = `dtp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    createRideMutation.mutate(
      {
        pickupZoneId,
        destZoneId,
        seats,
        paymentMethod,
        idempotencyKey,
      },
      {
        onSuccess: (newRide) => {
          if (newRide?.id && typeof window !== "undefined") {
            localStorage.setItem("dtp_active_ride_id", newRide.id);
          }
          router.push("/passenger/active");
        },
      }
    );
  };

  const pickupZone = zones.find((z) => z.id === pickupZoneId);
  const destZone = zones.find((z) => z.id === destZoneId);
  const errorMsg =
    validationError || (createRideMutation.isError ? createRideMutation.error?.message : null);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Request a Tesla Pool
        </h1>
        <p className="text-slate-400 mt-1">
          Lock in your seat and match with commuters traveling in your corridor.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ride Selection Form */}
        <div className="space-y-6 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm lg:col-span-2">
          {/* Pickup & Destination */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Pickup Zone
              </label>
              <select
                value={pickupZoneId}
                disabled={zonesLoading}
                onChange={(e) => setPickupZoneId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition text-sm"
              >
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} ({zone.corridor} Corridor)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Destination Zone
              </label>
              <select
                value={destZoneId}
                disabled={zonesLoading}
                onChange={(e) => setDestZoneId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition text-sm"
              >
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} ({zone.corridor} Corridor)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Corridor Notice */}
          {pickupZone && destZone && (
            <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-cyan-300 flex items-center justify-between">
              <span>Matching Corridor: <strong>{destZone.corridor}</strong></span>
              <span className="text-slate-400">~{distanceKm.toFixed(1)} km</span>
            </div>
          )}

          {/* Seats Selection */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Seats Needed (1–3)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeats(s)}
                  className={`py-3 rounded-xl border text-sm font-semibold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    seats === s
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                      : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span className="text-base">{s}</span>
                  <span className="text-xs font-normal opacity-80">
                    {s === 1 ? "Solo Seat" : `${s} Seats`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("TESLAPAY")}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition flex items-center gap-3 cursor-pointer ${
                  paymentMethod === "TESLAPAY"
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <Wallet className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <div className="font-semibold text-white">TeslaPay Wallet</div>
                  <div className="text-xs text-slate-400">Instant cashless debit</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition flex items-center gap-3 cursor-pointer ${
                  paymentMethod === "CASH"
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <div className="font-semibold text-white">Cash</div>
                  <div className="text-xs text-slate-400">Pay driver at end</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Fare Summary Card */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-semibold text-white text-lg">Fare Breakdown</span>
                {estimateLoading && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
              </div>

              {/* Pooled Price Highlight */}
              <div className="my-6 p-4 rounded-xl bg-gradient-to-br from-cyan-950/60 to-emerald-950/40 border border-cyan-500/30">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>If Pooled (2+ Passengers)</span>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {formatPaisaToBDT(pooledFarePaisa)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Includes 20% pooling discount applied at trip start
                </div>
              </div>

              {/* Standard Price */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Solo / Unpooled Estimate:</span>
                  <span className="text-slate-200 line-through">
                    {formatPaisaToBDT(soloFarePaisa)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Seats:</span>
                  <span className="text-slate-200">{seats}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Distance:</span>
                  <span className="text-slate-200">{distanceKm.toFixed(1)} km</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={createRideMutation.isPending || pickupZoneId === destZoneId}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-semibold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 text-sm cursor-pointer"
            >
              {createRideMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {createRideMutation.isPending ? "Requesting Tesla..." : "Confirm Ride Request"}
              {!createRideMutation.isPending && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
