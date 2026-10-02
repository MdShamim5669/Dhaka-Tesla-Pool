"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Users, Wallet, Banknote, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { Zone, PaymentMethod } from "@/types/ride";
import { formatPaisaToBDT } from "@/lib/utils/format";

// Default seed zones as fallback if API is not yet running
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
  const [zones, setZones] = useState<Zone[]>(DEFAULT_ZONES);
  const [pickupZoneId, setPickupZoneId] = useState<number>(1); // Banani
  const [destZoneId, setDestZoneId] = useState<number>(2); // Mohakhali
  const [seats, setSeats] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TESLAPAY");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estimated fare calculation state
  const [estimate, setEstimate] = useState<{
    soloPaisa: number;
    pooledPaisa: number;
    distanceKm: number;
  }>({
    soloPaisa: 10400, // ৳104.00 for Banani -> Mohakhali (3km)
    pooledPaisa: 8320, // ৳83.20 (20% pool discount)
    distanceKm: 3,
  });

  useEffect(() => {
    // Fetch available zones from API
    apiClient
      .get("/zones")
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setZones(res.data.data);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_ZONES
      });
  }, []);

  // Update fare estimate whenever pickup, dest or seats change
  useEffect(() => {
    if (pickupZoneId === destZoneId) {
      setError("Pickup and destination zones must be different");
      return;
    }
    setError(null);
    setLoading(true);

    apiClient
      .post("/fares/estimate", {
        pickupZoneId,
        destZoneId,
        seats,
      })
      .then((res) => {
        const data = res.data.data;
        setEstimate({
          soloPaisa: data.soloFarePaisa || data.soloPaisa || 10400 * seats,
          pooledPaisa: data.pooledFarePaisa || data.pooledPaisa || 8320 * seats,
          distanceKm: data.distanceKm || 3,
        });
      })
      .catch(() => {
        // Client-side fallback calculation matching PRD rules (base: ৳50, perKm: ৳18, discount: 20%)
        const estimatedKm = Math.abs(destZoneId - pickupZoneId) * 1.5 + 2;
        const subtotal = 5000 + Math.round(estimatedKm * 1800);
        const discount = Math.floor((subtotal * 2000) / 10000);
        setEstimate({
          soloPaisa: subtotal * seats,
          pooledPaisa: (subtotal - discount) * seats,
          distanceKm: estimatedKm,
        });
      })
      .finally(() => setLoading(false));
  }, [pickupZoneId, destZoneId, seats]);

  const handleBooking = async () => {
    if (pickupZoneId === destZoneId) {
      setError("Please select different pickup and destination zones");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const idempotencyKey = `dtp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const res = await apiClient.post(
        "/rides",
        {
          pickupZoneId,
          destZoneId,
          seats,
          paymentMethod,
        },
        {
          headers: {
            "Idempotency-Key": idempotencyKey,
          },
        }
      );

      const ride = res.data.data;
      if (ride?.id) {
        localStorage.setItem("dtp_active_ride_id", ride.id);
      }
      router.push("/passenger/active");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to request ride. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const pickupZone = zones.find((z) => z.id === pickupZoneId);
  const destZone = zones.find((z) => z.id === destZoneId);

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

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ride Selection Form */}
        <div className="lg:col-span-2 space-y-6 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
          {/* Pickup & Destination */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Pickup Zone
              </label>
              <select
                value={pickupZoneId}
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
              <span className="text-slate-400">~{estimate.distanceKm.toFixed(1)} km</span>
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
                  className={`py-3 rounded-xl border text-sm font-semibold transition flex flex-col items-center justify-center gap-1 ${
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
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition flex items-center gap-3 ${
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
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition flex items-center gap-3 ${
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
                {loading && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
              </div>

              {/* Pooled Price Highlight */}
              <div className="my-6 p-4 rounded-xl bg-gradient-to-br from-cyan-950/60 to-emerald-950/40 border border-cyan-500/30">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>If Pooled (2+ Passengers)</span>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {formatPaisaToBDT(estimate.pooledPaisa)}
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
                    {formatPaisaToBDT(estimate.soloPaisa)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Seats:</span>
                  <span className="text-slate-200">{seats}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Distance:</span>
                  <span className="text-slate-200">{estimate.distanceKm.toFixed(1)} km</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={submitting || pickupZoneId === destZoneId}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-semibold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 text-sm cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Requesting Tesla..." : "Confirm Ride Request"}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
