"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { apiClient } from "@/lib/api/client";
import { UserRole } from "@/types/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("PASSENGER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiClient.post("/auth/register", {
        name,
        email,
        phone,
        password,
        role,
      });
      const { user, accessToken } = res.data.data;
      login(accessToken, user);

      if (user.role === "DRIVER") {
        router.push("/driver");
      } else {
        router.push("/passenger/request");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl mb-3">
            <Car className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create an Account
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Join the smart ride-pooling network in Dhaka
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nusrat Jahan"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

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
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801700000000"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("PASSENGER")}
                className={`py-2 px-3 rounded-lg text-sm font-medium border transition ${
                  role === "PASSENGER"
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                    : "bg-slate-800/50 border-slate-700 text-slate-400"
                }`}
              >
                Passenger
              </button>
              <button
                type="button"
                onClick={() => setRole("DRIVER")}
                className={`py-2 px-3 rounded-lg text-sm font-medium border transition ${
                  role === "DRIVER"
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                    : "bg-slate-800/50 border-slate-700 text-slate-400"
                }`}
              >
                Driver
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2.5 rounded-lg transition disabled:opacity-50 text-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
