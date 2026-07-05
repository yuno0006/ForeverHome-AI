import { Timestamp } from "firebase/firestore";

/**
 * Assessment Types - Simplified assessment using 5 scenario questions
 */

export type Recommendation = "excellent" | "good" | "fair" | "not-recommended";

export interface ScenarioAnswer {
  questionId: string;
  answer: string;
}

export interface ScenarioQuestionOption {
  value: string;
  label: string;
  score: number;  // For compatibility calculation
}

export interface ScenarioQuestion {
  id: string;
  scenario: string;  // The scenario text
  options: ScenarioQuestionOption[];
  traits: string[];  // Which traits this question assesses
}

export interface AssessmentSession {
  id: string;
  catId: string;
  adopterProfileId: string;  // Reference to the profile
  scenarioAnswers: ScenarioAnswer[];
  compatibilityScore: number;
  recommendation: Recommendation;
  createdAt: Timestamp;
  completedAt: Timestamp | null;
}

export interface AssessmentRecord {
  id: string;
  adopterUid: string;
  catId: string;
  adopterProfileId: string;  // Reference to profile at time of assessment
  scenarioAnswers: ScenarioAnswer[];
  compatibilityResult: {
    score: number;
    recommendation: Recommendation;
  };
  createdAt: Timestamp;
  expiresAt: Timestamp;  // Auto-expire after 30 days
}
