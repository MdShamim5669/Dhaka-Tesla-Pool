"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function DriveWithUsSection() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Side: Driver Illustration matching reference */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-[540px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-100">
            <Image
              src="/images/driver_opportunity.jpg"
              alt="Drive with Dhaka Tesla Pool"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Right Side: Text & Actions matching reference */}
        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
            Drive when you want, make what you need
          </h2>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
            Make money on your schedule with pooled rides across Dhaka&apos;s primary corridors.
            Pilot our dedicated Tesla Model 3 fleet (or join with your EV) with guaranteed transparent
            fares, zero cash disputes, and full passenger capacity matching.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6">
            {/* "Get started" Black Button */}
            <Link
              href="/register?role=driver"
              className="py-3.5 px-8 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-sm tracking-wide shadow-md hover:shadow-lg transition duration-200 cursor-pointer inline-flex items-center gap-2"
            >
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* "Already have an account? Sign in" Link */}
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-800 hover:text-slate-950 underline underline-offset-4 cursor-pointer transition"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
