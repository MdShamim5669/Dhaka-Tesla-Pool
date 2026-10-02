"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
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
  X,
} from "lucide-react";
import { useZones, useFareEstimate, useCreateRideRequest } from "@/lib/hooks/useRides";
import { useAuth } from "@/providers/AuthProvider";
import { useLoginMutation } from "@/lib/hooks/useAuthMutation";
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
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Auth context & mutations
  const { user, token } = useAuth();
  const loginMutation = useLoginMutation();

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

  const executeRideCreation = () => {
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
        onError: (err: Error) => {
          if (
            err.message?.toLowerCase().includes("authorization") ||
            err.message?.toLowerCase().includes("token")
          ) {
            setShowAuthModal(true);
          }
        },
      }
    );
  };

  const handleBooking = async () => {
    if (pickupZoneId === destZoneId) {
      setValidationError("Pickup and destination zones must be different");
      return;
    }
    setValidationError(null);

    // If user is not authenticated, prompt sign-in modal
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    executeRideCreation();
  };

  const handleInstantDemoLogin = async () => {
    try {
      await loginMutation.mutateAsync(
        { email: "nusrat@example.com", password: "password123" },
        {
          onSuccess: () => {
            setShowAuthModal(false);
            executeRideCreation();
          },
        }
      );
    } catch {
      // Handled in mutation state
    }
  };

  const errorMsg =
    validationError || (createRideMutation.isError ? createRideMutation.error?.message : null);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Cyber Command Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>FLEET STATUS: ACTIVE • 10 DHAKA CORRIDORS ONLINE</span>
            </div>
            {user ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{user.name} ({user.role})</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-cyan-400" />
                <span>Sign In / Demo Login</span>
              </button>
            )}
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
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span className="font-semibold">
              {errorMsg.toLowerCase().includes("authorization") ||
              errorMsg.toLowerCase().includes("token")
                ? "Passenger login required to confirm ride."
                : errorMsg}
            </span>
          </div>
          {(errorMsg.toLowerCase().includes("authorization") ||
            errorMsg.toLowerCase().includes("token") ||
            !token) && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition cursor-pointer self-start sm:self-auto shrink-0 shadow-md"
            >
              Sign In to Book
            </button>
          )}
        </div>
      )}

      {/* Main Booking Cockpit (7 Cols Left Form + 5 Cols Right Telemetry) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Booking Controls (7 Cols) - Compact Executive Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel-elevated p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3.5">
            {/* Header with Booking Mode Toggle */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    Ride Configuration
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    Corridor dispatch parameters
                  </p>
                </div>
              </div>

              {/* Compact Dispatch Switcher: Now vs Reserve */}
              <div className="inline-flex rounded-xl bg-slate-950 p-0.5 border border-slate-800 text-[11px] font-bold shadow-inner">
                <button
                  type="button"
                  onClick={() => setBookingMode("NOW")}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    bookingMode === "NOW"
                      ? "bg-cyan-500 text-slate-950 shadow-sm font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode("RESERVE")}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    bookingMode === "RESERVE"
                      ? "bg-[#95B8C0] text-slate-950 shadow-sm font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>Reserve</span>
                </button>
              </div>
            </div>

            {/* Plan for Later / Tesla Reserve Box - Compact */}
            {bookingMode === "RESERVE" && (
              <div className="p-3 rounded-xl bg-[#95B8C0]/15 border border-[#95B8C0]/35 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#95B8C0]" />
                    <span>Scheduled Departure</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#95B8C0]/20 text-[#95B8C0] font-bold">
                    Free Cancel (60m)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-300 block mb-0.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={reserveDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setReserveDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-[#95B8C0] cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-300 block mb-0.5">
                      Time
                    </label>
                    <input
                      type="time"
                      value={reserveTime}
                      onChange={(e) => setReserveTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-[#95B8C0] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-slate-300 flex items-center gap-1.5 pt-1 border-t border-[#95B8C0]/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>15 min extra complimentary wait time included.</span>
                </div>
              </div>
            )}

            {/* Zone Pickers - Compact Unified Route Box */}
            <div className="relative bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                {/* Pickup Zone */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Pickup Point
                    </span>
                    <span className="text-[9px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                      {pickupZone.corridor}
                    </span>
                  </div>
                  <select
                    value={pickupZoneId}
                    disabled={zonesLoading}
                    onChange={(e) => setPickupZoneId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Zone */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Destination Point
                    </span>
                    <span className="text-[9px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                      {destZone.corridor}
                    </span>
                  </div>
                  <select
                    value={destZoneId}
                    disabled={zonesLoading}
                    onChange={(e) => setDestZoneId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Direction Swap Button */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                <span className="truncate">
                  {pickupZone.landmark} → {destZone.landmark}
                </span>
                <button
                  type="button"
                  onClick={handleSwapZones}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer py-0.5 px-2 rounded hover:bg-cyan-500/10 transition"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Swap</span>
                </button>
              </div>
            </div>

            {/* Passenger Seats Selector - Compact */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <label className="font-bold uppercase tracking-wider text-slate-400">
                  Passenger Seats
                </label>
                <span className="text-cyan-400 font-semibold text-[10px] flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Tesla Model 3 Capacity: 3
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { count: 1, label: "1 Seat", tag: "Solo / Co-Pool" },
                  { count: 2, label: "2 Seats", tag: "Duo Shared" },
                  { count: 3, label: "3 Seats", tag: "Private Cabin" },
                ].map((tier) => (
                  <button
                    key={tier.count}
                    type="button"
                    onClick={() => setSeats(tier.count)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                      seats === tier.count
                        ? "bg-cyan-500/20 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xs font-black text-white">{tier.label}</div>
                    <div className="text-[10px] text-cyan-300 font-semibold opacity-90">
                      {tier.tag}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector - Compact */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Payment Channel
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("TESLAPAY")}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                    paymentMethod === "TESLAPAY"
                      ? "bg-cyan-500/15 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-white text-xs">TeslaPay</div>
                    <div className="text-[10px] text-emerald-400 font-medium">Escrow Cashless</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                    paymentMethod === "CASH"
                      ? "bg-emerald-500/15 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-white text-xs">Cash Direct</div>
                    <div className="text-[10px] text-slate-400">Pay on arrival</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Price Breakdown Banner HUD - Sleek & Compact */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 shadow-md flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Locked Fare (20% Off)</span>
                  {estimateLoading && <Loader2 className="w-3 h-3 animate-spin text-cyan-400 ml-1" />}
                </div>

                <div className="flex items-baseline gap-2">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {formatPaisaToBDT(pooledFarePaisa)}
                  </div>
                  <div className="text-[11px] text-slate-500 line-through">
                    {formatPaisaToBDT(soloFarePaisa)}
                  </div>
                </div>

                <div className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Save {formatPaisaToBDT(savingsPaisa)} • ~{distanceKm.toFixed(1)} km</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black">
                  20% OFF
                </span>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                  <Lock className="w-2.5 h-2.5 text-cyan-400" />
                  <span>No Surge</span>
                </div>
              </div>
            </div>

            {/* Confirm Ride Request Button - Sleek */}
            <button
              onClick={handleBooking}
              disabled={createRideMutation.isPending || pickupZoneId === destZoneId}
              className={`w-full py-3.5 rounded-xl font-black text-sm shadow-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer ${
                bookingMode === "RESERVE"
                  ? "bg-[#95B8C0] hover:bg-[#83a8b0] text-slate-950 shadow-[0_0_25px_rgba(149,184,192,0.4)]"
                  : "bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
              }`}
            >
              {createRideMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Locking Tesla & Generating Idempotency...</span>
                </>
              ) : bookingMode === "RESERVE" ? (
                <>
                  <span>Confirm Tesla Reserve for {reserveDate} ({reserveTime})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Confirm Tesla Pool Dispatch</span>
                  <ArrowRight className="w-4 h-4" />
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

      {/* Passenger Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Sign In to Reserve</h3>
                <p className="text-xs text-slate-400">Dhaka Tesla Pool Booking</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              To reserve a seat in the Tesla Model 3 Bullet fleet and lock your 20% discount, an authenticated passenger account is required.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                disabled={loginMutation.isPending}
                onClick={handleInstantDemoLogin}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition cursor-pointer flex items-center justify-center gap-2"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in as Nusrat Jahan...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>1-Click Demo Login (Nusrat • ৳500 balance)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 my-2 text-slate-600 text-[10px] uppercase font-bold">
                <div className="flex-1 h-px bg-slate-800" />
                <span>or continue with email</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login?redirect=/passenger/request"
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700 text-center"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/register"
                  className="py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700/80 text-center"
                >
                  <span>Register</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
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
