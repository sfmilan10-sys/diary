import type { Mood } from './entry';

export interface WeekRecapAnalysis {
  weekStart: string;
  weekEnd: string;
  entryCount: number;
  moodCounts: Record<Mood, number>;
  mostCommonMood?: Mood;
  favoriteQuote?: string;
  tinyActions: string[];
  patternNote: string;
  showedUpBy: string[];
}
