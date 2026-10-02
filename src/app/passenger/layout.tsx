"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Car, Navigation, Clock, Wallet, LogOut, User } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function PassengerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { href: "/passenger/request", label: "Book a Ride", icon: Navigation },
    { href: "/passenger/active", label: "Active Trip", icon: Car },
    { href: "/passenger/history", label: "History", icon: Clock },
    { href: "/passenger/wallet", label: "TeslaPay Wallet", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Car className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white">
              Dhaka Tesla <span className="text-cyan-400">Pool</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 ml-1">
              Passenger
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>{user?.name || "Passenger"}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
