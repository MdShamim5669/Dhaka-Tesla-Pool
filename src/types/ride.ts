export type RideStatus =
  | "REQUESTED"
  | "MATCHED"
  | "DRIVER_ARRIVED"
  | "STARTED"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "CASH" | "TESLAPAY";

export interface Zone {
  id: number;
  name: string;
  lat?: number;
  lng?: number;
  corridor: string;
}

export interface FareEstimate {
  soloFarePaisa: number;
  soloFareDisplay: string;
  pooledFarePaisa: number;
  pooledFareDisplay: string;
  distanceKm: number;
}

export interface RideRequest {
  id: string;
  passengerId: string;
  pickupZoneId: number;
  destZoneId: number;
  pickupZone?: Zone;
  destZone?: Zone;
  seats: number;
  status: RideStatus;
  distanceM: number;
  estimatedFarePaisa: number;
  finalFarePaisa?: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}
