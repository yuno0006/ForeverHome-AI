"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, Cat, Sparkles, Heart, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCatById, getAvailableCats, demoCats } from "@/data/demoCats";
import { assessCompatibility } from "@/lib/compatibilityEngine";
import { fetchAdopterProfile, saveAssessment } from "@/lib/firestoreService";
import { useAuth } from "@/hooks/useAuth";
import { AdopterProfile } from "@/types/adopterProfile";
import { AdopterAnswers } from "@/types/adopter";
import { CompatibilityResult } from "@/types/match";
import { ScenarioAnswer } from "@/types/assessment";

// Default guest profile — allows judges to try the demo without creating an account.
// Matches the AdopterProfile interface so the compatibility engine works identically.
const GUEST_PROFILE: AdopterProfile = {
  id: "guest",
  uid: "guest",
  name: "Demo User",
  profilePhoto: null,
  email: "demo@foreverhome.ai",
  phone: null,
  homeType: "house",
  hasChildren: false,
  childrenAges: [],
  hasExistingPets: false,
  existingPets: { cats: 0, dogs: 0, other: [] },
  hasGarden: false,
  indoorOnlyPreference: true,
  workHours: "out-part-day",
  travelFrequency: "occasional",
  householdNoise: "moderate",
  catExperience: "beginner",
  personalityPreference: ["calm", "affectionate"],
  agePreference: ["adult", "senior"],
  specialNeedsOpenness: false,
  createdAt: null as unknown as import("firebase/firestore").Timestamp,
  updatedAt: null as unknown as import("firebase/firestore").Timestamp,
  isComplete: true,
};
import ScenarioQuestion from "@/components/assessment/ScenarioQuestion";
import ProgressBarComponent from "@/components/assessment/ProgressBar";
import CatProfile from "@/components/cats/CatProfile";

interface ScenarioQuestionData {
  id: string;
  scenario: string;
  options: { value: string; label: string; score: number }[];
  traits: string[];
}

