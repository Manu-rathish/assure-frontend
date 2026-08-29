export interface ExaminationThread {
  id: string;
  name: string;
  auditorLabel: string;
  sortOrder: number;
  askCount: number;
  concernCount: number;
}

export interface ExaminationAsk {
  id: string;
  askCode: string;
  askedAt: string;
  responderName: string | null;
  referenceText: string | null;
  questionText: string;
  responseText: string | null;
  reaction: string | null;
  idrLineId: string | null;
  idrLineRef: string | null;
  adrLineId: string | null;
  adrLineRef: string | null;
}

export interface ExaminationDailyPulse {
  accepted: number;
  probedFurther: number;
  concerns: number;
  followUps: number;
  topConcerns: string[];
}

export type AskReaction = "accepted" | "probed_further" | "concern" | "follow_up";
