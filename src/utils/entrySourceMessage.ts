import type { DiaryEntry } from '../types/entry';
import { getReflectionSourceMessage } from './reflectionSourceMessage';

export function getEntrySourceMessage(entry: DiaryEntry): string | null {
  if (!entry.reflectionSource) {
    return null;
  }

  return getReflectionSourceMessage({
    reflection: entry.reflection,
    tinyAction: entry.tinyAction,
    affirmation: entry.affirmation,
    quote: entry.quote,
    source: entry.reflectionSource,
    usedFallback: entry.reflectionUsedFallback ?? false,
  });
}
