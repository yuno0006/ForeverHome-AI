import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";

interface CompatibilityBadgeProps {
  level: "low" | "moderate" | "high";
}

const levelConfig = {
  low: {
    label: "Low Compatibility Concern",
    color: "bg-risk-low text-white",
    icon: ShieldCheck,
    description: "No major compatibility concerns identified.",
  },
  moderate: {
    label: "Moderate Compatibility Concern",
    color: "bg-risk-moderate text-charcoal",
    icon: ShieldAlert,
    description: "One consideration worth discussing with shelter staff.",
  },
  high: {
    label: "High Compatibility Concern",
    color: "bg-risk-high text-white",
    icon: AlertTriangle,
    description: "Significant concerns that require shelter review.",
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
