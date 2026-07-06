import type { DiaryEntry } from '../types/entry';

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * MS_IN_DAY;

/** Rolling last 7 days — used by Home stats, not calendar-week recap. */
export function getEntriesFromLast7Days(entries: DiaryEntry[]): DiaryEntry[] {
  const cutoff = Date.now() - WEEK_MS;
  return entries
    .filter((entry) => new Date(entry.createdAt).getTime() >= cutoff)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
