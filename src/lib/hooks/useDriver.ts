import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDriverTesla,
  updateDriverAvailability,
  fetchDriverRequests,
  acceptRideRequest,
  fetchCurrentPool,
  executePoolAction,
  fetchDriverPoolHistory,
} from "@/lib/api/driver";

export const DRIVER_KEYS = {
  all: ["driver"] as const,
  tesla: ["driver", "tesla"] as const,
  requests: ["driver", "requests"] as const,
  currentPool: ["driver", "pool", "current"] as const,
  history: ["driver", "pools", "history"] as const,
};

export function useDriverTesla() {
  return useQuery({
    queryKey: DRIVER_KEYS.tesla,
    queryFn: fetchDriverTesla,
    staleTime: 1000 * 60 * 10,
  });
}

export function useDriverRequests(enabled = true) {
  return useQuery({
    queryKey: DRIVER_KEYS.requests,
    queryFn: fetchDriverRequests,
    enabled,
    refetchInterval: 4000, // Live poll for incoming pool requests
  });
}

export function useCurrentPool() {
  return useQuery({
    queryKey: DRIVER_KEYS.currentPool,
    queryFn: fetchCurrentPool,
    refetchInterval: 3000, // Live poll for pool capacity & member transitions
  });
}

export function useToggleDriverAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isOnline: boolean) => updateDriverAvailability(isOnline),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVER_KEYS.all });
    },
  });
}

export function useAcceptRideRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rideId: string) => acceptRideRequest(rideId),
    onSuccess: (pool) => {
      queryClient.setQueryData(DRIVER_KEYS.currentPool, pool);
      queryClient.invalidateQueries({ queryKey: DRIVER_KEYS.requests });
      queryClient.invalidateQueries({ queryKey: DRIVER_KEYS.currentPool });
    },
  });
}

export function usePoolAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      poolId,
      action,
    }: {
      poolId: string;
      action: "arrive" | "start" | "complete" | "cancel";
    }) => executePoolAction(poolId, action),
    onSuccess: (updatedPool) => {
      queryClient.setQueryData(DRIVER_KEYS.currentPool, updatedPool);
      queryClient.invalidateQueries({ queryKey: DRIVER_KEYS.currentPool });
      queryClient.invalidateQueries({ queryKey: DRIVER_KEYS.history });
    },
  });
}

export function useDriverPoolHistory() {
  return useQuery({
    queryKey: DRIVER_KEYS.history,
    queryFn: fetchDriverPoolHistory,
  });
}
