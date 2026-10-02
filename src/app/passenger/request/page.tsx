"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Wallet,
  Banknote,
  Sparkles,
  Loader2,
  ArrowRight,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useZones, useFareEstimate, useCreateRideRequest } from "@/lib/hooks/useRides";
import { Zone, PaymentMethod } from "@/types/ride";
import { formatPaisaToBDT } from "@/lib/utils/format";
import { CorridorRouteMap } from "@/components/shared/CorridorRouteMap";
import { TeslaCabinView } from "@/components/shared/TeslaCabinView";

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

  // Fallback calculation matching PRD rules (base: ৳50, perKm: ৳18, discount: 20%)
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

  const pickupZone = zones.find((z) => z.id === pickupZoneId) || DEFAULT_ZONES[0];
  const destZone = zones.find((z) => z.id === destZoneId) || DEFAULT_ZONES[1];
  const errorMsg =
    validationError || (createRideMutation.isError ? createRideMutation.error?.message : null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5 fill-cyan-400" />
            <span>Tesla &quot;Bullet&quot; Corridor Dispatch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Reserve Your Pool Seat
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Pick your corridor zones, select your Tesla seats, and secure automatic 20% pooling savings.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, Radar & Cabin on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Booking Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel-elevated p-7 rounded-3xl space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Route & Vehicle Configuration</span>
            </h2>

            {/* Zone Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  Pickup Zone
                </label>
                <select
                  value={pickupZoneId}
                  disabled={zonesLoading}
                  onChange={(e) => setPickupZoneId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400 transition text-sm font-medium shadow-inner"
                >
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} ({zone.corridor} Corridor)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Destination Zone
                </label>
                <select
                  value={destZoneId}
                  disabled={zonesLoading}
                  onChange={(e) => setDestZoneId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-400 transition text-sm font-medium shadow-inner"
                >
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} ({zone.corridor} Corridor)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive Tesla Cabin Seat Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Passenger Seats (Capacity: 3 Max)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeats(s)}
                    className={`py-3.5 rounded-2xl border text-sm font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      seats === s
                        ? "bg-gradient-to-b from-cyan-500/20 to-emerald-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-lg font-black">{s}</span>
                    <span className="text-[11px] font-normal opacity-80">
                      {s === 1 ? "1 Seat (Solo)" : `${s} Seats`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Options */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Settlement Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("TESLAPAY")}
                  className={`p-4 rounded-2xl border text-sm font-medium transition flex items-center gap-3.5 cursor-pointer ${
                    paymentMethod === "TESLAPAY"
                      ? "bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white">TeslaPay Wallet</div>
                    <div className="text-xs text-slate-400">Cashless instant debit</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`p-4 rounded-2xl border text-sm font-medium transition flex items-center gap-3.5 cursor-pointer ${
                    paymentMethod === "CASH"
                      ? "bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white">Cash Direct</div>
                    <div className="text-xs text-slate-400">Pay driver at drop-off</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Price Breakdown Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 shadow-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Locked Pooled Rate</span>
                  {estimateLoading && <Loader2 className="w-3 h-3 animate-spin text-cyan-400 ml-1" />}
                </div>
                <div className="text-4xl font-black text-white tracking-tight">
                  {formatPaisaToBDT(pooledFarePaisa)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Standard solo fare:{" "}
                  <span className="line-through text-slate-500">
                    {formatPaisaToBDT(soloFarePaisa)}
                  </span>{" "}
                  (Save 20%)
                </div>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold rounded-full">
                  20% OFF
                </span>
                <div className="text-[11px] text-slate-400 mt-1">
                  {seats} Seat{seats > 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleBooking}
              disabled={createRideMutation.isPending || pickupZoneId === destZoneId}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-base shadow-[0_0_35px_rgba(6,182,212,0.4)] hover:scale-[1.01] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {createRideMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Locking Tesla & Fares...</span>
                </>
              ) : (
                <>
                  <span>Confirm Ride Request</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Visual Radar & Cabin Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <CorridorRouteMap
            pickupZone={pickupZone}
            destZone={destZone}
            distanceKm={distanceKm}
            discountPercentage={20}
          />
          <TeslaCabinView
            capacity={3}
            occupiedSeats={0}
            selectedSeats={seats}
            driverName="Jashim"
            interactive={true}
            onSelectSeats={(s) => setSeats(s)}
          />
        </div>
      </div>
    </div>
  );
}
