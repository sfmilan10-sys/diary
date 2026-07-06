import type { DiaryEntry, Mood } from '../types/entry';
import type { DiaryStats } from '../types/diaryStats';
import { getEntriesFromLast7Days } from './rollingWeekEntries';

const MOOD_ORDER: Mood[] = ['heavy', 'low', 'okay', 'good', 'great'];
const MS_IN_DAY = 24 * 60 * 60 * 1000;

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export function toDateKey(isoDate: string): string {
  return dateToKey(new Date(isoDate));
}

function dateToKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function todayDateKey(): string {
  return toDateKey(new Date().toISOString());
}

function yesterdayDateKey(): string {
  return toDateKey(addDays(new Date(), -1).toISOString());
}

function getUniqueSortedDayKeys(entries: DiaryEntry[]): string[] {
  const keys = new Set(entries.map((entry) => toDateKey(entry.createdAt)));
  return Array.from(keys).sort();
}

function countStreakEndingOn(endDayKey: string, daySet: Set<string>): number {
  let count = 0;
  let current = parseDateKey(endDayKey);

  while (daySet.has(dateToKey(current))) {
    count += 1;
    current = addDays(current, -1);
  }

  return count;
}

function getCurrentStreak(dayKeys: string[]): number {
  if (dayKeys.length === 0) {
    return 0;
  }

  const daySet = new Set(dayKeys);
  const todayKey = todayDateKey();
  const yesterdayKey = yesterdayDateKey();

  let endKey: string | null = null;
  if (daySet.has(todayKey)) {
    endKey = todayKey;
  } else if (daySet.has(yesterdayKey)) {
    endKey = yesterdayKey;
  }

  if (!endKey) {
    return 0;
  }

  return countStreakEndingOn(endKey, daySet);
}

function getLongestStreak(dayKeys: string[]): number {
  if (dayKeys.length === 0) {
    return 0;
  }

  const daySet = new Set(dayKeys);
  let longest = 0;

  for (const key of dayKeys) {
    const previousKey = dateToKey(addDays(parseDateKey(key), -1));
    if (!daySet.has(previousKey)) {
      longest = Math.max(longest, countStreakEndingOn(key, daySet));
    }
  }

  return longest;
}

function getMostCommonMood(entries: DiaryEntry[]): Mood | null {
  if (entries.length === 0) {
    return null;
  }

  const counts: Record<Mood, number> = {
    great: 0,
    good: 0,
    okay: 0,
    low: 0,
    heavy: 0,
  };

  entries.forEach((entry) => {
    counts[entry.mood] += 1;
  });

  let best: Mood | null = null;
  let bestCount = 0;

  for (const mood of MOOD_ORDER) {
    if (counts[mood] > bestCount) {
      bestCount = counts[mood];
      best = mood;
    }
  }

  return best;
}

export function formatLastCheckIn(isoDate: string | null): string {
  if (!isoDate) {
    return 'Not yet';
  }

  const date = new Date(isoDate);
  const todayKey = todayDateKey();
  const entryKey = toDateKey(isoDate);

  if (entryKey === todayKey) {
    return 'Today';
  }

  if (entryKey === yesterdayDateKey()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRhythmMessage(streak: number): string {
  if (streak === 0) {
    return 'No pressure — your diary is here whenever you return.';
  }
  if (streak === 1) {
    return "You've checked in recently. One honest page counts.";
  }
  return `You've checked in ${streak} day${streak === 1 ? '' : 's'} in a row.`;
}

export function calculateDiaryStats(entries: DiaryEntry[]): DiaryStats {
  const dayKeys = getUniqueSortedDayKeys(entries);
  const weekEntries = getEntriesFromLast7Days(entries);
  const sortedByDate = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    totalEntries: entries.length,
    entriesThisWeek: weekEntries.length,
    currentStreak: getCurrentStreak(dayKeys),
    longestStreak: getLongestStreak(dayKeys),
    mostCommonMoodOverall: getMostCommonMood(entries),
    mostCommonMoodThisWeek: getMostCommonMood(weekEntries),
    uniqueDays: dayKeys.length,
    lastEntryDate: sortedByDate[0]?.createdAt ?? null,
  };
}
