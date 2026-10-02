"use client";

import { useState } from "react";
import {
  Compass,
  Maximize2,
  Minimize2,
  Layers,
  Car,
  CheckCircle2,
} from "lucide-react";

export const DHAKA_ZONE_COORDINATES: Record<
  number,
  { name: string; lat: number; lng: number; corridor: string }
> = {
  1: { name: "Banani", lat: 23.7937, lng: 90.4066, corridor: "North-East" },
  2: { name: "Mohakhali", lat: 23.7777, lng: 90.4057, corridor: "North-East" },
  3: { name: "Gulshan 1", lat: 23.7788, lng: 90.4172, corridor: "North-East" },
  4: { name: "Gulshan 2", lat: 23.7925, lng: 90.4167, corridor: "North-East" },
  5: { name: "Baridhara", lat: 23.8037, lng: 90.4225, corridor: "North-East" },
  6: { name: "Uttara", lat: 23.8759, lng: 90.3795, corridor: "North" },
  7: { name: "Airport", lat: 23.8517, lng: 90.4076, corridor: "North" },
  8: { name: "Mirpur", lat: 23.8223, lng: 90.3654, corridor: "West" },
  9: { name: "Dhanmondi", lat: 23.7461, lng: 90.3742, corridor: "West" },
  10: { name: "Bashundhara", lat: 23.8183, lng: 90.4312, corridor: "East" },
};

interface GoogleMapViewProps {
  pickupZoneId?: number;
  destZoneId?: number;
  distanceKm?: number;
  showTeslaMarker?: boolean;
  driverName?: string;
  vehicleName?: string;
  height?: string;
  className?: string;
}

export function GoogleMapView({
  pickupZoneId = 1,
  destZoneId = 2,
  distanceKm = 3.0,
  showTeslaMarker = true,
  driverName = "Jashim",
  vehicleName = "Bullet",
  height = "h-[360px]",
  className = "",
}: GoogleMapViewProps) {
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const pickup = DHAKA_ZONE_COORDINATES[pickupZoneId] || DHAKA_ZONE_COORDINATES[1];
  const dest = DHAKA_ZONE_COORDINATES[destZoneId] || DHAKA_ZONE_COORDINATES[2];

  // Google Maps Embed Query String connecting Dhaka Pickup and Destination points
  const embedUrl = `https://maps.google.com/maps?saddr=${pickup.lat},${pickup.lng}&daddr=${dest.lat},${dest.lng}&t=${mapType === "satellite" ? "k" : "m"}&output=embed&z=13`;

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-slate-700/60 bg-slate-950 shadow-2xl transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50 h-[92vh] max-w-none" : `${height} ${className}`
      }`}
    >
      {/* Real Google Map iframe embed */}
      <iframe
        title="Google Map Route"
        src={embedUrl}
        className="w-full h-full border-0 filter contrast-105"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Tesla Cyber HUD - Top Header Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Route Info Badge */}
        <div className="pointer-events-auto glass-panel-elevated px-4 py-2 rounded-2xl flex items-center gap-3 border border-cyan-500/30 shadow-xl backdrop-blur-xl">
          <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: "10s" }} />
          </div>
          <div>
            <div className="text-xs font-black text-white flex items-center gap-2">
              <span>{pickup.name}</span>
              <span className="text-cyan-400">→</span>
              <span>{dest.name}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold">
              Corridor: <strong className="text-cyan-300">{dest.corridor}</strong> • ~{distanceKm.toFixed(1)} km
            </div>
          </div>
        </div>

        {/* Map Control Actions */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Toggle Satellite / Roadmap */}
          <button
            type="button"
            onClick={() => setMapType(mapType === "roadmap" ? "satellite" : "roadmap")}
            className="p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-500/40 transition shadow-lg cursor-pointer"
            title="Toggle Map Style"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-500/40 transition shadow-lg cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>
        </div>
      </div>

      {/* Tesla Telemetry - Bottom Footer Overlay */}
      {showTeslaMarker && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          {/* Tesla Vehicle Status Badge */}
          <div className="pointer-events-auto glass-panel px-4 py-2 rounded-2xl flex items-center gap-2.5 border border-emerald-500/30 text-xs shadow-xl backdrop-blur-xl">
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>Tesla &quot;{vehicleName}&quot;</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-400">
                Pilot: {driverName} • Plate: DHA-TES-001
              </div>
            </div>
          </div>

          {/* Concurrency Safe Marker */}
          <div className="pointer-events-auto glass-panel px-3 py-1.5 rounded-xl text-[10px] font-bold text-cyan-300 border border-cyan-500/20 flex items-center gap-1 shadow-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>GPS Corridor Synced</span>
          </div>
        </div>
      )}
    </div>
  );
}
