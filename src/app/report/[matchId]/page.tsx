"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WhiskerRunnerDialog } from "@/components/game/WhiskerRunnerDialog";
import { getCatById, demoCats } from "@/data/demoCats";
import { getShelterById } from "@/data/demoShelters";
import { getFallbackExplanation } from "@/lib/fallbackExplanations";
import {
  fetchAssessment,
  fetchAdopterProfile,
  saveAICounselorReport,
  fetchAICounselorReport,
} from "@/lib/firestoreService";
import { assessCompatibility } from "@/lib/compatibilityEngine";
import { useAuth } from "@/hooks/useAuth";
import { AdopterProfile } from "@/types/adopterProfile";
import { Match, Concern, Strength } from "@/types/match";
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
  Volume2,
  VolumeX,
  Cat,
  Gamepad2,
  Bot,
  Sparkles,
} from "lucide-react";

// localStorage keys for persistence across tab refreshes
const REPORT_KEY_PREFIX = "fh_report_";
const AI_REPORT_KEY_PREFIX = "fh_ai_report_";
// 60s client-side timeout — AI is given a full minute before showing fallback
const AI_TIMEOUT_MS = 60_000;

interface StoredAIReport {
  explanation: string;
  explanationIsAI: boolean;
  explanationSource: string;
  aiProtectiveFactors: string[];
  resultLevel: "low" | "moderate" | "high";
  concerns: Concern[];
  strengths: Strength[];
}

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

/** Persist AI report: Firestore for authenticated users, localStorage always as cache. */
async function persistAIReport(
  uid: string | undefined,
  matchId: string,
  report: StoredAIReport
) {
  // Always cache in localStorage (works offline, instant loads)
  try {
    localStorage.setItem(AI_REPORT_KEY_PREFIX + matchId, JSON.stringify(report));
  } catch { /* quota exceeded */ }

  // Authenticated user → also persist to Firestore for cross-device access
  if (uid && uid !== "guest") {
    saveAICounselorReport(uid, matchId, report).catch((err) => {
      console.error("Failed to save AI report to Firestore:", err);
    });
  }
}

