import type { ReflectionResult } from '../types/reflection';

/**
 * High-precision phrases only. We deliberately keep this conservative to avoid
 * alarming false positives on ordinary hard-day journaling (e.g. "this is
 * killing me" is intentionally NOT matched). This is a gentle signpost, not a
 * diagnosis and not a crisis service.
 */
const CRISIS_PATTERNS: RegExp[] = [
  /\bkill(ing)?\s+my\s?self\b/i,
  /\bend(ing)?\s+my\s+life\b/i,
  /\btake\s+my\s+own\s+life\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(be\s+(here|alive)|live)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(live|living|being here)\b/i,
  /\bsuicid(e|al)\b/i,
  /\b(hurt|harm)(ing)?\s+my\s?self\b/i,
  /\bself[-\s]?harm\b/i,
];

export function detectPossibleCrisis(text: string): boolean {
  if (!text) {
    return false;
  }
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Calm, non-alarming support note shown alongside any reflection when the
 * current entry suggests the user may be in crisis. Careful wording: it does
 * not claim the app can help in an emergency.
 */
export const CRISIS_SUPPORT_NOTE =
  "If you're thinking about harming yourself, you don't have to face it alone. Reaching out to someone you trust, or contacting your local emergency services, is a brave and human thing to do right now.";

/**
 * Local-fallback reflection used when the device is offline and the entry
 * suggests crisis. Stays in the gentle "Future Me" voice, encourages real-world
 * contact, and avoids advice/diagnosis.
 */
export function buildCrisisLocalReflection(): ReflectionResult {
  return {
    reflection:
      "What you wrote sounds really heavy, and I'm glad you put it into words instead of carrying it in silence. You don't have to get through this moment alone — reaching out to someone you trust, or your local emergency services, is a strong thing to do, not a weak one. I'm still here, and so is the version of you that makes it through tonight.",
    tinyAction:
      'Right now, message or call one person you trust — or save your local emergency number somewhere easy to reach.',
    affirmation: 'Reaching for support is one of the bravest things I can do.',
    quote: 'Even on the hardest nights, staying and asking for help is a kind of courage.',
  };
}
