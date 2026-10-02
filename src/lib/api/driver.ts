import { apiClient } from "./client";
import { Pool, Tesla } from "@/types/pool";
import { RideRequest } from "@/types/ride";

export async function fetchDriverTesla(): Promise<Tesla> {
  const res = await apiClient.get("/drivers/me/tesla");
  return res.data.data;
}

export async function updateDriverAvailability(
  isOnline: boolean
): Promise<{ isOnline: boolean }> {
  const res = await apiClient.patch("/drivers/me/availability", { isOnline });
  return res.data.data;
}

export async function fetchDriverRequests(): Promise<RideRequest[]> {
  const res = await apiClient.get("/driver/requests");
  return res.data.data || [];
}

export async function acceptRideRequest(rideId: string): Promise<Pool> {
  const res = await apiClient.post(`/driver/requests/${rideId}/accept`);
  return res.data.data;
}

export async function fetchCurrentPool(): Promise<Pool | null> {
  const res = await apiClient.get("/driver/pools/current");
  return res.data.data;
}

export async function executePoolAction(
  poolId: string,
  action: "arrive" | "start" | "complete" | "cancel"
): Promise<Pool> {
  const res = await apiClient.post(`/driver/pools/${poolId}/${action}`);
  return res.data.data;
}

export async function fetchDriverPoolHistory(): Promise<Pool[]> {
  const res = await apiClient.get("/driver/pools");
  return res.data.data || [];
}
