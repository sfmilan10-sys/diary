import type { DiaryEntry } from '../types/entry';

/** Monday 00:00:00 local — weekOffset 0 = current calendar week. */
export function getWeekRangeForOffset(weekOffset: number): {
  start: Date;
  end: Date;
  weekStart: string;
  weekEnd: string;
} {
  const now = new Date();
  const start = startOfCalendarWeek(now);
  start.setDate(start.getDate() + weekOffset * 7);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
    weekStart: start.toISOString(),
    weekEnd: end.toISOString(),
  };
}

function startOfCalendarWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  result.setDate(result.getDate() - daysFromMonday);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function canNavigateToNextWeek(weekOffset: number): boolean {
  return weekOffset < 0;
}

export function filterEntriesInWeek(
  entries: DiaryEntry[],
  weekOffset: number,
): DiaryEntry[] {
  const { start, end } = getWeekRangeForOffset(weekOffset);
  const startMs = start.getTime();
  const endMs = end.getTime();

  return entries
    .filter((entry) => {
      const time = new Date(entry.createdAt).getTime();
      return time >= startMs && time <= endMs;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function formatWeekDateRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  const startOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };
  const endOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  if (!sameYear) {
    return `${start.toLocaleDateString(undefined, { ...startOptions, year: 'numeric' })} – ${end.toLocaleDateString(undefined, endOptions)}`;
  }

  if (sameMonth) {
    return `${start.toLocaleDateString(undefined, startOptions)} – ${end.getDate()}, ${end.getFullYear()}`;
  }

  return `${start.toLocaleDateString(undefined, startOptions)} – ${end.toLocaleDateString(undefined, endOptions)}`;
}
