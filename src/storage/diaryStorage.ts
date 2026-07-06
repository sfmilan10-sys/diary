import AsyncStorage from '@react-native-async-storage/async-storage';

import { MOOD_OPTIONS } from '../constants/moods';
import type { DiaryEntry, Mood } from '../types/entry';
import { withEntryDefaults } from '../utils/entryDefaults';
import { STORAGE_KEYS } from './keys';

const VALID_MOODS = new Set<Mood>(MOOD_OPTIONS.map((option) => option.value));

function isValidMood(value: unknown): value is Mood {
  return typeof value === 'string' && VALID_MOODS.has(value as Mood);
}

function isStoredEntry(value: unknown): value is Omit<DiaryEntry, 'affirmation' | 'quote'> & Partial<Pick<DiaryEntry, 'affirmation' | 'quote'>> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.id === 'string' &&
    isValidMood(entry.mood) &&
    typeof entry.text === 'string' &&
    typeof entry.reflection === 'string' &&
    typeof entry.tinyAction === 'string' &&
    typeof entry.createdAt === 'string' &&
    !Number.isNaN(Date.parse(entry.createdAt)) &&
    (entry.affirmation === undefined || typeof entry.affirmation === 'string') &&
    (entry.quote === undefined || typeof entry.quote === 'string') &&
    (entry.intention === undefined || typeof entry.intention === 'string') &&
    (entry.reflectionSource === undefined ||
      entry.reflectionSource === 'local' ||
      entry.reflectionSource === 'remote') &&
    (entry.reflectionUsedFallback === undefined ||
      typeof entry.reflectionUsedFallback === 'boolean')
  );
}

export function parseStoredEntries(raw: string): DiaryEntry[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isStoredEntry).map(withEntryDefaults);
  } catch {
    return [];
  }
}

export async function loadEntries(): Promise<DiaryEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.entries);
  if (!raw) {
    return [];
  }
  return parseStoredEntries(raw);
}

export async function saveEntries(entries: DiaryEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries));
}

export async function loadOnboardingCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.onboardingCompleted);
  return value === 'true';
}

export async function saveOnboardingCompleted(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, 'true');
}
