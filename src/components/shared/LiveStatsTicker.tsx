import { ShieldCheck, Sparkles, Leaf, Clock } from "lucide-react";

export function LiveStatsTicker() {
  const stats = [
    {
      icon: Sparkles,
      value: "20% OFF",
      label: "Pooled Ride Discount",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Zero Overbook Lock",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      icon: Leaf,
      value: "-45% CO₂",
      label: "Emissions Reduced",
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20",
    },
    {
      icon: Clock,
      value: "< 35s",
      label: "Corridor Match Speed",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl glass-panel border ${item.border} flex items-center gap-3.5 hover:scale-102 transition duration-300`}
          >
            <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-white text-lg tracking-tight">
                {item.value}
              </div>
              <div className="text-[11px] font-medium text-slate-400">
                {item.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
