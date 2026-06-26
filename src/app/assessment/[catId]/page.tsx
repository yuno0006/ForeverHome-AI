"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCatById } from "@/data/demoCats";
import { assessCompatibility } from "@/lib/compatibilityEngine";
import { AdopterAnswers, Child } from "@/types/adopter";
import QuestionStep from "@/components/assessment/QuestionStep";
import ScenarioQuestion from "@/components/assessment/ScenarioQuestion";
import ProgressBarComponent from "@/components/assessment/ProgressBar";
import CatProfile from "@/components/cats/CatProfile";

interface Question {
  id: string;
  type: "standard" | "scenario";
  question?: string;
  description?: string;
  scenario?: string;
  options: { value: string; label: string }[];
}

const questions: Question[] = [
  {
    id: "homeType",
    type: "standard",
    question: "What type of home do you live in?",
    options: [
      { value: "house", label: "House" },
      { value: "apartment", label: "Apartment" },
      { value: "condo", label: "Condo" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "adultsInHome",
    type: "standard",
    question: "How many adults live in your home?",
    options: [
      { value: "1", label: "1 adult" },
      { value: "2", label: "2 adults" },
      { value: "3+", label: "3 or more" },
    ],
  },
  {
    id: "children",
    type: "standard",
    question: "Are there children in your home?",
    description: "If yes, what age ranges?",
    options: [
      { value: "none", label: "No children" },
      { value: "0-4", label: "Children under 5" },
      { value: "5-9", label: "Children aged 5-9" },
      { value: "10+", label: "Children aged 10 or older" },
    ],
  },
  {
    id: "existingPets",
    type: "standard",
    question: "Do you currently have other pets?",
    options: [
      { value: "none", label: "No other pets" },
      { value: "cats", label: "Yes, cats" },
      { value: "dogs", label: "Yes, dogs" },
      { value: "both", label: "Yes, cats and dogs" },
    ],
  },
  {
    id: "householdNoise",
    type: "standard",
    question: "How would you describe the noise level in your home?",
    description: "Consider everyday sounds — conversations, TV, children playing, music.",
    options: [
      { value: "low", label: "Quiet — mostly calm and peaceful" },
      { value: "moderate", label: "Moderate — some everyday noise" },
      { value: "high", label: "Busy — often loud and active" },
    ],
  },
  {
    id: "hoursAway",
    type: "standard",
    question: "How many hours per day are you typically away from home?",
    options: [
      { value: "0-4", label: "0-4 hours" },
      { value: "5-8", label: "5-8 hours" },
      { value: "9-11", label: "9-11 hours" },
      { value: "12+", label: "12+ hours" },
    ],
  },
  {
    id: "previousCatExperience",
    type: "standard",
    question: "Have you owned a cat before?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No, this would be my first cat" },
    ],
  },
  {
    id: "canProvideVerticalSpace",
    type: "standard",
    question: "Can you provide vertical space for your cat?",
    description: "Cat trees, wall shelves, window perches, or sturdy furniture the cat can climb.",
    options: [
      { value: "yes", label: "Yes, I can provide climbing spaces" },
      { value: "no", label: "Not currently, but I could set something up" },
    ],
  },
  {
    id: "indoorSafety",
    type: "standard",
    question: "Can you provide a secure indoor-only environment?",
    description: "Windows with screens, safe entryways, no risk of escape.",
    options: [
      { value: "secure", label: "Yes, my home is secure for an indoor cat" },
      { value: "partial", label: "Partially — some windows may not have screens" },
      { value: "unsure", label: "I'm not sure" },
    ],
  },
  {
    id: "scenario1",
    type: "scenario",
    scenario:
      "At 11 PM you discover the cat vomited on your pillow. You have work at 8 AM. What do you do?",
    options: [
      { value: "a", label: "Get upset and isolate the cat for the night" },
      { value: "b", label: "Clean it up calmly, reassure the cat, and go back to sleep" },
      { value: "c", label: "Immediately consider returning the cat" },
    ],
  },
  {
    id: "scenario2",
    type: "scenario",
    scenario:
      "You come home and find the cat has scratched your favorite couch. You say:",
    options: [
      { value: "a", label: "Use a spray bottle to discourage the behavior" },
      { value: "b", label: "Redirect the cat to a scratching post and stay calm" },
      { value: "c", label: "That's it — the cat is going back" },
    ],
  },
  {
    id: "scenario3",
    type: "scenario",
    scenario:
      "The cat has been hiding under the bed for 3 days and barely comes out. You feel:",
    options: [
      { value: "a", label: "Frustrated — I want a cat that interacts with me" },
      { value: "b", label: "Concerned but patient — I'll give the cat time and space" },
      { value: "c", label: "Worried — I think something is wrong and want to call the shelter" },
    ],
  },
];

