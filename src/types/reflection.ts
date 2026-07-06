import type { Mood } from './entry';

export interface ReflectionResult {
  reflection: string;
  tinyAction: string;
  affirmation: string;
  quote: string;
}

/** @deprecated Legacy shape — prefer ReflectionContextEntry */
export interface RecentEntryContext {
  mood: Mood;
  text: string;
  createdAt: string;
  reflectionPreview?: string;
}

export interface ReflectionContextEntry {
  date: string;
  mood?: string;
  textPreview: string;
  intention?: string;
  reflectionPreview?: string;
  tinyAction?: string;
  affirmation?: string;
  quote?: string;
}

export interface ReflectionMoodPattern {
  totalRecentEntries: number;
  moodCounts: Record<string, number>;
  mostCommonMood?: string;
}

export interface ReflectionContext {
  recentEntries: ReflectionContextEntry[];
  moodPattern: ReflectionMoodPattern;
  recurringIntentions: string[];
  recentTinyActions: string[];
  recentQuotes: string[];
}

export interface AIReflectionInput {
  mood: Mood;
  text: string;
  intention?: string;
  /** @deprecated Use reflectionContext */
  recentEntries?: RecentEntryContext[];
  reflectionContext?: ReflectionContext;
}

export type ReflectionSource = 'local' | 'remote';

export interface FutureSelfReflectionResult extends ReflectionResult {
  source: ReflectionSource;
  usedFallback: boolean;
}
