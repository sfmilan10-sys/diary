import { getMoodOption } from '../constants/moods';
import type { DiaryEntry, Mood } from '../types/entry';
import type {
  ReflectionContext,
  ReflectionContextEntry,
  ReflectionMoodPattern,
} from '../types/reflection';
import { truncateText } from './format';

const MAX_CONTEXT_ENTRIES = 6;
const TEXT_PREVIEW_MAX = 240;
const REFLECTION_PREVIEW_MAX = 240;
const MAX_RECURRING_INTENTIONS = 3;
const MAX_RECENT_ACTIONS = 4;
const MAX_RECENT_QUOTES = 3;

const MOOD_ORDER: Mood[] = ['heavy', 'low', 'okay', 'good', 'great'];

function emptyMoodCounts(): Record<string, number> {
  return { great: 0, good: 0, okay: 0, low: 0, heavy: 0 };
}

function getMostCommonMood(counts: Record<string, number>): Mood | undefined {
  let best: Mood | undefined;
  let bestCount = 0;

  for (const mood of MOOD_ORDER) {
    const count = counts[mood] ?? 0;
    if (count > bestCount) {
      bestCount = count;
      best = mood;
    }
  }

  return bestCount > 0 ? best : undefined;
}

function buildMoodPattern(entries: DiaryEntry[]): ReflectionMoodPattern {
  const moodCounts = emptyMoodCounts();

  entries.forEach((entry) => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] ?? 0) + 1;
  });

  const mostCommon = getMostCommonMood(moodCounts);

  return {
    totalRecentEntries: entries.length,
    moodCounts,
    mostCommonMood: mostCommon ? getMoodOption(mostCommon).label : undefined,
  };
}

function collectRecurringIntentions(entries: DiaryEntry[]): string[] {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    const intention = entry.intention?.trim();
    if (!intention) {
      continue;
    }
    counts.set(intention, (counts.get(intention) ?? 0) + 1);
  }

  const recurring = [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([intention]) => intention);

  if (recurring.length > 0) {
    return recurring.slice(0, MAX_RECURRING_INTENTIONS);
  }

  const unique: string[] = [];
  for (const entry of entries) {
    const intention = entry.intention?.trim();
    if (!intention || unique.includes(intention)) {
      continue;
    }
    unique.push(intention);
    if (unique.length >= MAX_RECURRING_INTENTIONS) {
      break;
    }
  }

  return unique;
}

function collectUniqueRecent(
  entries: DiaryEntry[],
  field: 'tinyAction' | 'quote',
  max: number,
): string[] {
  const seen = new Set<string>();
  const values: string[] = [];

  for (const entry of entries) {
    const value = entry[field]?.trim();
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    values.push(value);
    if (values.length >= max) {
      break;
    }
  }

  return values;
}

function toContextEntry(entry: DiaryEntry): ReflectionContextEntry {
  const contextEntry: ReflectionContextEntry = {
    date: entry.createdAt,
    mood: entry.mood,
    textPreview: truncateText(entry.text, TEXT_PREVIEW_MAX),
  };

  const intention = entry.intention?.trim();
  if (intention) {
    contextEntry.intention = truncateText(intention, 120);
  }

  const reflectionPreview = entry.reflection?.trim();
  if (reflectionPreview) {
    contextEntry.reflectionPreview = truncateText(reflectionPreview, REFLECTION_PREVIEW_MAX);
  }

  const tinyAction = entry.tinyAction?.trim();
  if (tinyAction) {
    contextEntry.tinyAction = truncateText(tinyAction, 200);
  }

  const affirmation = entry.affirmation?.trim();
  if (affirmation) {
    contextEntry.affirmation = truncateText(affirmation, 200);
  }

  const quote = entry.quote?.trim();
  if (quote) {
    contextEntry.quote = truncateText(quote, 200);
  }

  return contextEntry;
}

export function buildReflectionContext(
  entries: DiaryEntry[],
  limit = MAX_CONTEXT_ENTRIES,
): ReflectionContext {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const recent = sorted.slice(0, limit);

  if (recent.length === 0) {
    return {
      recentEntries: [],
      moodPattern: {
        totalRecentEntries: 0,
        moodCounts: emptyMoodCounts(),
      },
      recurringIntentions: [],
      recentTinyActions: [],
      recentQuotes: [],
    };
  }

  return {
    recentEntries: recent.map(toContextEntry),
    moodPattern: buildMoodPattern(recent),
    recurringIntentions: collectRecurringIntentions(recent),
    recentTinyActions: collectUniqueRecent(recent, 'tinyAction', MAX_RECENT_ACTIONS),
    recentQuotes: collectUniqueRecent(recent, 'quote', MAX_RECENT_QUOTES),
  };
}
