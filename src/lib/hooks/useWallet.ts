import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWallet, initTopUp } from "@/lib/api/wallet";

export const WALLET_KEYS = {
  wallet: ["wallet"] as const,
};

export function useWallet() {
  return useQuery({
    queryKey: WALLET_KEYS.wallet,
    queryFn: fetchWallet,
    staleTime: 1000 * 15,
  });
}

export function useInitTopUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amountPaisa: number) => initTopUp(amountPaisa),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_KEYS.wallet });
    },
  });
}
