export interface Concern {
  ruleId: string;
  severity: "significant" | "moderate";
  description: string;
  triggeredBy: string;
}

export interface Strength {
  description: string;
}

export interface Mitigation {
  description: string;
}

export interface CompatibilityResult {
  level: "low" | "moderate" | "high";
  concerns: Concern[];
  strengths: Strength[];
  mitigations: Mitigation[];
  requiresShelterReview: boolean;
  alternativeCatIds: string[];
}

export interface Match {
  id: string;
  catId: string;
  adopterId?: string;
  adopterProfileId?: string;
  adopterAnswers: import("./adopter").AdopterAnswers;
  result: CompatibilityResult;
  timestamp: string;
}
