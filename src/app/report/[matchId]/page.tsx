"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCatById } from "@/data/demoCats";
import { getFallbackExplanation } from "@/lib/fallbackExplanations";
import { Match } from "@/types/match";
import CompatibilityBadge from "@/components/report/CompatibilityBadge";
import ConcernList from "@/components/report/ConcernList";
import MitigationList from "@/components/report/MitigationList";
import AlternativeCats from "@/components/report/AlternativeCats";
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(matchId);
    if (stored) {
      setMatch(JSON.parse(stored));
    }
  }, [matchId]);

  if (!match) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-cat-dark">Report not found</h1>
        <p className="text-charcoal/50 mt-2">
          The assessment data may have expired. Please try again.
        </p>
        <Button className="mt-4" onClick={() => router.push("/cats")}>
          Start Over
        </Button>
      </div>
    );
  }

  const cat = getCatById(match.catId);
  if (!cat) return null;

  const explanation = getFallbackExplanation(match.result);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-cat-dark">
          Compatibility Report
        </h1>
        <p className="text-charcoal/50 mt-1">
          Assessment for {cat.name}
        </p>
      </div>

      <div className="space-y-6">
        {/* Compatibility Level */}
        <CompatibilityBadge level={match.result.level} />

        {/* Disclaimer */}
        <div className="bg-warm-cream rounded-lg p-4 border border-border text-sm text-charcoal/50">
          <p>
            <strong className="text-foreground">Disclaimer:</strong> This is not
            a prediction of adoption outcome. It is an assessment based on
            shelter-defined compatibility rules. The final adoption decision is
            always made by shelter staff.
          </p>
        </div>

        {/* AI Counselor Explanation */}
        <Card className="border-border bg-white">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-cat-dark text-lg mb-3">
              Explanation
            </h3>
            <p className="text-sm text-charcoal/50 leading-relaxed">
              {explanation}
            </p>
          </CardContent>
        </Card>

        {/* Concerns */}
        <ConcernList concerns={match.result.concerns} />

        {/* Strengths */}
        {match.result.strengths.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-cat-dark text-lg">
              Protective factors
            </h3>
            <div className="space-y-2">
              {match.result.strengths.map((strength, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-risk-low/5 border border-risk-low/20"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-risk-low" />
                  <p className="text-sm text-foreground">
                    {strength.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mitigations */}
        <MitigationList mitigations={match.result.mitigations} />

        {/* Shelter Review Badge */}
        {match.result.requiresShelterReview && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-risk-moderate/10 border border-risk-moderate/30">
            <ShieldAlert className="h-6 w-6 text-risk-moderate shrink-0" />
            <p className="text-sm font-medium text-foreground">
              Shelter review recommended — Please discuss this assessment with
              shelter staff before proceeding.
            </p>
          </div>
        )}

        {/* Alternative Cats */}
        <AlternativeCats catIds={match.result.alternativeCatIds} />

        <Separator />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/cats")}
            className="flex-1"
          >
            Try Another Cat
          </Button>
          {match.result.level === "low" && (
            <Button
              onClick={() => router.push("/coach/barnaby-adoption-1")}
              className="bg-heart hover:bg-heart/90 text-white flex-1 gap-2"
            >
              Continue to 14-Day Coach
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
