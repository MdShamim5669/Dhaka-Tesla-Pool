export interface Wallet {
  userId: string;
  balancePaisa: number;
}

export interface WalletTransaction {
  id: string;
  tranId: string;
  valId?: string;
  amountPaisa: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  createdAt: string;
}

export interface TopUpInitResponse {
  tranId: string;
  paymentUrl: string;
}
