import AsyncStorage from '@react-native-async-storage/async-storage';

import { MOOD_OPTIONS } from '../constants/moods';
import type { DraftEntry, Mood } from '../types/entry';
import { STORAGE_KEYS } from './keys';

const VALID_MOODS = new Set<Mood>(MOOD_OPTIONS.map((option) => option.value));

function isValidMood(value: unknown): value is Mood {
  return typeof value === 'string' && VALID_MOODS.has(value as Mood);
}

function parseStoredDraft(raw: string): DraftEntry | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const draft = parsed as Record<string, unknown>;
    if (!isValidMood(draft.mood) || typeof draft.text !== 'string') {
      return null;
    }

    return {
      mood: draft.mood,
      text: draft.text,
      intention: typeof draft.intention === 'string' ? draft.intention : '',
    };
  } catch {
    return null;
  }
}

export async function loadDraft(): Promise<DraftEntry | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.currentDraft);
  if (!raw) {
    return null;
  }
  return parseStoredDraft(raw);
}

export async function saveDraft(draft: DraftEntry): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.currentDraft,
    JSON.stringify({
      mood: draft.mood,
      text: draft.text,
      intention: draft.intention ?? '',
    }),
  );
}

export async function clearDraft(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.currentDraft);
}

export function hasDraftContent(draft: DraftEntry): boolean {
  return Boolean(draft.text.trim() || draft.intention?.trim());
}
