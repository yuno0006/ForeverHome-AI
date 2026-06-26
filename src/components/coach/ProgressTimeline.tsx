import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyCheckIn } from "@/types/checkIn";
import { Check, X, Minus } from "lucide-react";

interface ProgressTimelineProps {
  checkIns: DailyCheckIn[];
  catName: string;
}

function StatusIcon({ status }: { status: boolean | undefined }) {
  if (status === undefined) return null;
  if (status) {
    return <Check className="h-4 w-4 text-risk-low" />;
  }
  return <X className="h-4 w-4 text-charcoal/50" />;
}

export default function ProgressTimeline({
  checkIns,
  catName,
}: ProgressTimelineProps) {
  const sortedCheckIns = [...checkIns].sort((a, b) => a.day - b.day);

  return (
    <Card className="border-border bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-cat-dark">
          {catName}&apos;s Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedCheckIns.map((checkIn, index) => {
          const isFirstNonHiding =
            !checkIn.hiding &&
            (index === 0 || sortedCheckIns[index - 1]?.hiding);

          return (
            <div
              key={checkIn.day}
              className={`p-3 rounded-lg border-l-4 ${
                checkIn.hiding
                  ? "border-l-risk-high/40 bg-risk-high/5"
                  : isFirstNonHiding
                  ? "border-l-risk-low bg-risk-low/10"
                  : "border-l-risk-low/40 bg-risk-low/5"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-cat-dark">
                  Day {checkIn.day}
                </span>
                {isFirstNonHiding && (
                  <span className="text-xs font-medium text-risk-low bg-risk-low/10 px-2 py-0.5 rounded-full">
                    First time out!
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-xs mb-2">
                <span className="flex items-center gap-1">
                  <StatusIcon status={checkIn.ate} />
                  Ate
                </span>
                <span className="flex items-center gap-1">
                  <StatusIcon status={checkIn.drank} />
                  Drank
                </span>
                <span className="flex items-center gap-1">
                  {checkIn.hiding ? (
                    <X className="h-4 w-4 text-charcoal/50" />
                  ) : (
                    <Check className="h-4 w-4 text-risk-low" />
                  )}
                  {checkIn.hiding ? "Hiding" : "Out"}
                </span>
                <span className="flex items-center gap-1">
                  <StatusIcon status={checkIn.litterUsed} />
                  Litter
                </span>
              </div>

              {checkIn.notes && (
                <p className="text-xs italic text-charcoal/50">
                  &quot;{checkIn.notes}&quot;
                </p>
              )}
            </div>
          );
        })}

        {sortedCheckIns.length > 0 && (
          <div className="pt-2 text-xs text-charcoal/50 italic">
            {sortedCheckIns.some((c) => c.hiding)
              ? "Stress-sensitive cats often take 1-2 weeks to feel comfortable in a new home. This is normal."
              : "Great progress! Your cat is settling in well."}
          </div>
        )}

        {sortedCheckIns.length === 0 && (
          <p className="text-sm text-charcoal/50 text-center py-4">
            No check-ins yet. Start logging your cat&apos;s daily progress above.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