// 10 scenario-based questions covering key adoption readiness dimensions
const scenarioQuestions: ScenarioQuestionData[] = [
  {
    id: "scenario1",
    scenario:
      "At 11 PM you discover the cat vomited on your pillow. You have work at 8 AM. What do you do?",
    options: [
      { value: "a", label: "Get upset and isolate the cat for the night", score: 1 },
      { value: "b", label: "Clean it up calmly, reassure the cat, and go back to sleep", score: 3 },
      { value: "c", label: "Immediately consider returning the cat", score: 0 },
    ],
    traits: ["patience", "commitment"],
  },
  {
    id: "scenario2",
    scenario:
      "You come home and find the cat has scratched your favorite couch. You say:",
    options: [
      { value: "a", label: "Use a spray bottle to discourage the behavior", score: 1 },
      { value: "b", label: "Redirect the cat to a scratching post and stay calm", score: 3 },
      { value: "c", label: "That's it — the cat is going back", score: 0 },
    ],
    traits: ["patience", "problem-solving"],
  },
  {
    id: "scenario3",
    scenario:
      "The cat has been hiding under the bed for 3 days and barely comes out. You feel:",
    options: [
      { value: "a", label: "Frustrated — I want a cat that interacts with me", score: 0 },
      { value: "b", label: "Concerned but patient — I'll give the cat time and space", score: 3 },
      { value: "c", label: "Worried — I think something is wrong and want to call the shelter", score: 2 },
    ],
    traits: ["patience", "understanding"],
  },
  {
    id: "scenario4",
    scenario:
      "A friend visits and the cat jumps on the kitchen counter while you're preparing food. Your friend looks uncomfortable. You:",
    options: [
      { value: "a", label: "Apologize profusely and put the cat in another room", score: 1 },
      { value: "b", label: "Calmly redirect the cat and explain it's a work in progress", score: 3 },
      { value: "c", label: "Feel embarrassed and consider if a cat is right for me", score: 0 },
    ],
    traits: ["confidence", "training-approach"],
  },
  {
    id: "scenario5",
    scenario:
      "You're planning a 2-week vacation. The cat needs care while you're away. You:",
    options: [
      { value: "a", label: "Cancel or shorten the trip — the cat needs me", score: 2 },
      { value: "b", label: "Arrange a trusted pet sitter to visit daily", score: 3 },
      { value: "c", label: "Board the cat at a kennel for the duration", score: 1 },
    ],
    traits: ["planning", "responsibility"],
  },
  {
    id: "scenario6",
    scenario:
      "The vet says your cat needs daily medication for a chronic condition. This will cost $60/month and requires you to give a pill every morning. You:",
    options: [
      { value: "a", label: "That's too much — I'll look for a healthier cat", score: 0 },
      { value: "b", label: "I'll learn how to do it and budget for the medicine", score: 3 },
      { value: "c", label: "I'll try, but if it's too hard I may need to return the cat", score: 1 },
    ],
    traits: ["financial-readiness", "medical-commitment"],
  },
  {
    id: "scenario7",
    scenario:
      "You have guests staying for a weekend and the house gets loud. The cat disappears for 2 days. You:",
    options: [
      { value: "a", label: "Worry the cat is broken and consider rehoming", score: 0 },
      { value: "b", label: "Set up a quiet room for the cat and explain to guests", score: 3 },
      { value: "c", label: "Let the cat figure it out — they'll come back when hungry", score: 1 },
    ],
    traits: ["advocacy", "environment-management"],
  },
  {
    id: "scenario8",
    scenario:
      "It's 4 AM and the cat is meowing loudly outside your bedroom door every single night this week. You:",
    options: [
      { value: "a", label: "Open the door and feed them to make them stop", score: 1 },
      { value: "b", label: "Ignore it consistently and increase evening playtime", score: 3 },
      { value: "c", label: "Yell at the cat or spray water — they need to learn", score: 0 },
    ],
    traits: ["consistency", "behavior-knowledge"],
  },
  {
    id: "scenario9",
    scenario:
      "An unexpected vet bill comes to $800. You have some savings but it's tight. You:",
    options: [
      { value: "a", label: "Use savings or payment plan — the cat's health comes first", score: 3 },
      { value: "b", label: "Ask the shelter if they can cover it — I can't afford this", score: 1 },
      { value: "c", label: "Surrender the cat — I didn't sign up for this expense", score: 0 },
    ],
    traits: ["financial-readiness", "commitment"],
  },
  {
    id: "scenario10",
    scenario:
      "Your existing cat hisses at the new cat every time they meet. It's been 2 weeks. You:",
    options: [
      { value: "a", label: "Give up — clearly they'll never get along", score: 0 },
      { value: "b", label: "Separate them and start a slow reintroduction over several weeks", score: 3 },
      { value: "c", label: "Let them fight it out — they'll sort out the hierarchy", score: 1 },
    ],
    traits: ["patience", "multi-pet-knowledge"],
  },
];

type CatMatch = {
  cat: (typeof demoCats)[0];
  result: CompatibilityResult;
  score: number;
};