function mapAnswers(rawAnswers: Record<string, string>): AdopterAnswers {
  const children: Child[] = [];
  if (rawAnswers.children === "0-4") children.push({ ageRange: "0-4" });
  else if (rawAnswers.children === "5-9") children.push({ ageRange: "5-9" });
  else if (rawAnswers.children === "10+") children.push({ ageRange: "15+" });

  let existingPets = { cats: 0, dogs: 0 };
  if (rawAnswers.existingPets === "cats") existingPets = { cats: 1, dogs: 0 };
  else if (rawAnswers.existingPets === "dogs") existingPets = { cats: 0, dogs: 1 };
  else if (rawAnswers.existingPets === "both") existingPets = { cats: 1, dogs: 1 };

  let hoursAway = 8;
  if (rawAnswers.hoursAway === "0-4") hoursAway = 4;
  else if (rawAnswers.hoursAway === "5-8") hoursAway = 8;
  else if (rawAnswers.hoursAway === "9-11") hoursAway = 11;
  else if (rawAnswers.hoursAway === "12+") hoursAway = 12;

  let adultsInHome = 1;
  if (rawAnswers.adultsInHome === "2") adultsInHome = 2;
  else if (rawAnswers.adultsInHome === "3+") adultsInHome = 3;

  return {
    homeType: (rawAnswers.homeType || "house") as AdopterAnswers["homeType"],
    adultsInHome,
    children,
    existingPets,
    householdNoise: (rawAnswers.householdNoise || "moderate") as AdopterAnswers["householdNoise"],
    hoursAway,
    travelFrequency: "occasional",
    previousCatExperience: rawAnswers.previousCatExperience === "yes",
    specialNeedsExperience: false,
    canProvideVerticalSpace: rawAnswers.canProvideVerticalSpace === "yes",
    indoorSafety: (rawAnswers.indoorSafety || "secure") as AdopterAnswers["indoorSafety"],
    veterinaryAccess: "yes",
    comfortableWithRoutineCare: true,
    scenarioAnswers: [
      rawAnswers.scenario1 || "",
      rawAnswers.scenario2 || "",
      rawAnswers.scenario3 || "",
    ],
  };
}

export default function AssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const catId = params.catId as string;
  const cat = getCatById(catId);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (!cat) {
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

  const totalSteps = questions.length;
  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (isLastStep) {
      // Run compatibility engine
      const adopterAnswers = mapAnswers(answers);
      const result = assessCompatibility(cat, adopterAnswers);

      // Store result in sessionStorage for the report page
      const matchId = `match-${catId}-${Date.now()}`;
      const matchData = {
        id: matchId,
        catId,
        adopterAnswers,
        result,
        timestamp: new Date().toISOString(),
      };
      sessionStorage.setItem(matchId, JSON.stringify(matchData));

      router.push(`/report/${matchId}`);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentAnswer = answers[currentQuestion.id] || "";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sidebar - Cat Profile (visible on desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <CatProfile cat={cat} />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <ProgressBarComponent current={currentStep + 1} total={totalSteps} />
          </div>

          <Card className="border-border bg-white shadow-sm">
            <CardContent className="pt-6">
              {currentQuestion.type === "standard" ? (
                <QuestionStep
                  question={currentQuestion.question!}
                  description={currentQuestion.description}
                  options={currentQuestion.options}
                  value={currentAnswer}
                  onChange={handleAnswer}
                  name={currentQuestion.id}
                />
              ) : (
                <ScenarioQuestion
                  scenario={currentQuestion.scenario!}
                  options={currentQuestion.options}
                  value={currentAnswer}
                  onChange={handleAnswer}
                  name={currentQuestion.id}
                />
              )}

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!currentAnswer}
                  className="bg-sunny hover:bg-sunny/90 text-white"
                >
                  {isLastStep ? "See Results" : "Next"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
