import { Mitigation } from "@/types/match";
import { Lightbulb } from "lucide-react";

interface MitigationListProps {
  mitigations: Mitigation[];
}

export default function MitigationList({ mitigations }: MitigationListProps) {
  if (mitigations.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-cat-dark text-lg">
        Possible next steps
      </h3>
      <div className="space-y-2">
        {mitigations.map((mitigation, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg bg-sunny/5 border border-sunny/10"
          >
            <Lightbulb className="h-5 w-5 shrink-0 mt-0.5 text-cat-dark" />
            <p className="text-sm text-foreground">{mitigation.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
