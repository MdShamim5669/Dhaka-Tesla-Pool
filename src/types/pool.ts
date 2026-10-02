import { RideRequest } from "./ride";

export type PoolStatus =
  | "ACCEPTED"
  | "DRIVER_ARRIVED"
  | "STARTED"
  | "COMPLETED"
  | "CANCELLED";

export interface Tesla {
  id: string;
  driverId: string;
  name: string;
  plateNo: string;
  capacity: number;
}

export interface PoolMember {
  id: string;
  poolId: string;
  rideRequestId: string;
  rideRequest?: RideRequest;
  seats: number;
  joinedAt: string;
  leftAt?: string;
}

export interface Pool {
  id: string;
  teslaId: string;
  status: PoolStatus;
  pickupZoneId: number;
  corridor: string;
  seatsOccupied: number;
  capacity: number;
  startedAt?: string;
  completedAt?: string;
  members: PoolMember[];
}
