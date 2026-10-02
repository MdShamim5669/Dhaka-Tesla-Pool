import { apiClient } from "./client";
import { Zone, RideRequest, FareEstimate, PaymentMethod } from "@/types/ride";

export async function fetchZones(): Promise<Zone[]> {
  const res = await apiClient.get("/zones");
  return res.data.data;
}

export async function estimateFare(params: {
  pickupZoneId: number;
  destZoneId: number;
  seats: number;
}): Promise<FareEstimate> {
  const res = await apiClient.post("/fares/estimate", params);
  return res.data.data;
}

export async function createRideRequest(payload: {
  pickupZoneId: number;
  destZoneId: number;
  seats: number;
  paymentMethod: PaymentMethod;
  idempotencyKey?: string;
}): Promise<RideRequest> {
  const headers = payload.idempotencyKey
    ? { "Idempotency-Key": payload.idempotencyKey }
    : undefined;

  const res = await apiClient.post(
    "/rides",
    {
      pickupZoneId: payload.pickupZoneId,
      destZoneId: payload.destZoneId,
      seats: payload.seats,
      paymentMethod: payload.paymentMethod,
    },
    { headers }
  );
  return res.data.data;
}

export async function fetchMyRides(params?: {
  status?: string;
  limit?: number;
  page?: number;
}): Promise<RideRequest[]> {
  const res = await apiClient.get("/rides", { params });
  return res.data.data || [];
}

export async function fetchRideDetail(rideId: string): Promise<RideRequest> {
  const res = await apiClient.get(`/rides/${rideId}`);
  return res.data.data;
}

export async function cancelRide(rideId: string): Promise<RideRequest> {
  const res = await apiClient.post(`/rides/${rideId}/cancel`);
  return res.data.data;
}
