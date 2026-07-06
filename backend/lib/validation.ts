export const VALID_MOODS = ['great', 'good', 'okay', 'low', 'heavy'] as const;
export type ValidMood = (typeof VALID_MOODS)[number];

export const MAX_TEXT_LENGTH = 4000;
export const MAX_INTENTION_LENGTH = 500;
export const MAX_RECENT_ENTRIES = 8;
export const MAX_PREVIEW_LENGTH = 300;
export const MAX_CONTEXT_ARRAY_LENGTH = 5;
export const MAX_REFLECTION_LENGTH = 2000;
export const MAX_FIELD_LENGTH = 500;

/** @deprecated Legacy recent entry shape */
export interface RecentEntryInput {
  mood: ValidMood;
  text: string;
  createdAt: string;
  reflectionPreview?: string;
}

export interface ReflectionContextEntryInput {
  date: string;
  mood?: string;
  textPreview: string;
  intention?: string;
  reflectionPreview?: string;
  tinyAction?: string;
  affirmation?: string;
  quote?: string;
}

export interface ReflectionMoodPatternInput {
  totalRecentEntries: number;
  moodCounts: Record<string, number>;
  mostCommonMood?: string;
}

export interface ReflectionContextInput {
  recentEntries: ReflectionContextEntryInput[];
  moodPattern: ReflectionMoodPatternInput;
  recurringIntentions: string[];
  recentTinyActions: string[];
  recentQuotes: string[];
}

export interface ReflectionRequestInput {
  mood: ValidMood;
  text: string;
  intention?: string;
  recentEntries: RecentEntryInput[];
  reflectionContext?: ReflectionContextInput;
}

export interface ValidationError {
  error: string;
  details?: string;
}

export interface ReflectionResponseShape {
  reflection: string;
  tinyAction: string;
  affirmation: string;
  quote: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeMood(value: unknown): ValidMood | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return (VALID_MOODS as readonly string[]).includes(normalized)
    ? (normalized as ValidMood)
    : null;
}

function isValidIsoDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function trimString(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.slice(0, max);
}

function trimRequiredString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.slice(0, max);
}

function trimStringArray(value: unknown, maxItems: number, maxItemLength: number): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const result: string[] = [];
  for (const item of value.slice(0, maxItems)) {
    const trimmed = trimString(item, maxItemLength);
    if (trimmed) {
      result.push(trimmed);
    }
  }
  return result;
}

function parseContextEntry(value: unknown): ReflectionContextEntryInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const date = trimRequiredString(value.date, 40);
  const textPreview = trimRequiredString(value.textPreview, MAX_PREVIEW_LENGTH);

  if (!date || !textPreview || !isValidIsoDate(date)) {
    return null;
  }

  const mood = typeof value.mood === 'string' ? value.mood.trim().slice(0, 20) : undefined;

  return {
    date,
    textPreview,
    ...(mood ? { mood } : {}),
    ...(trimString(value.intention, MAX_FIELD_LENGTH)
      ? { intention: trimString(value.intention, MAX_FIELD_LENGTH) }
      : {}),
    ...(trimString(value.reflectionPreview, MAX_PREVIEW_LENGTH)
      ? { reflectionPreview: trimString(value.reflectionPreview, MAX_PREVIEW_LENGTH) }
      : {}),
    ...(trimString(value.tinyAction, MAX_FIELD_LENGTH)
      ? { tinyAction: trimString(value.tinyAction, MAX_FIELD_LENGTH) }
      : {}),
    ...(trimString(value.affirmation, MAX_FIELD_LENGTH)
      ? { affirmation: trimString(value.affirmation, MAX_FIELD_LENGTH) }
      : {}),
    ...(trimString(value.quote, MAX_FIELD_LENGTH)
      ? { quote: trimString(value.quote, MAX_FIELD_LENGTH) }
      : {}),
  };
}

function parseMoodPattern(value: unknown): ReflectionMoodPatternInput {
  if (!isRecord(value)) {
    return { totalRecentEntries: 0, moodCounts: {} };
  }

  const moodCounts: Record<string, number> = {};
  if (isRecord(value.moodCounts)) {
    for (const [key, count] of Object.entries(value.moodCounts)) {
      if (typeof count === 'number' && count >= 0) {
        moodCounts[key.slice(0, 20)] = Math.min(count, 99);
      }
    }
  }

  const totalRecentEntries =
    typeof value.totalRecentEntries === 'number'
      ? Math.min(Math.max(0, value.totalRecentEntries), MAX_RECENT_ENTRIES)
      : 0;

  const mostCommonMood = trimString(value.mostCommonMood, 20);

  return {
    totalRecentEntries,
    moodCounts,
    ...(mostCommonMood ? { mostCommonMood } : {}),
  };
}

