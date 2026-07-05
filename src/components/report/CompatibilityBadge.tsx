import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";

interface CompatibilityBadgeProps {
  level: "low" | "moderate" | "high";
}

const levelConfig = {
  low: {
    label: "Compatible",
    color: "bg-[#22c55e] text-white",
    icon: ShieldCheck,
    description: "You and this cat are a strong match. No major concerns identified.",
  },
  moderate: {
    label: "Possible Match",
    color: "bg-[#eab308] text-white",
    icon: ShieldAlert,
    description: "This could work with preparation. Some areas need attention.",
  },
  high: {
    label: "Not Recommended",
    color: "bg-[#ef4444] text-white",
    icon: AlertTriangle,
    description: "Significant concerns — shelter review is required before proceeding.",
  },
};

export default function CompatibilityBadge({ level }: CompatibilityBadgeProps) {
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg p-4 ${config.color}`}>
      <div className="flex items-center gap-3">
        <Icon className="h-8 w-8" />
        <div>
          <p className="text-lg font-bold">{config.label}</p>
          <p className="text-sm opacity-90">{config.description}</p>
        </div>
      </div>
    </div>
  );
}
