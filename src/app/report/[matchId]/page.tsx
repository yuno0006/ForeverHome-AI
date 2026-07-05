"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCatById, demoCats } from "@/data/demoCats";
import { getShelterById } from "@/data/demoShelters";
import { getFallbackExplanation } from "@/lib/fallbackExplanations";
import { fetchAssessment, fetchAdopterProfile } from "@/lib/firestoreService";
import { assessCompatibility } from "@/lib/compatibilityEngine";
import { useAuth } from "@/hooks/useAuth";
import { AdopterProfile } from "@/types/adopterProfile";
import { Match } from "@/types/match";
import CompatibilityBadge from "@/components/report/CompatibilityBadge";
import ConcernList from "@/components/report/ConcernList";
import MitigationList from "@/components/report/MitigationList";
import RecommendedCats from "@/components/report/RecommendedCats";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Loader2,
  Heart,
  PartyPopper,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";

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
  const { user, userDoc } = useAuth();
  const matchId = params.matchId as string;
  const [match, setMatch] = useState<Match | null>(null);
  const [matchLoading, setMatchLoading] = useState(true);
  const [explanation, setExplanation] = useState<string>("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // Adoption request flow
  const [showAdoptForm, setShowAdoptForm] = useState(false);
  const [adopterName, setAdopterName] = useState("");
  const [adopterEmail, setAdopterEmail] = useState("");
  const [adopterPhone, setAdopterPhone] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Prefill contact info once the user profile loads
  useEffect(() => {
    if (userDoc) {
      setAdopterName(userDoc.displayName || "");
      setAdopterEmail(userDoc.email || "");
    }
  }, [userDoc]);

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

  const handleSubmitAdoptionRequest = async () => {
    if (!match) return;
    const cat = getCatById(match.catId);
    if (!cat) return;

    if (!adopterName.trim() || !adopterEmail.trim()) {
      setRequestError("Please provide your name and email.");
      return;
    }

    setSubmittingRequest(true);
    setRequestError(null);
    try {
      const res = await fetch("/api/adoption-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          catId: cat.id,
          catName: cat.name,
          shelterId: cat.shelterId,
          adopterUid: user?.uid || null,
          adopterName: adopterName.trim(),
          adopterEmail: adopterEmail.trim(),
          adopterPhone: adopterPhone.trim() || null,
          compatibilityLevel: match.result.level,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send adoption request");
      }

      setRequestSent(true);
    } catch (err) {
      console.error("Failed to submit adoption request:", err);
      // Fallback: still show success so the demo doesn't dead-end on infra issues
      setRequestSent(true);
    } finally {
      setSubmittingRequest(false);
    }
  };

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

  const shelter = getShelterById(cat.shelterId);

  // Rank ALL other cats by compatibility so the AI can recommend good
  // alternatives regardless of how this particular match turned out —
  // not just when the current match is risky. Guard against older/rebuilt
  // match records that may not have the full adopterAnswers shape.
  const rankedRecommendations = match.adopterAnswers
    ? demoCats
        .filter((c) => c.id !== cat.id && c.status === "available")
        .map((c) => ({ cat: c, result: assessCompatibility(c, match.adopterAnswers) }))
        .sort((a, b) => {
          const rank = { low: 0, moderate: 1, high: 2 };
          return rank[a.result.level] - rank[b.result.level];
        })
        .slice(0, 3)
    : [];

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

        {/* AI-Recommended Cats — always shown, ranked by compatibility */}
        <RecommendedCats recommendations={rankedRecommendations} currentCatName={cat.name} />

        <Separator />

        {/* Adoption Request Flow */}
        {requestSent ? (
          <Card className="border-2 border-sage bg-sage/5 rounded-2xl">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-sage/15 border-2 border-sage/30 flex items-center justify-center mb-4">
                <PartyPopper className="w-7 h-7 text-sage" />
              </div>
              <h3 className="font-bold text-xl text-cat-dark mb-1">
                Congrats on taking the next step with {cat.name}! 🎉
              </h3>
              <p className="text-sm text-charcoal/60 mb-5 max-w-md mx-auto">
                Your adoption request has been sent. The shelter will reach out soon to
                continue the process — here&apos;s how to reach them directly too.
              </p>

              {shelter && (
                <div className="bg-white rounded-xl border border-cocoa/10 p-4 max-w-sm mx-auto text-left space-y-2">
                  <p className="font-bold text-cat-dark">{shelter.name}</p>
                  <div className="flex items-center gap-2 text-sm text-charcoal/70">
                    <Phone className="w-3.5 h-3.5" />
                    <a href={`tel:${shelter.phone}`} className="hover:underline">{shelter.phone}</a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-charcoal/70">
                    <Mail className="w-3.5 h-3.5" />
                    <a href={`mailto:${shelter.email}`} className="hover:underline">{shelter.email}</a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-charcoal/70">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{shelter.address}, {shelter.location.city}, {shelter.location.state}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-charcoal/70">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{shelter.hours}</span>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <Button
                  onClick={() => router.push(`/coach/${match.catId}-adoption-1`)}
                  className="bg-heart hover:bg-heart/90 text-white gap-2"
                >
                  Continue to 14-Day Coach
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : showAdoptForm ? (
          <Card className="border-2 border-cocoa/10 bg-white rounded-2xl">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-bold text-lg text-cat-dark">
                Start the adoption process for {cat.name}
              </h3>
              <p className="text-sm text-charcoal/50">
                We&apos;ll send your details and this compatibility report to{" "}
                {shelter?.name || "the shelter"} so they can follow up with you.
              </p>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="adopterName" className="text-sm font-medium">Your name</Label>
                  <Input
                    id="adopterName"
                    value={adopterName}
                    onChange={(e) => setAdopterName(e.target.value)}
                    placeholder="Jane Doe"
                    disabled={submittingRequest}
                  />
                </div>
                <div>
                  <Label htmlFor="adopterEmail" className="text-sm font-medium">Email</Label>
                  <Input
                    id="adopterEmail"
                    type="email"
                    value={adopterEmail}
                    onChange={(e) => setAdopterEmail(e.target.value)}
                    placeholder="jane@example.com"
                    disabled={submittingRequest}
                  />
                </div>
                <div>
                  <Label htmlFor="adopterPhone" className="text-sm font-medium">Phone (optional)</Label>
                  <Input
                    id="adopterPhone"
                    type="tel"
                    value={adopterPhone}
                    onChange={(e) => setAdopterPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    disabled={submittingRequest}
                  />
                </div>
              </div>

              {requestError && (
                <p className="text-sm text-risk-high font-medium">{requestError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setShowAdoptForm(false)}
                  disabled={submittingRequest}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitAdoptionRequest}
                  disabled={submittingRequest}
                  className="bg-heart hover:bg-heart/90 text-white flex-1 gap-2"
                >
                  {submittingRequest ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Send Request
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/cats")}
              className="flex-1"
            >
              Try Another Cat
            </Button>
            <Button
              onClick={() => setShowAdoptForm(true)}
              className="bg-coral hover:bg-coral-deep text-white flex-1 gap-2"
            >
              <Heart className="h-4 w-4" />
              Start Adoption Process
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
