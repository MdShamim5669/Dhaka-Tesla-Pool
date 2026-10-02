import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchZones,
  estimateFare,
  createRideRequest,
  fetchMyRides,
  fetchRideDetail,
  cancelRide,
} from "@/lib/api/rides";
import { PaymentMethod } from "@/types/ride";

export const RIDE_KEYS = {
  all: ["rides"] as const,
  zones: ["zones"] as const,
  estimate: (pickup: number, dest: number, seats: number) =>
    ["fare-estimate", pickup, dest, seats] as const,
  myRides: (status?: string) => ["rides", "my", status] as const,
  detail: (id: string) => ["rides", "detail", id] as const,
};

export function useZones() {
  return useQuery({
    queryKey: RIDE_KEYS.zones,
    queryFn: fetchZones,
    staleTime: 1000 * 60 * 60, // zones rarely change
  });
}

export function useFareEstimate(params: {
  pickupZoneId: number;
  destZoneId: number;
  seats: number;
}) {
  return useQuery({
    queryKey: RIDE_KEYS.estimate(
      params.pickupZoneId,
      params.destZoneId,
      params.seats
    ),
    queryFn: () => estimateFare(params),
    enabled: params.pickupZoneId > 0 && params.destZoneId > 0 && params.pickupZoneId !== params.destZoneId,
    staleTime: 1000 * 30,
  });
}

export function useMyRides(params?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: RIDE_KEYS.myRides(params?.status),
    queryFn: () => fetchMyRides(params),
    staleTime: 1000 * 10,
  });
}

export function useRideDetail(rideId: string | null) {
  return useQuery({
    queryKey: RIDE_KEYS.detail(rideId || ""),
    queryFn: () => fetchRideDetail(rideId!),
    enabled: !!rideId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Keep polling every 4 seconds while trip is active
      if (status && ["REQUESTED", "MATCHED", "DRIVER_ARRIVED", "STARTED"].includes(status)) {
        return 4000;
      }
      return false;
    },
  });
}

export function useCreateRideRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      pickupZoneId: number;
      destZoneId: number;
      seats: number;
      paymentMethod: PaymentMethod;
      idempotencyKey?: string;
    }) => createRideRequest(payload),
    onSuccess: (newRide) => {
      queryClient.invalidateQueries({ queryKey: RIDE_KEYS.all });
      if (typeof window !== "undefined" && newRide?.id) {
        localStorage.setItem("dtp_active_ride_id", newRide.id);
      }
    },
  });
}

export function useCancelRide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rideId: string) => cancelRide(rideId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: RIDE_KEYS.all });
      queryClient.setQueryData(RIDE_KEYS.detail(data.id), data);
    },
  });
}
