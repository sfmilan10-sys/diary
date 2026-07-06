export const MIN_JOURNAL_LENGTH = 12;

// Keep in sync with backend validation (MAX_TEXT_LENGTH / MAX_INTENTION_LENGTH).
export const MAX_JOURNAL_LENGTH = 4000;
export const MAX_INTENTION_LENGTH = 500;
export const JOURNAL_COUNTER_THRESHOLD = 3500;
export const INTENTION_COUNTER_THRESHOLD = 400;

export function canReflectWithText(text: string): boolean {
  return text.trim().length >= MIN_JOURNAL_LENGTH;
}

export function getReflectDisabledHint(text: string): string {
  if (!text.trim()) {
    return 'Write a few lines to reflect.';
  }
  if (!canReflectWithText(text)) {
    return 'Write a few lines to reflect.';
  }
  return '';
}