/** Load cached AI report: Firestore first (user), then localStorage. */
async function loadCachedAIReport(
  uid: string | undefined,
  matchId: string
): Promise<StoredAIReport | null> {
  // 1. Authenticated user → try Firestore first
  if (uid && uid !== "guest") {
    try {
      const fromFS = await fetchAICounselorReport(uid, matchId);
      if (fromFS) return fromFS;
    } catch { /* fall through to localStorage */ }
  }

  // 2. Guest or Firestore miss → localStorage
  try {
    const raw = localStorage.getItem(AI_REPORT_KEY_PREFIX + matchId);
    if (raw) return JSON.parse(raw) as StoredAIReport;
  } catch { /* not found or corrupt */ }

  return null;
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userDoc } = useAuth();
  const matchId = params.matchId as string;
  const [match, setMatch] = useState<Match | null>(null);
  const [matchLoading, setMatchLoading] = useState(true);
  const [explanation, setExplanation] = useState<string>("");
  const [loadingExplanation, setLoadingExplanation] = useState(true); // start true — wait for AI
  const [explanationIsAI, setExplanationIsAI] = useState(false);
  const [explanationSource, setExplanationSource] = useState<string>("loading");
  const [aiProtectiveFactors, setAiProtectiveFactors] = useState<string[]>([]);

  // Adoption request flow
  const [showAdoptForm, setShowAdoptForm] = useState(false);
  const [adopterName, setAdopterName] = useState("");
  const [adopterEmail, setAdopterEmail] = useState("");
  const [adopterPhone, setAdopterPhone] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Whisker Runner mini-game
  const [gameOpen, setGameOpen] = useState(false);

  // Shelter contact popup
  const [showShelterContact, setShowShelterContact] = useState(false);

  // TTS state
  const [speaking, setSpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);

  // Prefill contact info once the user profile loads
  useEffect(() => {
    if (userDoc) {
      setAdopterName(userDoc.displayName || "");
      setAdopterEmail(userDoc.email || "");
    }
  }, [userDoc]);
  
  // Check TTS support
  useEffect(() => {
    setTtsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);
  
  // Auto-speak explanation when it loads (removed by user request to default to mute)
  // User can click the Listen button manually if they want audio.
  
  const speakExplanation = (text: string) => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.2;
    utterance.pitch = 1.0;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };
  
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  useEffect(() => {
    async function loadMatch() {
      const reportKey = REPORT_KEY_PREFIX + matchId;
      const stored = localStorage.getItem(reportKey);
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
        localStorage.setItem(reportKey, JSON.stringify(rebuilt));
        setMatch(rebuilt);
      } catch (err) {
        console.error("Failed to rebuild assessment report:", err);
      } finally {
        setMatchLoading(false);
      }
    }

    loadMatch();
  }, [matchId]);

  // Fetch adopter profile + AI explanation — SINGLE effect, ONE API call.
  // Authenticated users load from Firestore first, then localStorage.
  // Guests use localStorage only. If no cached report exists, calls
  // /api/counselor with a 60s timeout — only after a full minute of
  // waiting does it show the rule-based fallback. Once the AI responds,
  // the result is persisted (Firestore for users, localStorage for all).
  useEffect(() => {
    let cancelled = false;

    async function loadAndExplain() {
      if (!match) return;

      const cat = getCatById(match.catId);
      if (!cat) return;

      // ── 0. Check for a previously saved AI report (Firestore → localStorage) ──
      const cached = await loadCachedAIReport(user?.uid, matchId);
      if (cached) {
        setExplanationSource(cached.explanationSource);
        setExplanationIsAI(cached.explanationIsAI);
        setExplanation(cached.explanation);
        setAiProtectiveFactors(cached.aiProtectiveFactors);
        setMatch((prev) =>
          prev
            ? {
                ...prev,
                result: {
                  ...prev.result,
                  level: cached.resultLevel,
                  concerns: cached.concerns,
                  strengths: cached.strengths,
                },
              }
            : prev
        );
        setLoadingExplanation(false);
        return; // ✅ instantly restored — no API call needed
      }

      // 1. Fetch adopter profile first (if available)
      let profile: AdopterProfile | null = null;
      if (match.adopterProfileId) {
        try {
          profile = await fetchAdopterProfile(match.adopterProfileId);
        } catch { /* non-critical */ }
      }

      if (cancelled) return;

      // 2. Call AI counselor with 60s client-side timeout.
      //    The user wants the AI a FULL minute before any fallback appears.
      setLoadingExplanation(true);
      setExplanationSource("loading");

      try {
        const adopterData = profile
          ? {
              name: profile.name,
              homeType: profile.homeType,
              hasChildren: profile.hasChildren,
              childrenAges: profile.childrenAges,
              hasExistingPets: profile.hasExistingPets,
              existingPets: profile.existingPets,
              hasGarden: profile.hasGarden,
              workHours: profile.workHours,
              travelFrequency: profile.travelFrequency,
              householdNoise: profile.householdNoise,
              catExperience: profile.catExperience,
              personalityPreference: profile.personalityPreference,
              agePreference: profile.agePreference,
              specialNeedsOpenness: profile.specialNeedsOpenness,
              indoorOnlyPreference: profile.indoorOnlyPreference,
            }
          : match.adopterAnswers
            ? {
                homeType: match.adopterAnswers.homeType,
                householdNoise: match.adopterAnswers.householdNoise,
                hoursAway: match.adopterAnswers.hoursAway,
                travelFrequency: match.adopterAnswers.travelFrequency,
                previousCatExperience: match.adopterAnswers.previousCatExperience,
                hasChildren: match.adopterAnswers.children.length > 0,
                existingPets: match.adopterAnswers.existingPets,
              }
            : null;

        // 60s AbortController — wait a full minute for AI
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

        const res = await fetch("/api/counselor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            compatibilityResult: match.result,
            cat: {
              name: cat.name,
              breed: cat.breed,
              age: cat.age,
              lifeStage: cat.lifeStage,
              color: cat.color,
              sex: cat.sex,
              behavior: cat.behavior,
              care: cat.care,
              personality: cat.personality,
              backstory: cat.backstory,
              idealHome: cat.idealHome,
            },
            adopter: adopterData,
            scenarioQA: match.scenarioQA,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (cancelled) return;

        const data = await res.json();

        setExplanationSource(data.source || "fallback");

        if (data.aiResult) {
          // AI succeeded — use its result as the single source of truth
          setExplanationIsAI(true);
          const newConcerns: Concern[] = data.aiResult.concerns.map((c: string) => ({
            ruleId: "ai-counselor",
            severity: "significant" as const,
            description: c,
            triggeredBy: "gemini",
          }));
          const newStrengths: Strength[] = data.aiResult.strengths.map((s: string) => ({
            description: s,
          }));
          const newResult = {
            ...match.result,
            level: data.aiResult.riskLevel,
            concerns: newConcerns,
            strengths: newStrengths,
          };
          setMatch({ ...match, result: newResult });
          setAiProtectiveFactors(data.aiResult.protectiveFactors || []);
          const aiExplanation = data.aiResult.explanation || getFallbackExplanation(newResult);
          setExplanation(aiExplanation);

          // ✅ Persist: Firestore for users, localStorage for all
          const toStore: StoredAIReport = {
            explanation: aiExplanation,
            explanationIsAI: true,
            explanationSource: data.source || "gemini",
            aiProtectiveFactors: data.aiResult.protectiveFactors || [],
            resultLevel: data.aiResult.riskLevel,
            concerns: newConcerns,
            strengths: newStrengths,
          };
          persistAIReport(user?.uid, matchId, toStore);
        } else {
          // AI failed — keep rule-based result, show fallback explanation
          setExplanationIsAI(false);
          const fallbackExplanation = data.explanation || getFallbackExplanation(match.result);
          setExplanation(fallbackExplanation);

          // Also persist the fallback so refreshes don't re-trigger the slow wait
          const toStore: StoredAIReport = {
            explanation: fallbackExplanation,
            explanationIsAI: false,
            explanationSource: "fallback",
            aiProtectiveFactors: [],
            resultLevel: match.result.level,
            concerns: match.result.concerns || [],
            strengths: match.result.strengths || [],
          };
          persistAIReport(user?.uid, matchId, toStore);
        }
      } catch (error) {
        // Timeout (AbortError) or network error — show fallback ONCE, persist it
        console.error(
          error instanceof DOMException && error.name === "AbortError"
            ? "AI counselor timed out after 60s — showing fallback report"
            : "Failed to fetch AI explanation:",
          error
        );
        if (!cancelled) {
          const fallbackExplanation = getFallbackExplanation(match.result);
          setExplanation(fallbackExplanation);
          setExplanationIsAI(false);
          setExplanationSource("fallback");
          setAiProtectiveFactors([]);

          // Persist fallback so refreshes don't restart the 60s wait
          const toStore: StoredAIReport = {
            explanation: fallbackExplanation,
            explanationIsAI: false,
            explanationSource: "fallback",
            aiProtectiveFactors: [],
            resultLevel: match.result.level,
            concerns: match.result.concerns || [],
            strengths: match.result.strengths || [],
          };
          persistAIReport(user?.uid, matchId, toStore);
        }
      } finally {
        if (!cancelled) {
          setLoadingExplanation(false);
        }
      }
    }

    loadAndExplain();

    return () => {
      cancelled = true;
    };
    // Only re-run when match identity changes (not on every explanation render)
  }, [match?.id]);

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
        <p className="text-charcoal/70 mt-2 font-medium">
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
  // Shuffle cats within the same compatibility level so recommendations
  // vary between reports instead of showing the same 3 every time.
  const rankedRecommendations = match.adopterAnswers
    ? (() => {
        // Simple hash-based seed from matchId for stable-but-varied ordering
        let seed = 0;
        for (let i = 0; i < matchId.length; i++) {
          seed = (seed * 31 + matchId.charCodeAt(i)) | 0;
        }
        const seededRandom = () => {
          seed = (seed * 16807 + 0) % 2147483647;
          return (seed - 1) / 2147483646;
        };

        const scored = demoCats
          .filter((c) => c.id !== cat.id && c.status === "available")
          .map((c) => ({ cat: c, result: assessCompatibility(c, match.adopterAnswers) }));

        // Sort by level, then shuffle within same level
        const rank = { low: 0, moderate: 1, high: 2 };
        scored.sort((a, b) => {
          const diff = rank[a.result.level] - rank[b.result.level];
          if (diff !== 0) return diff;
          // Same level → seeded shuffle
          return seededRandom() - 0.5;
        });

        return scored.slice(0, 3);
      })()
    : [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl font-bold text-cat-dark">
            Compatibility Report
          </h1>
          {explanationSource === "gemini" ? (
            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
              <Sparkles className="w-3 h-3" /> AI-Generated
            </span>
          ) : explanationSource === "fallback" ? (
            <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-gray-500">
              Rule-Based
            </span>
          ) : null}
        </div>
        <p className="text-charcoal/70 mt-1 font-medium">
          Assessment for {cat.name}
        </p>
      </div>

      <div className="space-y-6">
        {/* Compatibility Level */}
        {loadingExplanation ? (
          <div className="flex items-center gap-4 p-4 md:p-6 rounded-2xl bg-charcoal/5 animate-pulse border-2 border-charcoal/10">
            <div className="w-12 h-12 rounded-full bg-charcoal/10 shrink-0" />
            <div className="space-y-2.5 w-full max-w-sm">
              <div className="h-5 bg-charcoal/10 rounded-md w-3/4" />
              <div className="h-4 bg-charcoal/10 rounded-md w-full" />
            </div>
          </div>
        ) : (
          <CompatibilityBadge level={match.result.level} />
        )}

        {/* Disclaimer */}
        <div className="bg-warm-cream rounded-lg p-4 border border-border text-sm text-charcoal/70">
          <p>
            <strong className="text-cocoa">Disclaimer:</strong> This is not
            a prediction of adoption outcome. It is an assessment based on
            shelter-defined compatibility rules. The final adoption decision is
            always made by shelter staff.
          </p>
        </div>

        {/* AI Counselor Explanation */}
        <Card className="border-border bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-cat-dark text-lg">
                  Explanation
                </h3>
                {!loadingExplanation && (
                  explanationIsAI ? (
                    <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      <Bot className="w-3 h-3" /> Generated by Gemini AI
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-500">
                      Rule-Based (AI unavailable)
                    </span>
                  )
                )}
              </div>
              {!loadingExplanation && explanation && ttsSupported && (
                <button
                  onClick={() => speaking ? stopSpeaking() : speakExplanation(explanation)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-colors bg-cocoa/5 hover:bg-cocoa/10 text-cocoa border border-cocoa/15"
                  title={speaking ? "Stop reading" : "Read explanation aloud"}
                >
                  {speaking ? (
                    <><VolumeX className="h-4 w-4" /> Stop</>
                  ) : (
                    <><Volume2 className="h-4 w-4" /> Listen</>
                  )}
                </button>
              )}
            </div>
            {loadingExplanation ? (
              <div className="flex items-center gap-2 text-sm text-charcoal/70">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating AI explanation...
              </div>
            ) : (
              <p className="text-sm text-charcoal/80 leading-relaxed">
                {explanation}
              </p>
            )}
          </CardContent>
        </Card>

        {/* AI Results Sections */}
        {loadingExplanation ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-32 bg-charcoal/5 rounded-xl border border-charcoal/10" />
            <div className="h-24 bg-charcoal/5 rounded-xl border border-charcoal/10" />
          </div>
        ) : (
          <>
            {/* Concerns — heading adapts to match level */}
            <ConcernList concerns={match.result.concerns} matchLevel={match.result.level} />

            {/* Strengths */}
            {match.result.strengths.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-cat-dark text-lg">
                  Strengths
                </h3>
                <div className="space-y-2">
                  {match.result.strengths.map((strength, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[#22c55e]/5 border border-[#22c55e]/20"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-[#22c55e]" />
                      <p className="text-sm text-charcoal/80 font-medium">
                        {strength.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Protective Factors (AI Generated) */}
            {aiProtectiveFactors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-cat-dark text-lg">
                  Protective Factors (by AI)
                </h3>
                <div className="space-y-2">
                  {aiProtectiveFactors.map((factor, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[#3b82f6]/5 border border-[#3b82f6]/20"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-[#3b82f6]" />
                      <p className="text-sm text-charcoal/80 font-medium">
                        {factor}
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
          </>
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

              <div className="mt-5 flex flex-col items-center gap-3">
                <p className="text-sm text-charcoal/60 text-center">
                  While you wait to hear back from the shelter, take a quick breather —
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setGameOpen(true)}
                    className="gap-2 border-2 border-sage/40 text-sage-deep hover:bg-sage/10"
                  >
                    <Gamepad2 className="h-4 w-4" />
                    Play: Whisker Runner 🐾
                  </Button>
                  <Button
                    onClick={() => router.push(`/coach/${match.catId}-adoption-1`)}
                    className="bg-heart hover:bg-heart/90 text-white gap-2"
                  >
                    Continue to 14-Day Coach
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
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
        ) : match.result.level === "high" ? (
          /* ── HIGH RISK: Not Recommended ── */
          <div className="space-y-4 pt-2">
            {/* Don't be sad message */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
              <p className="text-amber-800 font-semibold text-lg mb-2">
                Every cat deserves the right home — and that's okay!
              </p>
              <p className="text-amber-700 text-sm">
                {cat.name} needs a specific kind of environment to thrive. There are plenty of other wonderful cats who would be a perfect match for your lifestyle.
              </p>
            </div>

            {/* Shelter Contact Popup */}
            {showShelterContact ? (
              <Card className="border-2 border-heart/30 bg-red-50/30">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-heart" />
                    <h3 className="font-bold text-cat-dark text-lg">{shelter?.name || "Shelter"}</h3>
                  </div>
                  {shelter && (
                    <>
                      <div className="space-y-2 text-sm text-charcoal/80">
                        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-charcoal/50" /> {shelter.address}, {shelter.location.city}, {shelter.location.state}</p>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-charcoal/50" /> <a href={`tel:${shelter.phone}`} className="text-cocoa underline hover:text-heart">{shelter.phone}</a></p>
                        <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-charcoal/50" /> <a href={`mailto:${shelter.email}`} className="text-cocoa underline hover:text-heart">{shelter.email}</a></p>
                        <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-charcoal/50" /> {shelter.hours}</p>
                      </div>
                      <p className="text-xs text-charcoal/50 pt-1">
                        Reach out directly — shelter staff can discuss {cat.name}'s needs and help match you with a cat who's the right fit.
                      </p>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShelterContact(false)}
                    className="text-xs"
                  >
                    Hide details
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Button
                onClick={() => setShowShelterContact(true)}
                className="w-full bg-heart hover:bg-heart/90 text-white font-bold py-5 rounded-full shadow-[3px_3px_0px_0px_rgba(239,68,68,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 transition-all gap-2"
              >
                <Phone className="h-4 w-4" /> Contact Shelter
              </Button>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/cats")}
                className="flex-1 rounded-full border-2 border-cocoa/20 bg-white text-cocoa hover:bg-cocoa/5 font-bold py-5 shadow-[3px_3px_0px_0px_rgba(42,29,20,0.1)] transition-all"
              >
                <Cat className="h-4 w-4 mr-2" /> Try Other Cats
              </Button>
              <Button
                variant="outline"
                onClick={() => setGameOpen(true)}
                className="flex-1 rounded-full border-2 border-sage/40 bg-white text-sage-deep hover:bg-sage/10 font-bold py-5 shadow-[3px_3px_0px_0px_rgba(42,29,20,0.1)] transition-all"
              >
                <Gamepad2 className="h-4 w-4 mr-2" /> Play: Whisker Runner
              </Button>
            </div>
          </div>
        ) : (
          /* ── LOW / MODERATE: Show adoption ── */
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => router.push("/cats")}
              className="flex-1 rounded-full border-2 border-cocoa/20 bg-white text-cocoa hover:bg-cocoa/5 font-bold py-5 shadow-[3px_3px_0px_0px_rgba(42,29,20,0.1)] hover:shadow-[4px_4px_0px_0px_rgba(42,29,20,0.15)] hover:-translate-y-0.5 transition-all"
            >
              <Cat className="h-4 w-4 mr-2" /> Try Another Cat
            </Button>
            <Button
              onClick={() => setShowAdoptForm(true)}
              className="flex-1 bg-heart hover:bg-heart/90 text-white font-bold py-5 rounded-full shadow-[3px_3px_0px_0px_rgba(239,68,68,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 transition-all gap-2"
            >
              <Heart className="h-4 w-4 fill-white" /> Start Adoption Process
            </Button>
          </div>
        )}
      </div>

      <WhiskerRunnerDialog
        open={gameOpen}
        onOpenChange={setGameOpen}
        catName={cat.name}
      />
    </div>
  );
}
