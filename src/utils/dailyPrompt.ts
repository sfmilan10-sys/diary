export const DAILY_PROMPTS = [
  'What felt heavier than expected today?',
  'What is one small thing you handled well?',
  'What do you want tomorrow-you to remember?',
  'Where did you feel most like yourself today?',
  'What can you release before sleeping?',
  'What would feel like relief right now?',
  'What am I proud of that nobody saw?',
  'What part of me needs more patience?',
  'What would kindness look like in the next hour?',
  'What would my future self thank me for today?',
  'What felt small but actually mattered?',
  'What do I need less of right now?',
  'What do I need more of right now?',
  'What truth am I almost ready to say?',
  'What would “enough” look like tonight?',
] as const;

function dayIndex(date: Date): number {
  return date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
}

/** Same prompt all day; changes at local midnight. */
export function getDailyPrompt(date: Date = new Date()): string {
  return DAILY_PROMPTS[dayIndex(date) % DAILY_PROMPTS.length];
}

/** Inserts when empty; appends with spacing when draft already has text. */
export function applyPromptToText(currentText: string, prompt: string): string {
  const trimmed = currentText.trim();
  if (!trimmed) {
    return prompt;
  }
  return `${trimmed}\n\n${prompt}`;
}
