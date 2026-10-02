"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Car,
  Shield,
  Wallet,
  Zap,
  MapPin,
  CheckCircle2,
  Compass,
  ArrowRight,
  Headphones,
  Gauge,
  Sparkles,
} from "lucide-react";
import { formatPaisaToBDT } from "@/lib/utils/format";
import { CorridorRouteMap } from "@/components/shared/CorridorRouteMap";
import { TeslaCabinView } from "@/components/shared/TeslaCabinView";
import { GoogleMapView } from "@/components/shared/GoogleMapView";
import { TeslaReserveSection } from "@/components/shared/TeslaReserveSection";
import { DriveWithUsSection } from "@/components/shared/DriveWithUsSection";
import { Typewriter } from "@/components/shared/Typewriter";

const ZONES = [
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

export default function Home() {
  const router = useRouter();
  const [pickupZoneId, setPickupZoneId] = useState<number>(1); // Banani
  const [destZoneId, setDestZoneId] = useState<number>(2); // Mohakhali
  const [seats, setSeats] = useState<number>(1);
  const [rideType, setRideType] = useState<"POOL" | "SOLO">("POOL");
  const [paymentMethod, setPaymentMethod] = useState<"TESLAPAY" | "CASH">("TESLAPAY");
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState<boolean>(false);
  const [mapTab, setMapTab] = useState<"google" | "radar">("google");

  // Exact hand-verified pricing calculation from PRD (base: ৳50, perKm: ৳18, 20% discount)
  const estimatedKm = Math.abs(destZoneId - pickupZoneId) * 1.5 + 2;
  const subtotal = 5000 + Math.round(estimatedKm * 1800);
  const discount = Math.floor((subtotal * 2000) / 10000);
  const soloFarePaisa = subtotal * seats;
  const pooledFarePaisa = (subtotal - discount) * seats;
  const finalDisplayFare = rideType === "POOL" ? pooledFarePaisa : soloFarePaisa;

  const pickupZone = ZONES.find((z) => z.id === pickupZoneId) || ZONES[0];
  const destZone = ZONES.find((z) => z.id === destZoneId) || ZONES[1];

  const applyPreset = (pId: number, dId: number, s: number) => {
    setPickupZoneId(pId);
    setDestZoneId(dId);
    setSeats(s);
  };

  const handleConfirmBooking = () => {
    router.push(`/passenger/request?pickup=${pickupZoneId}&dest=${destZoneId}&seats=${seats}&method=${paymentMethod}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="bg-slate-950 text-white sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-black">
              <Car className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-white leading-tight">
                Dhaka Tesla <span className="text-emerald-400">Pool</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Share a seat. Split the fare.
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <Link href="/" className="text-white hover:text-emerald-400 transition">
              Home
            </Link>
            <Link href="/passenger/request" className="hover:text-emerald-400 transition">
              Book Pool
            </Link>
            <Link href="/passenger/active" className="hover:text-emerald-400 transition">
              Live Trip
            </Link>
            <Link href="/passenger/wallet" className="hover:text-emerald-400 transition">
              TeslaPay Wallet
            </Link>
            <Link href="/driver" className="hover:text-emerald-400 transition">
              Driver Portal
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-bold text-slate-300 hover:text-white hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/passenger/request"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm px-6 py-2.5 rounded-full transition shadow-lg shadow-emerald-500/20 hover:scale-105"
            >
              Book Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Dual Split Background */}
      <section className="relative overflow-hidden bg-slate-950 pt-12 pb-36">
        {/* Split Backgrounds */}
        <div className="absolute inset-0 flex pointer-events-none">
          {/* Left: Deep Rich Burgundy/Maroon tone like reference image */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#380E13] via-[#2A0A0E] to-slate-950" />
          {/* Right: Deep Navy/Charcoal backdrop for car */}
          <div className="hidden lg:block w-1/2 bg-gradient-to-bl from-[#0A101D] via-[#080D18] to-slate-950" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-white pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dhaka Tesla Ride-Pooling MVP</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15]">
              Comfortable Rides, <br />
              <span className="text-white">Trusted Service</span> <br />
              <span className="text-emerald-400">
                <Typewriter
                  backspace="all"
                  words={[
                    "Every Time",
                    "Split the Fare",
                    "Zero Traffic Stress",
                    "Locked at 20% Off",
                    "Model 3 Luxury",
                  ]}
                  typingSpeed={70}
                  deletingSpeed={40}
                  delayBetweenWords={1800}
                  cursorClassName="text-emerald-400"
                />
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-lg font-normal leading-relaxed">
              Book a safe, reliable Tesla pool in Dhaka in just a few clicks. Share your route
              along North-East corridors and save up to 20% on every trip.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/passenger/request"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm px-8 py-3.5 rounded-full transition shadow-xl shadow-emerald-500/25 hover:scale-105"
              >
                Book Now
              </Link>
              <Link
                href="/driver"
                className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm px-8 py-3.5 rounded-full transition hover:scale-105 backdrop-blur-md"
              >
                Driver Cockpit
              </Link>
            </div>
          </div>

          {/* Right Hero Car Showcase */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="relative w-full max-w-[620px] aspect-[16/9] drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)]">
              <Image
                src="/images/tesla_hero.jpg"
                alt="Dhaka Tesla Pool Sedan Bullet"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Floating "Book Your Ride" Widget Card (Overlapping Hero) */}
      <section className="relative z-20 max-w-6xl mx-auto px-4 -mt-24 sm:-mt-28 mb-20">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Book Your Ride
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                We focus on your comfort, capacity safety, and fair pricing.
              </p>
            </div>

            {/* Quick Seed Cast Presets */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:block">
                Demo Cast:
              </span>
              <button
                type="button"
                onClick={() => applyPreset(1, 2, 1)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
              >
                Nusrat (Banani → Mohakhali)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(1, 3, 1)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
              >
                Rafiq (Banani → Gulshan 1)
              </button>
            </div>
          </div>

          {/* Form Fields: 2 Rows / 3 Columns Layout matching reference image */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            {/* Row 1, Col 1: Pickup Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Pickup Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={pickupZoneId}
                  onChange={(e) => setPickupZoneId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  {ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} ({zone.corridor} Corridor)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 1, Col 2: Drop-off Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Drop-off Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={destZoneId}
                  onChange={(e) => setDestZoneId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  {ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} ({zone.corridor} Corridor)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 1, Col 3: Corridor & Seats */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Seats Needed (Max 3 in Bullet)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeats(s)}
                    className={`py-2.5 rounded-xl border text-xs font-extrabold transition cursor-pointer ${
                      seats === s
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {s} {s === 1 ? "Seat" : "Seats"}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2, Col 1: Ride Mode */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Select Ride Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRideType("POOL")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    rideType === "POOL"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-800"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                  <span>Pool (20% OFF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRideType("SOLO")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    rideType === "SOLO"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-800"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <span>Solo Tesla</span>
                </button>
              </div>
            </div>

            {/* Row 2, Col 2: Payment Method */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("TESLAPAY")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === "TESLAPAY"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-800"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>TeslaPay Wallet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === "CASH"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-800"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <span>Cash to Pilot</span>
                </button>
              </div>
            </div>

            {/* Row 2, Col 3: Calculated Price Preview */}
            <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  Estimated Fare ({seats} seat{seats > 1 ? "s" : ""})
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {formatPaisaToBDT(finalDisplayFare)}
                </span>
              </div>
              <div className="text-right">
                {rideType === "POOL" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                    SAVE 20%
                  </span>
                )}
                <span className="block text-[11px] text-slate-400 mt-0.5">
                  ~{estimatedKm.toFixed(1)} km
                </span>
              </div>
            </div>
          </div>

          {/* Full Width Green Action Button matching reference */}
          <div className="mt-6 pt-2">
            <button
              onClick={handleConfirmBooking}
              className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 transition hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Confirm Booking</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Toggle Interactive Visual Corridor Drawer */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowTelemetryDrawer(!showTelemetryDrawer)}
              className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{showTelemetryDrawer ? "Hide Live Route Map & Cabin Preview" : "View Live Google Route Map & Tesla Cabin Seat Preview"}</span>
            </button>
          </div>

          {showTelemetryDrawer && (
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Live Route Visualizer</span>
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMapTab("google")}
                    className={`px-3 py-1 rounded-lg transition ${
                      mapTab === "google"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Google Map
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapTab("radar")}
                    className={`px-3 py-1 rounded-lg transition ${
                      mapTab === "radar"
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Cyber Radar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  {mapTab === "google" ? (
                    <GoogleMapView
                      pickupZoneId={pickupZoneId}
                      destZoneId={destZoneId}
                      distanceKm={estimatedKm}
                      driverName="Jashim"
                      vehicleName="Bullet"
                      height="h-[360px]"
                    />
                  ) : (
                    <CorridorRouteMap
                      pickupZone={pickupZone}
                      destZone={destZone}
                      distanceKm={estimatedKm}
                      discountPercentage={20}
                    />
                  )}
                </div>

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
          )}
        </div>
      </section>

      {/* "Why Choose Dhaka Tesla Pool?" Feature Section matching reference */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why Choose Dhaka Tesla Pool?
          </h2>
          <p className="text-slate-500 text-sm mt-3">
            We focus on your comfort, capacity safety, and predictable time.
          </p>
        </div>

        {/* 6 Grid Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Safety First */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl transition duration-300 flex flex-col items-center text-center group hover:-translate-y-1">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition">
              <Shield className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Safety First</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Background-checked pilot Jashim, sanitized AC cabin, 5-star crash rated
              Tesla Model 3, and individual passenger ride insurance.
            </p>
          </div>

          {/* Card 2: Affordable Fares */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl transition duration-300 flex flex-col items-center text-center group hover:-translate-y-1">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition">
              <Wallet className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Affordable Fares</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Exact hand-verified integer paisa pricing. Split the trip and get an automatic
              20% pool discount locked at departure.
            </p>
          </div>

          {/* Card 3: Zero Overbooking */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl transition duration-300 flex flex-col items-center text-center group hover:-translate-y-1">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Guaranteed Capacity</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              PostgreSQL atomic updates ensure seat count never exceeds 3, even under
              concurrent booking races on the last seat.
            </p>
          </div>

          {/* Card 4: Smart Corridor Match */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl transition duration-300 flex flex-col items-center text-center group hover:-translate-y-1">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition">
              <Compass className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Smart Corridor Match</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Direct corridor routing along North-East Dhaka (Banani, Gulshan, Mohakhali,
              Baridhara) with zero confusing detours.
            </p>
          </div>

          {/* Card 5: 24/7 TeslaPay Support */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl transition duration-300 flex flex-col items-center text-center group hover:-translate-y-1">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition">
              <Headphones className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">TeslaPay & Support</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Simulated TeslaPay wallet with instant SSLCommerz top-ups (bKash, Nagad, Cards)
              and 24/7 passenger trip support.
            </p>
          </div>

          {/* Card 6: Fast Dispatch */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl transition duration-300 flex flex-col items-center text-center group hover:-translate-y-1">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition">
              <Gauge className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Fast Pickup</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Sub-minute matching and direct corridor pickup. Live driver tracking keeps
              you notified every step of the journey.
            </p>
          </div>
        </div>
      </section>

      {/* "Plan for later" / Tesla Reserve Section matching user reference */}
      <TeslaReserveSection />

      {/* "Drive when you want, make what you need" Section matching user reference */}
      <DriveWithUsSection />

      {/* "Driving You Toward Your Destination" Section matching reference */}
      <section className="py-20 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Driving You Toward <br />
              <span className="text-emerald-600">Your Destination</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Meet Jashim, the dedicated pilot of Tesla &quot;Bullet&quot; (license plate DHA-TES-001).
              With a fixed capacity of 3 passenger seats, every trip is kept clean, quiet, and
              spacious. No crowded buses, no endless negotiations with rickshaws or CNGs.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Fixed 3-passenger capacity guarantee per Tesla</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>AC climate-controlled luxury electric drive</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Transparent hand-calculated fares locked at trip start</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Link
                href="/passenger/request"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm px-8 py-3.5 rounded-full transition shadow-lg shadow-emerald-500/20 hover:scale-105"
              >
                Book Now
              </Link>
              <Link
                href="/driver"
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm px-8 py-3.5 rounded-full transition hover:scale-105 shadow-sm"
              >
                Driver Portal
              </Link>
            </div>
          </div>

          {/* Right Driver Image */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[480px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/images/driver_jashim.jpg"
                alt="Pilot Jashim in Tesla Cockpit"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dark Footer with subtle curve */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-extrabold text-xl">
                <Car className="w-6 h-6 text-emerald-400" />
                <span>Dhaka Tesla Pool</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Autonomous ride-pooling MVP for Dhaka. Share a seat, split the fare,
                survive Dhaka traffic.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Dhaka Corridors
              </h4>
              <ul className="space-y-2 text-xs">
                <li>North-East: Banani, Mohakhali, Gulshan 1 & 2</li>
                <li>North: Uttara, Hazrat Shahjalal Airport</li>
                <li>West: Mirpur, Farmgate, Dhanmondi</li>
                <li>East: Bashundhara R/A</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Seed Cast Access
              </h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/login" className="hover:text-emerald-400">Jashim (Driver, Bullet, 3 Seats)</Link></li>
                <li><Link href="/login" className="hover:text-emerald-400">Nusrat (Passenger, Banani → Mohakhali)</Link></li>
                <li><Link href="/login" className="hover:text-emerald-400">Rafiq (Passenger, Banani → Gulshan 1)</Link></li>
                <li><Link href="/login" className="hover:text-emerald-400">Shirin (Passenger, Concurrency Test)</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Payments & Technology
              </h4>
              <ul className="space-y-2 text-xs">
                <li>TeslaPay Cashless Wallet</li>
                <li>SSLCommerz Gateway (bKash, Nagad)</li>
                <li>PostgreSQL Atomic Seat Locks</li>
                <li>Exact Integer Paisa Fare Calculation</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>© 2026 Dhaka Tesla Pool. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Ride</span>
              <span>Corridor Rules</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
