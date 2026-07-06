import type { ReflectionResult, ReflectionSource } from './reflection';

export type Mood = 'great' | 'good' | 'okay' | 'low' | 'heavy';

/** @deprecated Use ReflectionResult from ./reflection */
export type LocalReflection = ReflectionResult;

export interface DiaryEntry {
  id: string;
  mood: Mood;
  text: string;
  reflection: string;
  tinyAction: string;
  affirmation: string;
  quote: string;
  createdAt: string;
  intention?: string;
  reflectionSource?: ReflectionSource;
  reflectionUsedFallback?: boolean;
}

export interface DraftEntry {
  mood: Mood;
  text: string;
  intention?: string;
}

export interface EntryUpdates {
  text?: string;
  intention?: string;
}
