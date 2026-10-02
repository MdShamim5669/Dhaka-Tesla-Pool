"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  Wallet,
  Banknote,
  Sparkles,
  Loader2,
  ArrowRight,
  ArrowUpDown,
  AlertCircle,
  Zap,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Car,
  Lock,
  Star,
  Users,
  BatteryCharging,
} from "lucide-react";
import { useZones, useFareEstimate, useCreateRideRequest } from "@/lib/hooks/useRides";
import { Zone, PaymentMethod } from "@/types/ride";
import { formatPaisaToBDT } from "@/lib/utils/format";
import { TeslaCabinView } from "@/components/shared/TeslaCabinView";
import { GoogleMapView } from "@/components/shared/GoogleMapView";

const DEFAULT_ZONES: (Zone & { landmark: string })[] = [
  { id: 1, name: "Banani", corridor: "North-East", landmark: "Road 11 & Kemal Ataturk" },
  { id: 2, name: "Mohakhali", corridor: "North-East", landmark: "Flyover & Wireless Gate" },
  { id: 3, name: "Gulshan 1", corridor: "North-East", landmark: "Circle 1 & Police Plaza" },
  { id: 4, name: "Gulshan 2", corridor: "North-East", landmark: "Circle 2 & Diplomatic Zone" },
  { id: 5, name: "Baridhara", corridor: "North-East", landmark: "Diplomatic Enclave & J Block" },
  { id: 6, name: "Uttara", corridor: "North", landmark: "Sector 3 & Rajlakshmi Complex" },
  { id: 7, name: "Airport", corridor: "North", landmark: "Hazrat Shahjalal Terminal 1 & 2" },
  { id: 8, name: "Mirpur", corridor: "West", landmark: "Mirpur 10 Circle & Metro Stn" },
  { id: 9, name: "Dhanmondi", corridor: "West", landmark: "Satmasjid Road & Dhanmondi 27" },
  { id: 10, name: "Bashundhara", corridor: "East", landmark: "Main Gate & Apollo Hospital" },
];

function RequestRideInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tomorrow's date formatted as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split("T")[0];

  const isInitiallyScheduled = searchParams.get("scheduled") === "true";
  const [bookingMode, setBookingMode] = useState<"NOW" | "RESERVE">(
    isInitiallyScheduled ? "RESERVE" : "NOW"
  );
  const [reserveDate, setReserveDate] = useState<string>(
    searchParams.get("date") || defaultDateStr
  );
  const [reserveTime, setReserveTime] = useState<string>(
    searchParams.get("time") || "09:30"
  );

  const [pickupZoneId, setPickupZoneId] = useState<number>(1); // Banani
  const [destZoneId, setDestZoneId] = useState<number>(2); // Mohakhali
  const [seats, setSeats] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TESLAPAY");
  const [validationError, setValidationError] = useState<string | null>(null);

  // TanStack Query: Fetch zones
  const { data: zonesData, isLoading: zonesLoading } = useZones();
  const zones: (Zone & { landmark?: string })[] =
    zonesData && zonesData.length > 0
      ? zonesData.map((z) => ({
          ...z,
          landmark:
            DEFAULT_ZONES.find((d) => d.id === z.id)?.landmark ||
            `${z.corridor} Transit Point`,
        }))
      : DEFAULT_ZONES;

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
  const savingsPaisa = soloFarePaisa - pooledFarePaisa;

  const pickupZone = zones.find((z) => z.id === pickupZoneId) || zones[0];
  const destZone = zones.find((z) => z.id === destZoneId) || zones[1];

  const handleSwapZones = () => {
    setPickupZoneId(destZoneId);
    setDestZoneId(pickupZoneId);
  };

  const handleApplyPreset = (pId: number, dId: number, s: number) => {
    setPickupZoneId(pId);
    setDestZoneId(dId);
    setSeats(s);
  };

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
            if (bookingMode === "RESERVE") {
              localStorage.setItem("dtp_reserved_slot", `${reserveDate} ${reserveTime}`);
            }
          }
          router.push("/passenger/active");
        },
      }
    );
  };

  const errorMsg =
    validationError || (createRideMutation.isError ? createRideMutation.error?.message : null);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Cyber Command Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>FLEET STATUS: ACTIVE • 10 DHAKA CORRIDORS ONLINE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Reserve Your Tesla Seat</span>
            <span className="text-xs sm:text-sm font-bold px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Save 20% Instant
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Autonomous ride pooling with verified Tesla Pilot Jashim. Model 3 Bullet (DHA-TES-001).
          </p>
        </div>

        {/* 1-Click Quick Presets matching PRD seed cast */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden xl:inline">
            Quick Route:
          </span>
          <button
            type="button"
            onClick={() => handleApplyPreset(1, 2, 1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
              pickupZoneId === 1 && destZoneId === 2
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <span>Nusrat</span>
            <span className="text-slate-500">Banani → Mohakhali</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset(4, 7, 2)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
              pickupZoneId === 4 && destZoneId === 7
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <span>Rafiq</span>
            <span className="text-slate-500">Gulshan 2 → Airport</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Main Booking Cockpit (7 Cols Left Form + 5 Cols Right Telemetry) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Booking Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            {/* Header with Booking Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">
                    Ride Configuration
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Custom corridor dispatch parameters
                  </p>
                </div>
              </div>

              {/* Dispatch Switcher: Now vs Reserve */}
              <div className="inline-flex rounded-2xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold shadow-inner">
                <button
                  type="button"
                  onClick={() => setBookingMode("NOW")}
                  className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    bookingMode === "NOW"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Dispatch Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode("RESERVE")}
                  className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    bookingMode === "RESERVE"
                      ? "bg-[#95B8C0] text-slate-950 shadow-md shadow-[#95B8C0]/30 font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Tesla Reserve</span>
                </button>
              </div>
            </div>

            {/* Plan for Later / Tesla Reserve Box */}
            {bookingMode === "RESERVE" && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#95B8C0]/20 via-[#95B8C0]/10 to-transparent border border-[#95B8C0]/40 space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#95B8C0]" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Tesla Reserve Schedule
                    </span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#95B8C0]/20 text-[#95B8C0] border border-[#95B8C0]/30 font-bold">
                    Zero-Fee Cancel (60m prior)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Departure Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={reserveDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setReserveDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#95B8C0] cursor-pointer shadow-inner"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Departure Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={reserveTime}
                        onChange={(e) => setReserveTime(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#95B8C0] cursor-pointer shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#95B8C0]/20 text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>15 min extra complimentary wait time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#95B8C0] shrink-0" />
                    <span>Guaranteed electric Model 3 dispatch</span>
                  </div>
                </div>
              </div>
            )}

            {/* Zone Pickers with Interactive Swap */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Corridor Origin & Destination
                </span>
                <button
                  type="button"
                  onClick={handleSwapZones}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-cyan-500/10 transition border border-transparent hover:border-cyan-500/20"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Swap Direction</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pickup Zone Card */}
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 space-y-2 hover:border-cyan-500/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Pickup Point
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                      {pickupZone.corridor}
                    </span>
                  </div>
                  <select
                    value={pickupZoneId}
                    disabled={zonesLoading}
                    onChange={(e) => setPickupZoneId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                  <div className="text-[11px] text-slate-400 truncate">
                    Landmark: <span className="text-slate-300">{pickupZone.landmark}</span>
                  </div>
                </div>

                {/* Destination Zone Card */}
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 space-y-2 hover:border-emerald-500/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Destination Point
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                      {destZone.corridor}
                    </span>
                  </div>
                  <select
                    value={destZoneId}
                    disabled={zonesLoading}
                    onChange={(e) => setDestZoneId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                  <div className="text-[11px] text-slate-400 truncate">
                    Landmark: <span className="text-slate-300">{destZone.landmark}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Seats Selector (Luxury Cabin Cards) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Passenger Seats Required
                </label>
                <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Tesla Model 3 Capacity: 3 Seats
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { count: 1, title: "1 Seat", desc: "Single Passenger", tag: "Solo / Co-Pool" },
                  { count: 2, title: "2 Seats", desc: "Two Passengers", tag: "Duo Shared" },
                  { count: 3, title: "3 Seats", desc: "Entire Cabin", tag: "Private Pool" },
                ].map((tier) => (
                  <button
                    key={tier.count}
                    type="button"
                    onClick={() => setSeats(tier.count)}
                    className={`p-4 rounded-2xl border text-left transition relative cursor-pointer ${
                      seats === tier.count
                        ? "bg-gradient-to-br from-cyan-950/60 to-slate-900 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base font-black text-white">{tier.title}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          seats === tier.count
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {tier.tag}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{tier.desc}</div>
                    <div className="text-[11px] font-bold text-emerald-400 mt-2">
                      {formatPaisaToBDT(Math.round(pooledFarePaisa / seats) * tier.count)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Payment Channel
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("TESLAPAY")}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 cursor-pointer ${
                    paymentMethod === "TESLAPAY"
                      ? "bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>TeslaPay Escrow</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                        RECOMMENDED
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Instant digital lock • Zero driver cash friction
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 cursor-pointer ${
                    paymentMethod === "CASH"
                      ? "bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Cash Direct</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Pay driver upon corridor arrival in cash
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Price Breakdown Banner HUD */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Guaranteed Pool Fare (20% Off Applied)</span>
                    {estimateLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400 ml-1" />}
                  </div>

                  <div className="flex items-baseline gap-3">
                    <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {formatPaisaToBDT(pooledFarePaisa)}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400">
                      Standard Solo:{" "}
                      <span className="line-through text-slate-500">
                        {formatPaisaToBDT(soloFarePaisa)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-emerald-300 font-semibold mt-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>You save {formatPaisaToBDT(savingsPaisa)} on this Dhaka corridor route</span>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="inline-block px-3.5 py-1.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                    LOCKED PRICING
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    {seats} Seat{seats > 1 ? "s" : ""} • ~{distanceKm.toFixed(1)} km
                  </div>
                </div>
              </div>

              {/* Exact Formula Breakdown Tooltip */}
              <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                <span>Base: ৳50.00 • Rate: ৳18.00/km • Integer Paisa Accuracy</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  Anti-Surge Guarantee
                </span>
              </div>
            </div>

            {/* Confirm Ride Request Button */}
            <button
              onClick={handleBooking}
              disabled={createRideMutation.isPending || pickupZoneId === destZoneId}
              className={`w-full py-4.5 rounded-2xl font-black text-base shadow-2xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer ${
                bookingMode === "RESERVE"
                  ? "bg-[#95B8C0] hover:bg-[#83a8b0] text-slate-950 shadow-[0_0_35px_rgba(149,184,192,0.4)] hover:scale-[1.01]"
                  : "bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.4)] hover:scale-[1.01]"
              }`}
            >
              {createRideMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Locking Tesla & Generating Trip Idempotency...</span>
                </>
              ) : bookingMode === "RESERVE" ? (
                <>
                  <span>Confirm Tesla Reserve for {reserveDate} ({reserveTime})</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <span>Confirm Tesla Pool Dispatch</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Google Maps & Tesla Cabin Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Driver Cockpit Preview Card */}
          <div className="glass-panel-elevated p-5 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-md">
                <Image
                  src="/images/driver_jashim.jpg"
                  alt="Pilot Jashim"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Pilot Jashim</span>
                  <span className="flex items-center text-xs font-bold text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                    4.9
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Tesla &quot;Bullet&quot; • <span className="text-cyan-400 font-mono">DHA-TES-001</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/30">
                <BatteryCharging className="w-3.5 h-3.5" />
                <span>94% SoC</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">AC Climate 21°C</div>
            </div>
          </div>

          {/* Real Google Map View */}
          <div className="space-y-3">
            <GoogleMapView
              pickupZoneId={pickupZoneId}
              destZoneId={destZoneId}
              distanceKm={distanceKm}
              showTeslaMarker={true}
              driverName="Jashim"
              vehicleName="Bullet"
              height="h-[360px]"
            />
          </div>

          {/* Interactive Tesla Cabin Seat Simulator */}
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

export default function RequestRidePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      }
    >
      <RequestRideInner />
    </Suspense>
  );
}