function parseReflectionContext(value: unknown): ReflectionContextInput | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const recentEntries: ReflectionContextEntryInput[] = [];
  if (Array.isArray(value.recentEntries)) {
    for (const item of value.recentEntries.slice(0, MAX_RECENT_ENTRIES)) {
      const parsed = parseContextEntry(item);
      if (parsed) {
        recentEntries.push(parsed);
      }
    }
  }

  return {
    recentEntries,
    moodPattern: parseMoodPattern(value.moodPattern),
    recurringIntentions: trimStringArray(
      value.recurringIntentions,
      MAX_CONTEXT_ARRAY_LENGTH,
      MAX_FIELD_LENGTH,
    ),
    recentTinyActions: trimStringArray(
      value.recentTinyActions,
      MAX_CONTEXT_ARRAY_LENGTH,
      MAX_FIELD_LENGTH,
    ),
    recentQuotes: trimStringArray(value.recentQuotes, MAX_CONTEXT_ARRAY_LENGTH, MAX_FIELD_LENGTH),
  };
}

function parseRecentEntry(value: unknown): RecentEntryInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const mood = normalizeMood(value.mood);
  const text = trimRequiredString(value.text, MAX_PREVIEW_LENGTH);
  const createdAt = trimRequiredString(value.createdAt, 40);

  if (!mood || !text || !createdAt || !isValidIsoDate(createdAt)) {
    return null;
  }

  const reflectionPreview = trimString(value.reflectionPreview, MAX_PREVIEW_LENGTH);

  return {
    mood,
    text,
    createdAt,
    ...(reflectionPreview ? { reflectionPreview } : {}),
  };
}

export function validateReflectionRequest(
  body: unknown,
): ReflectionRequestInput | ValidationError {
  if (!isRecord(body)) {
    return { error: 'Invalid request body', details: 'Expected a JSON object.' };
  }

  const mood = normalizeMood(body.mood);
  const text = typeof body.text === 'string' ? body.text.trim().slice(0, MAX_TEXT_LENGTH) : '';

  if (!mood) {
    return {
      error: 'Invalid mood',
      details: `Mood must be one of: ${VALID_MOODS.join(', ')}`,
    };
  }

  if (!text) {
    return { error: 'Invalid text', details: 'Journal text is required.' };
  }

  let intention: string | undefined;
  if (body.intention !== undefined && body.intention !== null) {
    if (typeof body.intention !== 'string') {
      return { error: 'Invalid intention', details: 'Intention must be a string.' };
    }
    const trimmed = body.intention.trim().slice(0, MAX_INTENTION_LENGTH);
    intention = trimmed || undefined;
  }

  const recentEntries: RecentEntryInput[] = [];
  if (body.recentEntries !== undefined && body.recentEntries !== null) {
    if (!Array.isArray(body.recentEntries)) {
      return {
        error: 'Invalid recentEntries',
        details: 'recentEntries must be an array.',
      };
    }

    for (const item of body.recentEntries.slice(0, MAX_RECENT_ENTRIES)) {
      const parsed = parseRecentEntry(item);
      if (parsed) {
        recentEntries.push(parsed);
      }
    }
  }

  const reflectionContext = parseReflectionContext(body.reflectionContext);

  return {
    mood,
    text,
    intention,
    recentEntries,
    reflectionContext,
  };
}

export function validateReflectionResponse(
  value: unknown,
): ReflectionResponseShape | null {
  if (!isRecord(value)) {
    return null;
  }

  const reflection =
    typeof value.reflection === 'string'
      ? value.reflection.trim().slice(0, MAX_REFLECTION_LENGTH)
      : '';
  const tinyAction =
    typeof value.tinyAction === 'string'
      ? value.tinyAction.trim().slice(0, MAX_FIELD_LENGTH)
      : '';
  const affirmation =
    typeof value.affirmation === 'string'
      ? value.affirmation.trim().slice(0, MAX_FIELD_LENGTH)
      : '';
  const quote =
    typeof value.quote === 'string' ? value.quote.trim().slice(0, MAX_FIELD_LENGTH) : '';

  if (!reflection || !tinyAction || !affirmation || !quote) {
    return null;
  }

  return { reflection, tinyAction, affirmation, quote };
}
