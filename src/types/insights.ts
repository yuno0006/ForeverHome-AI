export interface CatAttention {
  catId: string;
  catName: string;
  day: number;
  reason: string;
}

export interface CommonConcern {
  description: string;
  count: number;
}

export interface ShelterInsights {
  activeAdoptions: number;
  averageTimeToAdoption: number;
  highConcernsReviewed: number;
  adopterSatisfaction: number;
  catsNeedingAttention: CatAttention[];
  commonConcerns: CommonConcern[];
}
