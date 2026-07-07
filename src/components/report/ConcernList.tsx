import { Concern, CompatibilityResult } from "@/types/match";
import { AlertCircle } from "lucide-react";

interface ConcernListProps {
  concerns: Concern[];
  matchLevel: CompatibilityResult["level"];
}

const headingByLevel: Record<CompatibilityResult["level"], string> = {
  low: "Why this was flagged",
  moderate: "Areas of consideration",
  high: "Things to keep in mind",
};

export default function ConcernList({ concerns, matchLevel }: ConcernListProps) {
  if (concerns.length === 0) return null;

  const isHighMatch = matchLevel === "low"; // "low" risk = best match
  const isMidMatch = matchLevel === "moderate";

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-cat-dark text-lg">
        {headingByLevel[matchLevel]}
      </h3>
      {matchLevel === "low" && (
        <p className="text-xs text-charcoal/50 -mt-1">
          Minor notes for a great match — not dealbreakers, just awareness points.
        </p>
      )}
      {matchLevel === "moderate" && (
        <p className="text-xs text-charcoal/50 -mt-1">
          Manageable factors that can be addressed with awareness and preparation.
        </p>
      )}
      <div className="space-y-2">
        {concerns.map((concern, i) => (
          <div
            key={concern.ruleId}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              concern.severity === "significant"
                ? "bg-risk-high/5 border-risk-high/20"
                : "bg-risk-moderate/5 border-risk-moderate/20"
            }`}
          >
            <AlertCircle
              className={`h-5 w-5 shrink-0 mt-0.5 ${
                concern.severity === "significant"
                  ? "text-risk-high"
                  : "text-risk-moderate"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                {concern.description}
              </p>
              <p className="text-xs text-charcoal/50 mt-1">
                {concern.triggeredBy}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
