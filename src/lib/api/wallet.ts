import { apiClient } from "./client";
import { Wallet, TopUpInitResponse } from "@/types/wallet";

export async function fetchWallet(): Promise<Wallet> {
  const res = await apiClient.get("/wallet");
  return res.data.data;
}

export async function initTopUp(
  amountPaisa: number
): Promise<TopUpInitResponse> {
  const res = await apiClient.post("/wallet/topup/init", { amountPaisa });
  return res.data.data;
}
