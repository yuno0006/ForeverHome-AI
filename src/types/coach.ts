export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isEmergency?: boolean;
  imagePreview?: string;
}

export interface CoachContext {
  adoptionId: string;
  catId: string;
  currentDay: number;
  checkIns: import("./checkIn").DailyCheckIn[];
  chatHistory: ChatMessage[];
}
