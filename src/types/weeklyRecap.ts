import type { Mood } from './entry';

export type WeeklyThemeId =
  | 'work'
  | 'relationships'
  | 'health'
  | 'money'
  | 'selfWorth'
  | 'change'
  | 'none';

export interface WeeklyRecap {
  isEmpty: boolean;
  isSoftImpression: boolean;
  totalEntries: number;
  mainMood: Mood | null;
  moodCounts: Record<Mood, number>;
  moodInsight: string;
  patternLabel: string;
  patternInsight: string;
  quoteOfWeek: string | null;
  gentleReminder: string;
  challengeForNextWeek: string;
}
