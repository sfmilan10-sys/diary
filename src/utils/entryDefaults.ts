import type { DiaryEntry } from '../types/entry';

export const LEGACY_AFFIRMATION = 'You are allowed to be in the middle of becoming.';
export const LEGACY_QUOTE = 'Your future self is built by small promises kept gently.';

export function withEntryDefaults(
  entry: Omit<DiaryEntry, 'affirmation' | 'quote'> & Partial<Pick<DiaryEntry, 'affirmation' | 'quote'>>,
): DiaryEntry {
  return {
    ...entry,
    affirmation: entry.affirmation?.trim() || LEGACY_AFFIRMATION,
    quote: entry.quote?.trim() || LEGACY_QUOTE,
  };
}
