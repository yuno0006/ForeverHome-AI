"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCatById } from "@/data/demoCats";
import { getFallbackExplanation } from "@/lib/fallbackExplanations";
import { fetchAssessment, fetchAdopterProfile } from "@/lib/firestoreService";
import { assessCompatibility } from "@/lib/compatibilityEngine";
import { AdopterProfile } from "@/types/adopterProfile";
import { Match } from "@/types/match";
import CompatibilityBadge from "@/components/report/CompatibilityBadge";
import ConcernList from "@/components/report/ConcernList";
import MitigationList from "@/components/report/MitigationList";
import AlternativeCats from "@/components/report/AlternativeCats";
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";

// Mirrors buildAdopterAnswers() in the assessment flow so a report can be
// rebuilt from a persisted AdopterProfile when the sessionStorage copy of
// the original assessment result is gone (e.g. opened in a new session).
function buildAdopterAnswersFromProfile(
  profile: AdopterProfile
): import("@/types/adopter").AdopterAnswers {
  return {
    homeType: profile.homeType,
    adultsInHome: 1,
    children: profile.childrenAges
      .filter((age): age is "0-4" | "5-9" | "10-14" | "15+" =>
        ["0-4", "5-9", "10-14", "15+"].includes(age))
      .map((age) => ({ ageRange: age })),
    existingPets: profile.existingPets,
    householdNoise:
      profile.householdNoise === "quiet"
        ? "low"
        : profile.householdNoise === "active"
        ? "high"
        : "moderate",
    hoursAway: 8,
    travelFrequency:
      profile.travelFrequency === "rarely"
        ? "rare"
        : profile.travelFrequency === "frequent"
        ? "frequent"
        : "occasional",
    previousCatExperience: profile.catExperience !== "none",
    specialNeedsExperience: false,
    canProvideVerticalSpace: true,
    indoorSafety: "secure",
    veterinaryAccess: "yes",
    comfortableWithRoutineCare: true,
    scenarioAnswers: [],
  };
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const [match, setMatch] = useState<Match | null>(null);
  const [matchLoading, setMatchLoading] = useState(true);
  const [explanation, setExplanation] = useState<string>("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  useEffect(() => {
    async function loadMatch() {
      const stored = sessionStorage.getItem(matchId);
      if (stored) {
        setMatch(JSON.parse(stored));
        setMatchLoading(false);
        return;
      }

      // Fallback: the report was opened in a new session (e.g. from the
      // dashboard days later) so sessionStorage no longer has it. Rebuild
      // the compatibility result from the persisted Firestore assessment
      // record instead of showing "not found".
      try {
        const record = await fetchAssessment(matchId);
        if (!record) {
          setMatchLoading(false);
          return;
        }
        const cat = getCatById(record.catId);
        const profile = await fetchAdopterProfile(record.adopterProfileId);
        if (!cat || !profile) {
          setMatchLoading(false);
          return;
        }
        const adopterAnswers = buildAdopterAnswersFromProfile(profile);
        const result = assessCompatibility(cat, adopterAnswers);
        const rebuilt: Match = {
          id: record.id,
          catId: record.catId,
          adopterProfileId: record.adopterProfileId,
          adopterAnswers,
          result,
          timestamp: record.createdAt?.toDate
            ? record.createdAt.toDate().toISOString()
            : new Date().toISOString(),
        };
        sessionStorage.setItem(matchId, JSON.stringify(rebuilt));
        setMatch(rebuilt);
      } catch (err) {
        console.error("Failed to rebuild assessment report:", err);
      } finally {
        setMatchLoading(false);
      }
    }

    loadMatch();
  }, [matchId]);

  // Fetch AI explanation when match data is loaded
  useEffect(() => {
    async function fetchExplanation() {
      if (!match) return;
      
      const cat = getCatById(match.catId);
      if (!cat) return;

      setLoadingExplanation(true);
      try {
        const res = await fetch("/api/counselor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            compatibilityResult: match.result,
            cat: {
              name: cat.name,
              behavior: cat.behavior,
            },
            adopter: match.adopterProfileId ? { id: match.adopterProfileId } : null,
          }),
        });

        const data = await res.json();
        setExplanation(data.explanation || getFallbackExplanation(match.result));
      } catch (error) {
        console.error("Failed to fetch AI explanation:", error);
        setExplanation(getFallbackExplanation(match.result));
      } finally {
        setLoadingExplanation(false);
      }
    }

    fetchExplanation();
  }, [match]);

  if (matchLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sunny" />
      </div>
    );
  }

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
            {loadingExplanation ? (
              <div className="flex items-center gap-2 text-sm text-charcoal/50">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating AI explanation...
              </div>
            ) : (
              <p className="text-sm text-charcoal/50 leading-relaxed">
                {explanation}
              </p>
            )}
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
              onClick={() => router.push(`/coach/${match.catId}-adoption-1`)}
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