export default function AssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const catId = params.catId as string;
  const isGeneralMode = catId === "new";
  const cat = isGeneralMode ? null : getCatById(catId);

  // Detect guest (unauthenticated) mode
  const isGuest = !authLoading && !user;

  // Profile state
  const [profile, setProfile] = useState<AdopterProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Assessment state
  const [currentStep, setCurrentStep] = useState(-1); // -1 = lifestyle questions
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  const [dynamicQuestions, setDynamicQuestions] = useState<ScenarioQuestionData[]>(scenarioQuestions);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  // Lifestyle pre-questions state
  const [lifestyleAnswers, setLifestyleAnswers] = useState({
    livingSpace: "",
    workSchedule: "",
    activityLevel: "",
    catPreference: "",
    dealbreakers: "",
    reason: "",
  });

  // General mode results
  const [generalResults, setGeneralResults] = useState<CatMatch[] | null>(null);

  // Load profile: guest → instant default; authenticated → fetch from Firestore
  useEffect(() => {
    async function loadProfile() {
      if (authLoading) return;

      // Guest mode: use the hardcoded default profile — no login needed
      if (!user) {
        setProfile(GUEST_PROFILE);
        setProfileLoading(false);
        return;
      }

      // Authenticated user: fetch their real profile
      try {
        const fetchedProfile = await fetchAdopterProfile(user.uid);
        if (!fetchedProfile) {
          router.replace("/onboarding?message=" + encodeURIComponent("Please complete your profile first"));
          return;
        }
        setProfile(fetchedProfile);
      } catch (err) {
        // Firestore may be unreachable — fall back to guest profile so the quiz still works
        console.warn("Failed to fetch Firestore profile, falling back to guest:", err);
        setProfile(GUEST_PROFILE);
      } finally {
        setProfileLoading(false);
      }
    }

    loadProfile();
  }, [user, authLoading, router, catId]);

  // Load dynamic scenario questions for specific cats
  useEffect(() => {
    async function loadDynamicQuestions() {
      if (isGeneralMode || !cat || profileLoading || !profile) return;
      if (isGuest) {
        setDynamicQuestions(scenarioQuestions.slice(0, 4));
        return;
      }
      
      setGeneratingQuestions(true);
      try {
        const adopterProfileStr = `Home: ${profile.homeType}, Kids: ${profile.hasChildren}, Pets: ${profile.hasExistingPets ? 'Yes' : 'No'}, Experience: ${profile.catExperience}`;
        const res = await fetch("/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ catId, adopterProfileStr })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.questions && data.questions.length === 4) {
            setDynamicQuestions(data.questions);
          } else {
            setDynamicQuestions(scenarioQuestions.slice(0, 4));
          }
        } else {
          setDynamicQuestions(scenarioQuestions.slice(0, 4));
        }
      } catch (e) {
        console.error("Failed to generate questions:", e);
        setDynamicQuestions(scenarioQuestions.slice(0, 4));
      } finally {
        setGeneratingQuestions(false);
      }
    }
    
    // Check if we need to load them (i.e. we're using the default 10 right now)
    if (dynamicQuestions.length > 4 && !isGeneralMode && cat && profile) {
      loadDynamicQuestions();
    }
  }, [isGeneralMode, cat, profile, profileLoading, isGuest, catId, dynamicQuestions.length]);

  // Handle answer selection
  const handleAnswer = (value: string) => {
    const currentQuestion = dynamicQuestions[currentStep];
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  // Build adopter answers from profile (used by both modes)
  function buildAdopterAnswers(profile: AdopterProfile): AdopterAnswers {
    return {
      homeType: profile.homeType,
      adultsInHome: 1,
      children: profile.childrenAges
        .filter((age): age is "0-4" | "5-9" | "10-14" | "15+" =>
          ["0-4", "5-9", "10-14", "15+"].includes(age))
        .map((age) => ({ ageRange: age })),
      existingPets: profile.existingPets,
      householdNoise: profile.householdNoise === "quiet" ? "low" :
        profile.householdNoise === "active" ? "high" : "moderate",
      hoursAway: 8,
      travelFrequency: profile.travelFrequency === "rarely" ? "rare" :
        profile.travelFrequency === "frequent" ? "frequent" : "occasional",
      previousCatExperience: profile.catExperience !== "none",
      specialNeedsExperience: false,
      canProvideVerticalSpace: true,
      indoorSafety: "secure",
      veterinaryAccess: "yes",
      comfortableWithRoutineCare: true,
      scenarioAnswers: Object.values(answers),
    };
  }

  // Handle next/submit
  const handleNext = async () => {
    const isLastStep = currentStep === dynamicQuestions.length - 1;

    if (isLastStep) {
      if (!profile) return;

      setSubmitting(true);
      const scenarioAnswers: ScenarioAnswer[] = dynamicQuestions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || "",
      }));
      
      const scenarioQA = dynamicQuestions.map((q) => {
        const option = q.options.find(o => o.value === answers[q.id]);
        return `Q: ${q.scenario}\nA: ${option ? option.label : "No answer"} (${option?.score || 0} points)`;
      }).join("\n\n");

      if (isGeneralMode) {
        // General mode: assess against ALL available cats
        try {
          const adopterAnswers = buildAdopterAnswers(profile);
          const availableCats = getAvailableCats();

          const allResults: CatMatch[] = availableCats.map((cat) => {
            const result = assessCompatibility(cat, adopterAnswers);
            const riskScore = result.level === "low" ? 95 : result.level === "moderate" ? 70 : 40;
            const deductions = result.concerns.reduce((sum, c) =>
              sum + (c.severity === "significant" ? 15 : 8), 0);
            const score = Math.max(0, riskScore - deductions);
            return { cat, result, score };
          });

          allResults.sort((a, b) => b.score - a.score);
          setGeneralResults(allResults);

          // Save if not guest
          if (!isGuest && user) {
            try {
              const topMatch = allResults[0];
              const scoreMap = { low: 90, moderate: 70, high: 40 };
              const recommendationMap: Record<string, "excellent" | "good" | "fair" | "not-recommended"> = {
                low: "excellent", moderate: "good", high: "fair",
              };
              const assessmentId = await saveAssessment({
                adopterUid: user.uid,
                catId: topMatch.cat.id,
                adopterProfileId: profile.id,
                scenarioAnswers,
                compatibilityResult: {
                  score: scoreMap[topMatch.result.level],
                  recommendation: recommendationMap[topMatch.result.level],
                },
              });
              sessionStorage.setItem(`general_${assessmentId}`, JSON.stringify({
                id: assessmentId, catId: topMatch.cat.id, adopterProfileId: profile.id,
                scenarioAnswers, result: topMatch.result, timestamp: new Date().toISOString(),
              }));
            } catch (saveErr) {
              console.error("Failed to save general assessment:", saveErr);
            }
          }
        } catch (err) {
          console.error("Failed to run general assessment:", err);
        } finally {
          setSubmitting(false);
        }
      } else {
        // Specific-cat mode
        if (!cat) { setSubmitting(false); return; }

        try {
          const adopterAnswers = buildAdopterAnswers(profile);
          const result = assessCompatibility(cat, adopterAnswers);

          const matchData = {
            id: isGuest ? `guest-${catId}` : "",
            catId,
            adopterProfileId: isGuest ? "guest" : (profile.id),
            adopterAnswers,
            scenarioAnswers,
            result,
            timestamp: new Date().toISOString(),
            scenarioQA,
          };

          if (!isGuest && user) {
            // Authenticated: persist to Firestore first, then navigate
            const scoreMap = { low: 90, moderate: 70, high: 40 };
            const recommendationMap: Record<string, "excellent" | "good" | "fair" | "not-recommended"> = {
              low: "excellent", moderate: "good", high: "fair",
            };
            const assessmentId = await saveAssessment({
              adopterUid: user.uid,
              catId,
              adopterProfileId: profile.id,
              scenarioAnswers,
              compatibilityResult: {
                score: scoreMap[result.level],
                recommendation: recommendationMap[result.level],
              },
            });
            matchData.id = assessmentId;
          }

          sessionStorage.setItem(matchData.id, JSON.stringify(matchData));
          router.push(`/report/${matchData.id}`);
        } catch (err) {
          console.error("Failed to save assessment:", err);
          setSubmitting(false);
        }
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (currentStep === 0) {
      setCurrentStep(-1); // Go back to lifestyle questions
    }
  };

  // Loading state
  if (authLoading || profileLoading || generatingQuestions) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent flex-col gap-4">
        <Loader2 className="size-8 animate-spin text-sunny" />
        {generatingQuestions && (
          <p className="text-cocoa font-bold">Generating personalized assessment for {cat?.name}...</p>
        )}
      </div>
    );
  }

  // Error state
  if (profileError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-cat-dark">Something went wrong</h1>
        <p className="text-charcoal/50 mt-2">{profileError}</p>
        <Button
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Cat not found (only for non-general mode)
  if (!isGeneralMode && !cat) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-cat-dark">Cat not found</h1>
        <p className="text-charcoal/50 mt-2">
          The cat you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button className="mt-4" onClick={() => router.push("/cats")}>
          Back to Cats
        </Button>
      </div>
    );
  }

  // === GENERAL MODE RESULTS VIEW ===
  if (isGeneralMode && generalResults) {
    const topMatch = generalResults[0];
    const allGood = generalResults.filter((m) => m.result.level === "low");
    const someConcern = generalResults.filter((m) => m.result.level !== "low");

    return (
      <div className="min-h-screen bg-transparent pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Hero result banner */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-white border-2 border-cocoa rounded-full pl-1.5 pr-4 py-1.5 shadow-[3px_3px_0px_0px_rgba(42,29,20,1)]">
              <span className="flex items-center gap-1 bg-cocoa text-cream text-xs font-bold px-2.5 py-1 rounded-full">
                <Sparkles className="w-3 h-3" /> RESULTS
              </span>
              <span className="text-sm font-semibold text-cocoa">
                {generalResults.length} cats assessed
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-black text-cocoa leading-tight">
              Your purr-fect<br />
              <span className="text-gradient-warm italic">match is here</span>
            </h1>
            <p className="text-cocoa/70 font-medium max-w-md mx-auto">
              We analysed your scenario responses against all available cats. Here&apos;s how they rank.
            </p>
          </div>

          {/* Top Match — hero card */}
          <Card className="border-2 border-cocoa shadow-[8px_8px_0px_0px_rgba(42,29,20,1)] bg-white overflow-hidden rounded-[28px]">
            <div className="bg-coral text-white px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 fill-white" />
                <span className="font-display font-black text-lg">Best Match</span>
              </div>
              <Badge className="bg-white text-cocoa font-black">
                {topMatch.score}% Match
              </Badge>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden flex-shrink-0">
                  {topMatch.cat.photo ? (
                    <img
                      src={topMatch.cat.photo}
                      alt={topMatch.cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Cat className="w-12 h-12 text-cocoa/30" />
                  )}
                </div>
                <div className="text-center sm:text-left space-y-2 flex-1">
                  <h2 className="font-display text-3xl font-black text-cocoa">{topMatch.cat.name}</h2>
                  <p className="text-cocoa/60 font-medium">
                    {topMatch.cat.breed} &middot;{" "}
                    {topMatch.cat.age < 1
                      ? `${topMatch.cat.age * 12} months`
                      : `${topMatch.cat.age} ${topMatch.cat.age === 1 ? "yr" : "yrs"}`}{" "}
                    &middot; {topMatch.cat.lifeStage}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(topMatch.cat.personality ?? []).slice(0, 3).map((p) => (
                      <span
                        key={p.trait}
                        className="text-xs font-bold bg-cream-dark text-cocoa/70 px-2.5 py-1 rounded-full border border-cocoa/10"
                      >
                        {p.trait}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2">
                    <Link href={`/assessment/${topMatch.cat.id}`}>
                      <Button className="bg-coral text-white hover:bg-coral-deep rounded-full font-bold shadow-[3px_3px_0px_0px_rgba(42,29,20,1)]">
                        View Full Report
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* All matches grid */}
          <div>
            <h3 className="font-display text-2xl font-black text-cocoa mb-4">All Matches</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {generalResults.map((match, idx) => {
                const isTop = idx === 0;
                const levelColors = {
                  low: "border-sage bg-sage/5",
                  moderate: "border-honey bg-honey/5",
                  high: "border-coral bg-coral/5",
                };
                const levelLabels = {
                  low: "Great match",
                  moderate: "Good with care",
                  high: "Needs review",
                };

                return (
                  <Card
                    key={match.cat.id}
                    className={`border-2 rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] ${
                      isTop ? "border-coral bg-coral/5 shadow-[4px_4px_0px_0px_rgba(42,29,20,1)]" : "border-cocoa/20 bg-white"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-16 h-16 rounded-xl bg-cream-dark border border-cocoa/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {match.cat.photo ? (
                            <img
                              src={match.cat.photo}
                              alt={match.cat.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Cat className="w-6 h-6 text-cocoa/30" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display font-black text-cocoa text-lg leading-tight truncate">
                            {match.cat.name}
                          </h4>
                          <p className="text-xs text-cocoa/50 font-medium">{match.cat.breed}</p>
                        </div>
                        <Badge
                          className={`font-black text-xs ${
                            match.score >= 80
                              ? "bg-sage text-white"
                              : match.score >= 60
                              ? "bg-honey text-cocoa"
                              : "bg-coral text-white"
                          }`}
                        >
                          {match.score}%
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          match.result.level === "low" ? "border-sage text-sage bg-sage/10" :
                          match.result.level === "moderate" ? "border-honey text-honey bg-honey/10" :
                          "border-coral text-coral bg-coral/10"
                        }`}>
                          {levelLabels[match.result.level]}
                        </span>
                        {match.result.concerns.length > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-cocoa/15 text-cocoa/50 bg-cocoa/5">
                            {match.result.concerns.length} concern{match.result.concerns.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      <Link href={`/assessment/${match.cat.id}`} className="block">
                        <Button
                          variant={isTop ? "default" : "outline"}
                          size="sm"
                          className={`w-full rounded-full font-bold text-xs ${
                            isTop
                              ? "bg-coral text-white hover:bg-coral-deep"
                              : "border-cocoa/20 text-cocoa hover:bg-cocoa/5"
                          }`}
                        >
                          Assess {match.cat.name}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* CTA to browse all */}
          <div className="text-center pt-4">
            <Link href="/cats">
              <Button variant="outline" className="border-2 border-cocoa bg-transparent text-cocoa hover:bg-cocoa/5 rounded-full font-bold">
                <Cat className="w-4 h-4 mr-2" /> Browse All Cats
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // === QUIZ VIEW (shared by both modes) ===
  const currentQuestion = currentStep >= 0 ? dynamicQuestions[currentStep] : null;
  const currentAnswer = currentQuestion ? (answers[currentQuestion.id] || "") : "";
  const totalQuizSteps = dynamicQuestions.length + 1; // +1 for lifestyle step

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Guest demo banner — frictionless path for judges */}
      {isGuest && (
        <div className="mb-6 flex items-center justify-between gap-4 bg-honey/10 border-2 border-honey/30 rounded-2xl px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎭</span>
            <div>
              <p className="text-sm font-bold text-cocoa">Demo Mode</p>
              <p className="text-xs text-cocoa/60">
                Trying the quiz with a sample profile.{" "}
                <Link href="/login?redirect=/assessment/barnaby" className="underline font-semibold text-cocoa hover:text-cocoa/80">
                  Sign in
                </Link>{" "}
                to save your results.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cat profile — visible on all screen sizes */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            {isGeneralMode ? (
              <Card className="border-2 border-cocoa/20 bg-white shadow-sm rounded-2xl">
                <CardContent className="p-5 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-sage/20 border-2 border-sage flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-sage" />
                  </div>
                  <h3 className="font-display font-black text-lg text-cocoa">General Assessment</h3>
                  <p className="text-xs text-cocoa/60 font-medium">
                    We&apos;ll match you with the best cat based on your lifestyle and scenario answers.
                  </p>
                  <div className="text-xs font-bold text-cocoa/40">
                    {totalQuizSteps} steps total
                  </div>
                </CardContent>
              </Card>
            ) : cat ? (
              <CatProfile cat={cat} />
            ) : null}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <ProgressBarComponent current={currentStep + 2} total={totalQuizSteps} />
          </div>

          {/* Lifestyle Pre-Questions */}
          {currentStep === -1 && (
            <Card className="border-2 border-cocoa/10 bg-white shadow-sm">
              <CardContent className="pt-6 space-y-5">
                <div className="text-center mb-2">
                  <h2 className="font-display text-xl font-black text-cocoa">Tell us about your lifestyle</h2>
                  <p className="text-sm text-cocoa/60 mt-1">This helps our AI match you better</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-cocoa block mb-1.5">What best describes your living space?</label>
                    <select
                      value={lifestyleAnswers.livingSpace}
                      onChange={(e) => setLifestyleAnswers(prev => ({ ...prev, livingSpace: e.target.value }))}
                      className="h-11 w-full rounded-xl border-2 border-cocoa/20 bg-cream/50 px-3 text-sm text-cocoa font-medium outline-none focus:border-coral"
                    >
                      <option value="">Select...</option>
                      <option value="small-apartment">Small apartment (studio/1BR)</option>
                      <option value="large-apartment">Large apartment (2BR+)</option>
                      <option value="house-no-yard">House without yard</option>
                      <option value="house-with-yard">House with enclosed yard</option>
                      <option value="rural">Rural property with land</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-cocoa block mb-1.5">Your typical daily schedule?</label>
                    <select
                      value={lifestyleAnswers.workSchedule}
                      onChange={(e) => setLifestyleAnswers(prev => ({ ...prev, workSchedule: e.target.value }))}
                      className="h-11 w-full rounded-xl border-2 border-cocoa/20 bg-cream/50 px-3 text-sm text-cocoa font-medium outline-none focus:border-coral"
                    >
                      <option value="">Select...</option>
                      <option value="home-all-day">Home all day (remote work/retired)</option>
                      <option value="home-half-day">Home half the day</option>
                      <option value="out-8-hours">Out 8+ hours (office job)</option>
                      <option value="irregular">Irregular schedule (shift work)</option>
                      <option value="travel-frequent">Frequently travel for work</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-cocoa block mb-1.5">Your household activity level?</label>
                    <select
                      value={lifestyleAnswers.activityLevel}
                      onChange={(e) => setLifestyleAnswers(prev => ({ ...prev, activityLevel: e.target.value }))}
                      className="h-11 w-full rounded-xl border-2 border-cocoa/20 bg-cream/50 px-3 text-sm text-cocoa font-medium outline-none focus:border-coral"
                    >
                      <option value="">Select...</option>
                      <option value="very-quiet">Very quiet — I live alone, minimal noise</option>
                      <option value="moderate">Moderate — couple or calm roommate</option>
                      <option value="active">Active — kids, guests, music often on</option>
                      <option value="chaotic">Chaotic — large family, constant movement</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-cocoa block mb-1.5">What type of cat personality appeals to you?</label>
                    <select
                      value={lifestyleAnswers.catPreference}
                      onChange={(e) => setLifestyleAnswers(prev => ({ ...prev, catPreference: e.target.value }))}
                      className="h-11 w-full rounded-xl border-2 border-cocoa/20 bg-cream/50 px-3 text-sm text-cocoa font-medium outline-none focus:border-coral"
                    >
                      <option value="">Select...</option>
                      <option value="lap-cat">Lap cat — always wants to cuddle</option>
                      <option value="playful">Playful — energetic and interactive</option>
                      <option value="independent">Independent — does their own thing</option>
                      <option value="balanced">Balanced — social but not clingy</option>
                      <option value="no-preference">No preference — open to any personality</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-cocoa block mb-1.5">Any dealbreakers? (select if applicable)</label>
                    <select
                      value={lifestyleAnswers.dealbreakers}
                      onChange={(e) => setLifestyleAnswers(prev => ({ ...prev, dealbreakers: e.target.value }))}
                      className="h-11 w-full rounded-xl border-2 border-cocoa/20 bg-cream/50 px-3 text-sm text-cocoa font-medium outline-none focus:border-coral"
                    >
                      <option value="">No dealbreakers</option>
                      <option value="no-special-needs">Can&apos;t handle special medical needs</option>
                      <option value="no-high-energy">Can&apos;t handle a high-energy cat</option>
                      <option value="no-shy">Don&apos;t want a very shy/hiding cat</option>
                      <option value="no-vocal">Can&apos;t deal with a very vocal cat</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-cocoa block mb-1.5">Why are you looking to adopt?</label>
                    <select
                      value={lifestyleAnswers.reason}
                      onChange={(e) => setLifestyleAnswers(prev => ({ ...prev, reason: e.target.value }))}
                      className="h-11 w-full rounded-xl border-2 border-cocoa/20 bg-cream/50 px-3 text-sm text-cocoa font-medium outline-none focus:border-coral"
                    >
                      <option value="">Select...</option>
                      <option value="companionship">Companionship — I want a buddy</option>
                      <option value="family-pet">Family pet for the kids</option>
                      <option value="emotional-support">Emotional support / mental health</option>
                      <option value="rescue-mission">I want to give a rescue a better life</option>
                      <option value="companion-for-existing">Companion for my existing cat</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => setCurrentStep(0)}
                    disabled={!lifestyleAnswers.livingSpace || !lifestyleAnswers.workSchedule || !lifestyleAnswers.activityLevel || !lifestyleAnswers.catPreference || !lifestyleAnswers.reason}
                    className="bg-sunny hover:bg-sunny/90 text-white"
                  >
                    Next: Scenarios <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scenario Questions */}
          {currentStep >= 0 && currentQuestion && (
            <Card className="border-2 border-cocoa/10 bg-white shadow-sm">
              <CardContent className="pt-6">
                <ScenarioQuestion
                  scenario={currentQuestion.scenario}
                  options={currentQuestion.options.map((o) => ({ value: o.value, label: o.label }))}
                  value={currentAnswer}
                  onChange={handleAnswer}
                  name={currentQuestion.id}
                />

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={submitting}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!currentAnswer || submitting}
                    className="bg-sunny hover:bg-sunny/90 text-white"
                  >
                    {submitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : currentStep === dynamicQuestions.length - 1 ? (
                      "See Results"
                    ) : (
                      "Next"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
