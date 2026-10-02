"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Car, Loader2, Zap } from "lucide-react";
import { useLoginMutation } from "@/lib/hooks/useAuthMutation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLoginMutation();

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    loginMutation.mutate(
      { email: demoEmail, password: demoPass },
      {
        onSuccess: (data) => {
          if (redirectUrl) {
            router.push(redirectUrl);
          } else if (data.user.role === "DRIVER") {
            router.push("/driver");
          } else {
            router.push("/passenger/request");
          }
        },
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          if (redirectUrl) {
            router.push(redirectUrl);
          } else if (data.user.role === "DRIVER") {
            router.push("/driver");
          } else {
            router.push("/passenger/request");
          }
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl mb-3">
            <Car className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sign In to Dhaka Tesla Pool
          </h1>
          <p className="text-sm text-slate-400 mt-1 text-center">
            Enter credentials or tap a 1-click Demo Account below
          </p>
        </div>

        {/* 1-Click Quick Demo Accounts */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-cyan-400">
              <Zap className="w-3.5 h-3.5 fill-cyan-400" />
              1-Click Instant Demo
            </span>
            <span className="text-[10px] text-slate-500">Tap to auto-sign in</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loginMutation.isPending}
              onClick={() => handleDemoFill("nusrat@example.com", "password123")}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-left transition cursor-pointer disabled:opacity-50"
            >
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Nusrat (Passenger)</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">৳500 TeslaPay • Ready</div>
            </button>

            <button
              type="button"
              disabled={loginMutation.isPending}
              onClick={() => handleDemoFill("jashim@tesla.bd", "password123")}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-left transition cursor-pointer disabled:opacity-50"
            >
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Jashim (Tesla Pilot)</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Model 3 Bullet</div>
            </button>
          </div>
        </div>

        {loginMutation.isError && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm">
            {loginMutation.error?.message || "Invalid credentials"}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. nusrat@example.com"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2.5 rounded-lg transition disabled:opacity-50 text-sm cursor-pointer"
          >
            {loginMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-cyan-400 hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
