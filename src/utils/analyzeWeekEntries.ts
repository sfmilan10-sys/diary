import { getMoodOption } from '../constants/moods';
import type { DiaryEntry, Mood } from '../types/entry';
import type { WeekRecapAnalysis } from '../types/weekRecap';
import { LEGACY_QUOTE } from './entryDefaults';
import { filterEntriesInWeek, getWeekRangeForOffset } from './weekBounds';

const MOOD_ORDER: Mood[] = ['heavy', 'low', 'okay', 'good', 'great'];

function emptyMoodCounts(): Record<Mood, number> {
  return { great: 0, good: 0, okay: 0, low: 0, heavy: 0 };
}

function getMostCommonMood(counts: Record<Mood, number>): Mood | undefined {
  let best: Mood | undefined;
  let bestCount = 0;

  for (const mood of MOOD_ORDER) {
    const count = counts[mood];
    if (count > bestCount) {
      bestCount = count;
      best = mood;
    }
  }

  return bestCount > 0 ? best : undefined;
}

function countActiveMoods(counts: Record<Mood, number>): number {
  return MOOD_ORDER.filter((mood) => counts[mood] > 0).length;
}

function moodDominates(counts: Record<Mood, number>, total: number): Mood | undefined {
  if (total < 2) {
    return undefined;
  }

  const top = getMostCommonMood(counts);
  if (!top) {
    return undefined;
  }

  const topCount = counts[top];
  const others = total - topCount;

  if (topCount > others) {
    return top;
  }

  return undefined;
}

function buildPatternNote(
  entryCount: number,
  counts: Record<Mood, number>,
  dominatingMood?: Mood,
): string {
  if (entryCount === 0) {
    return 'No pattern yet — just an open page waiting for you.';
  }

  if (entryCount === 1) {
    return 'One honest page this week — a quiet start, not a verdict on who you are.';
  }

  const notes: string[] = [];
  const activeMoods = countActiveMoods(counts);

  if (entryCount >= 4) {
    notes.push('You kept returning to yourself this week, and that matters.');
  }

  if (dominatingMood) {
    const label = getMoodOption(dominatingMood).label.toLowerCase();
    notes.push(
      `This week carried a lot of ${label}. Notice what helped you move through it.`,
    );
  } else if (activeMoods > 1) {
    notes.push(
      'This week had range. You made space for more than one version of yourself.',
    );
  } else if (entryCount >= 2) {
    notes.push('A steady thread ran through this week — worth noticing without rushing to fix it.');
  }

  return notes.join(' ');
}

function buildShowedUpBy(weekEntries: DiaryEntry[]): string[] {
  if (weekEntries.length === 0) {
    return [];
  }

  const items: string[] = [];
  const uniqueDays = new Set(
    weekEntries.map((entry) => new Date(entry.createdAt).toDateString()),
  );

  items.push('Showing up in your diary, even briefly');

  if (uniqueDays.size >= 2) {
    items.push('Returning on more than one day');
  }

  if (weekEntries.some((entry) => entry.intention?.trim())) {
    items.push('Naming a gentle intention for tomorrow');
  }

  if (weekEntries.some((entry) => entry.tinyAction?.trim())) {
    items.push('Keeping a tiny action from Future You nearby');
  }

  if (weekEntries.some((entry) => entry.mood === 'heavy' || entry.mood === 'low')) {
    items.push('Writing honestly on a heavier day');
  }

  return items.slice(0, 3);
}

function pickFavoriteQuote(weekEntries: DiaryEntry[]): string | undefined {
  for (const entry of weekEntries) {
    const quote = entry.quote?.trim();
    if (quote && quote !== LEGACY_QUOTE) {
      return quote;
    }
  }

  const fallback = weekEntries[0]?.quote?.trim();
  return fallback || undefined;
}

function collectTinyActions(weekEntries: DiaryEntry[]): string[] {
  const seen = new Set<string>();
  const actions: string[] = [];

  for (const entry of weekEntries) {
    const action = entry.tinyAction?.trim();
    if (!action || seen.has(action)) {
      continue;
    }
    seen.add(action);
    actions.push(action);
    if (actions.length >= 3) {
      break;
    }
  }

  return actions;
}

export function analyzeWeekEntries(
  allEntries: DiaryEntry[],
  weekOffset = 0,
): WeekRecapAnalysis {
  const { weekStart, weekEnd } = getWeekRangeForOffset(weekOffset);
  const weekEntries = filterEntriesInWeek(allEntries, weekOffset);
  const entryCount = weekEntries.length;
  const moodCounts = emptyMoodCounts();

  weekEntries.forEach((entry) => {
    moodCounts[entry.mood] += 1;
  });

  const mostCommonMood = getMostCommonMood(moodCounts);
  const dominatingMood = moodDominates(moodCounts, entryCount);

  return {
    weekStart,
    weekEnd,
    entryCount,
    moodCounts,
    mostCommonMood,
    favoriteQuote: pickFavoriteQuote(weekEntries),
    tinyActions: collectTinyActions(weekEntries),
    patternNote: buildPatternNote(entryCount, moodCounts, dominatingMood),
    showedUpBy: buildShowedUpBy(weekEntries),
  };
}
