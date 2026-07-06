import type { DiaryEntry, Mood } from '../types/entry';

export interface EntryFilterOptions {
  query?: string;
  mood?: Mood | null;
}

function sortNewestFirst(entries: DiaryEntry[]): DiaryEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function filterEntries(
  entries: DiaryEntry[],
  options: EntryFilterOptions = {},
): DiaryEntry[] {
  const query = options.query?.trim().toLowerCase() ?? '';
  const mood = options.mood ?? null;

  return sortNewestFirst(entries).filter((entry) => {
    if (mood && entry.mood !== mood) {
      return false;
    }

    if (!query) {
      return true;
    }

    const searchable = [
      entry.text,
      entry.reflection,
      entry.affirmation,
      entry.quote,
      entry.intention ?? '',
      entry.tinyAction,
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(query);
  });
}
