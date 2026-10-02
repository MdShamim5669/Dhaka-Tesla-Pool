"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Wallet,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useWallet, useInitTopUp } from "@/lib/hooks/useWallet";
import { formatPaisaToBDT } from "@/lib/utils/format";

function WalletContent() {
  const searchParams = useSearchParams();
  const [topUpAmountBDT, setTopUpAmountBDT] = useState<number>(500);
  const [validationError, setValidationError] = useState<string | null>(null);

  const statusParam = searchParams.get("status");
  const tranIdParam = searchParams.get("tranId");

  const { data: walletData, isLoading: walletLoading } = useWallet();
  const balancePaisa = walletData?.balancePaisa ?? 50000;

  // TanStack Mutation: SSLCommerz Top-Up
  const topUpMutation = useInitTopUp();

  const handleInitTopUp = async () => {
    if (topUpAmountBDT < 10 || topUpAmountBDT > 25000) {
      setValidationError("Top-up amount must be between ৳10 and ৳25,000");
      return;
    }
    setValidationError(null);

    const amountPaisa = Math.round(topUpAmountBDT * 100);
    topUpMutation.mutate(amountPaisa, {
      onSuccess: (data) => {
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        }
      },
    });
  };

  const errorMessage =
    validationError || (topUpMutation.isError ? topUpMutation.error?.message : null);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          TeslaPay Wallet
        </h1>
        <p className="text-slate-400 mt-1">
          Top up your balance using SSLCommerz (bKash, Nagad, Cards) for instant ride payments.
        </p>
      </div>

      {/* Callback Status Alerts */}
      {statusParam === "success" && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-semibold">Top-up Successful!</div>
            <div className="text-xs text-emerald-400/80">
              Your wallet has been credited. Transaction ID: {tranIdParam}
            </div>
          </div>
        </div>
      )}

      {statusParam === "failed" && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl flex items-center gap-3">
          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <div className="font-semibold">Payment Failed</div>
            <div className="text-xs text-rose-400/80">
              The payment transaction could not be completed.
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm">
          {errorMessage}
        </div>
      )}

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-2">
              <Wallet className="w-4 h-4" />
              <span>Available Balance</span>
            </div>
            <div className="text-5xl font-extrabold text-white tracking-tight">
              {walletLoading ? (
                <div className="flex items-center gap-2 text-2xl text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  <span>Fetching balance...</span>
                </div>
              ) : (
                formatPaisaToBDT(balancePaisa)
              )}
            </div>
          </div>

          <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-full text-xs font-semibold">
            TeslaPay Active
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Protected by PostgreSQL atomic checks
          </span>
          <span>100 Paisa = ৳1.00 BDT</span>
        </div>
      </div>

      {/* Top-Up Form */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl space-y-6">
        <h2 className="text-lg font-bold text-white">Top Up Balance via SSLCommerz</h2>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Select Amount
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[100, 500, 1000, 2000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTopUpAmountBDT(amt)}
                className={`py-3 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                  topUpAmountBDT === amt
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                    : "bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600"
                }`}
              >
                ৳{amt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Custom Amount (BDT)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
              ৳
            </span>
            <input
              type="number"
              min={10}
              max={25000}
              value={topUpAmountBDT}
              onChange={(e) => setTopUpAmountBDT(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-sm font-medium"
            />
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Min: ৳10 • Max: ৳25,000
          </span>
        </div>

        <button
          onClick={handleInitTopUp}
          disabled={topUpMutation.isPending}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 text-sm cursor-pointer"
        >
          {topUpMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {topUpMutation.isPending ? "Redirecting to SSLCommerz..." : `Top Up ৳${topUpAmountBDT}`}
          {!topUpMutation.isPending && <ExternalLink className="w-4 h-4" />}
        </button>

        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <span>Supported:</span>
          <span className="text-slate-200">bKash</span> •
          <span className="text-slate-200">Nagad</span> •
          <span className="text-slate-200">Rocket</span> •
          <span className="text-slate-200">Visa / Mastercard</span>
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      }
    >
      <WalletContent />
    </Suspense>
  );
}
