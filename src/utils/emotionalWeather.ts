import type { DiaryEntry, Mood } from '../types/entry';
import { getEntriesFromLast7Days } from './rollingWeekEntries';

export type EmotionalWeatherTone = 'lighter' | 'steady' | 'tender' | 'mixed';

export function getEmotionalWeatherTone(entries: DiaryEntry[]): EmotionalWeatherTone {
  const recent = getEntriesFromLast7Days(entries);
  const source = recent.length > 0 ? recent : entries;

  if (source.length === 0) {
    return 'mixed';
  }

  const counts = { great: 0, good: 0, okay: 0, low: 0, heavy: 0 };
  source.forEach((entry) => {
    counts[entry.mood] += 1;
  });

  const total = source.length;
  const lightShare = (counts.great + counts.good) / total;
  const okayShare = counts.okay / total;
  const tenderShare = (counts.low + counts.heavy) / total;

  if (lightShare > 0.5) {
    return 'lighter';
  }
  if (okayShare > 0.5) {
    return 'steady';
  }
  if (tenderShare > 0.5) {
    return 'tender';
  }
  return 'mixed';
}

export function getEmotionalWeatherSummary(entries: DiaryEntry[]): string {
  const tone = getEmotionalWeatherTone(entries);

  switch (tone) {
    case 'lighter':
      return 'Your recent emotional weather feels lighter. Notice what has been supporting you.';
    case 'steady':
      return 'Your recent emotional weather feels steady. Not every season needs to be dramatic.';
    case 'tender':
      return 'Your recent emotional weather has been tender. Move gently and ask for support where you can.';
    case 'mixed':
    default:
      return 'Your recent emotional weather has been mixed. That can be a sign you’re moving through something real.';
  }
}

export function getMoodCounts(entries: DiaryEntry[]): Record<Mood, number> {
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

  return counts;
}
