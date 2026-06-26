export interface DailyCheckIn {
  adoptionId: string;
  day: number;
  ate: boolean;
  drank: boolean;
  hiding: boolean;
  litterUsed: boolean;
  notes?: string;
  timestamp: string;
}
