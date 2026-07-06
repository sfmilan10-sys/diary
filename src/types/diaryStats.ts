import type { Mood } from './entry';

export interface DiaryStats {
  totalEntries: number;
  entriesThisWeek: number;
  currentStreak: number;
  longestStreak: number;
  mostCommonMoodOverall: Mood | null;
  mostCommonMoodThisWeek: Mood | null;
  uniqueDays: number;
  lastEntryDate: string | null;
}
